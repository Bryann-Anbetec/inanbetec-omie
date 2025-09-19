import { Request, Response } from "express";
import { BAD_REQUEST, OK, INTERNAL_SERVER_ERROR } from 'http-status';

import EmpresaService from "../empresas/empresa.service";
import OmieService from "../omie/omie.service";
import Empresa from "../empresas/empresa.model";

interface ClienteRequest extends Request {
  body: Empresa & {
    usuarioLogado?: any;
  };
}

interface SyncRequest extends Request {
  body: {
    empresaIds?: string[];
    sincronizarTodos?: boolean;
  };
}

class ClienteController {
  /**
   * POST /clientes/cadastrar
   * Cadastra cliente no InAnbetec e automaticamente no Omie
   */
  async cadastrar(req: ClienteRequest, res: Response) {
    try {
      const empresa: Empresa = req.body;

      // 1. Validação básica
      if (!empresa.nome || !empresa.cnpj) {
        return res.status(BAD_REQUEST).json({
          error: "Nome e CNPJ são obrigatórios"
        });
      }

      // 2. Salva no InAnbetec primeiro
      const resultadoInAnbetec = await EmpresaService.salvar(empresa);
      
      if (resultadoInAnbetec.status !== OK) {
        return res.status(resultadoInAnbetec.status).json({
          error: resultadoInAnbetec.message
        });
      }

      // 3. Tenta sincronizar com Omie
      let omieResultado = null;
      try {
        // Usa a empresa com ID do resultado do InAnbetec
        const empresaComId = { ...empresa, _id: resultadoInAnbetec.result._id } as any;
        omieResultado = await OmieService.sincronizarClienteComRetry(empresaComId);
        
        return res.status(OK).json({
          message: "Cliente cadastrado com sucesso",
          inanbetec: resultadoInAnbetec.result,
          omie: {
            sincronizado: omieResultado.sucesso,
            codigoClienteOmie: omieResultado.codigoClienteOmie,
            acao: omieResultado.acao,
            error: omieResultado.error
          }
        });
        
      } catch (omieError: any) {
        // Se falhar no Omie, ainda retorna sucesso do InAnbetec mas com aviso
        return res.status(OK).json({
          message: "Cliente cadastrado no InAnbetec, mas falha na sincronização com Omie",
          inanbetec: resultadoInAnbetec.result,
          omie: {
            sincronizado: false,
            error: omieError.message
          }
        });
      }

    } catch (error: any) {
      return res.status(INTERNAL_SERVER_ERROR).json({
        error: `Erro interno: ${error.message}`
      });
    }
  }

  /**
   * PUT /clientes/alterar/:id
   * Altera cliente no InAnbetec e Omie
   */
  async alterar(req: ClienteRequest, res: Response) {
    try {
      const { id } = req.params;
      const empresa: Empresa = req.body;
      const { usuarioLogado } = req.body;

      // 1. Validação básica
      if (!id) {
        return res.status(BAD_REQUEST).json({
          error: "ID é obrigatório"
        });
      }

      // 2. Recupera empresa atual para verificar se existe
      const empresaAtual = await EmpresaService.recuperar(id);
      if (empresaAtual.status !== OK) {
        return res.status(empresaAtual.status).json({
          error: "Empresa não encontrada"
        });
      }

      // 3. Atualiza no InAnbetec
      const resultadoInAnbetec = await EmpresaService.editar(id, empresa, usuarioLogado);
      
      if (resultadoInAnbetec.status !== OK) {
        return res.status(resultadoInAnbetec.status).json({
          error: resultadoInAnbetec.message
        });
      }

      // 4. Tenta sincronizar com Omie
      let omieResultado = null;
      try {
        // Primeiro consulta se existe no Omie
        const codigoIntegracao = `inanbetec_${id}`;
        const clienteOmie = await OmieService.consultarClientePorIntegracao(codigoIntegracao);
        
        if (clienteOmie && clienteOmie.codigo_cliente_omie) {
          // Cliente existe no Omie, atualiza
          const empresaComId = { ...empresa, _id: id } as any;
          const response = await OmieService.alterarCliente(empresaComId, clienteOmie.codigo_cliente_omie);
          omieResultado = {
            sincronizado: true,
            codigoClienteOmie: clienteOmie.codigo_cliente_omie,
            acao: 'atualizado' as const
          };
        } else {
          // Cliente não existe no Omie, inclui
          const empresaComId = { ...empresa, _id: id } as any;
          omieResultado = await OmieService.sincronizarClienteComRetry(empresaComId);
        }
        
        return res.status(OK).json({
          message: "Cliente alterado com sucesso",
          inanbetec: resultadoInAnbetec.result,
          omie: omieResultado
        });
        
      } catch (omieError: any) {
        // Se falhar no Omie, ainda retorna sucesso do InAnbetec mas com aviso
        return res.status(OK).json({
          message: "Cliente alterado no InAnbetec, mas falha na sincronização com Omie",
          inanbetec: resultadoInAnbetec.result,
          omie: {
            sincronizado: false,
            error: omieError.message
          }
        });
      }

    } catch (error: any) {
      return res.status(INTERNAL_SERVER_ERROR).json({
        error: `Erro interno: ${error.message}`
      });
    }
  }

  /**
   * POST /clientes/sincronizar
   * Sincroniza empresas existentes do InAnbetec com Omie
   */
  async sincronizar(req: SyncRequest, res: Response) {
    try {
      const { empresaIds, sincronizarTodos } = req.body;

      let empresas: any[] = [];

      if (sincronizarTodos) {
        // Busca todas as empresas ativas
        const resultado = await EmpresaService.recuperarTodos();
        if (resultado.status !== OK) {
          return res.status(resultado.status).json({
            error: "Erro ao recuperar empresas"
          });
        }
        empresas = resultado.result;
      } else if (empresaIds && empresaIds.length > 0) {
        // Busca empresas específicas
        for (const id of empresaIds) {
          const resultado = await EmpresaService.recuperar(id);
          if (resultado.status === OK) {
            empresas.push(resultado.result);
          }
        }
      } else {
        return res.status(BAD_REQUEST).json({
          error: "Informe empresaIds ou sincronizarTodos=true"
        });
      }

      // Sincroniza cada empresa
      const resultados = [];
      let sucessos = 0;
      let falhas = 0;

      for (const empresa of empresas) {
        try {
          const resultado = await OmieService.sincronizarClienteComRetry(empresa);
          resultados.push({
            empresaId: empresa._id,
            nome: empresa.nome,
            cnpj: empresa.cnpj,
            ...resultado
          });
          
          if (resultado.sucesso) {
            sucessos++;
          } else {
            falhas++;
          }
        } catch (error: any) {
          resultados.push({
            empresaId: empresa._id,
            nome: empresa.nome,
            cnpj: empresa.cnpj,
            sucesso: false,
            acao: 'incluido' as const,
            error: error.message
          });
          falhas++;
        }
      }

      return res.status(OK).json({
        message: `Sincronização concluída: ${sucessos} sucessos, ${falhas} falhas`,
        resumo: {
          total: empresas.length,
          sucessos,
          falhas
        },
        resultados
      });

    } catch (error: any) {
      return res.status(INTERNAL_SERVER_ERROR).json({
        error: `Erro interno: ${error.message}`
      });
    }
  }

  /**
   * GET /clientes/omie/consultar/:cnpj
   * Consulta cliente no Omie por CNPJ
   */
  async consultarOmie(req: Request, res: Response) {
    try {
      const { cnpj } = req.params;

      if (!cnpj) {
        return res.status(BAD_REQUEST).json({
          error: "CNPJ é obrigatório"
        });
      }

      const resultado = await OmieService.consultarClientePorCNPJ(cnpj);
      
      if (!resultado) {
        return res.status(404).json({
          message: "Cliente não encontrado no Omie",
          cnpj
        });
      }

      return res.status(OK).json({
        message: "Cliente encontrado no Omie",
        cliente: resultado
      });

    } catch (error: any) {
      return res.status(INTERNAL_SERVER_ERROR).json({
        error: `Erro ao consultar Omie: ${error.message}`
      });
    }
  }

  /**
   * GET /clientes/omie/listar
   * Lista clientes do Omie
   */
  async listarOmie(req: Request, res: Response) {
    try {
      const pagina = parseInt(req.query.pagina as string) || 1;
      const registrosPorPagina = parseInt(req.query.registros as string) || 100;

      const resultado = await OmieService.listarClientes(pagina, registrosPorPagina);
      
      return res.status(OK).json({
        message: "Clientes recuperados do Omie",
        ...resultado
      });

    } catch (error: any) {
      return res.status(INTERNAL_SERVER_ERROR).json({
        error: `Erro ao listar clientes Omie: ${error.message}`
      });
    }
  }
}

export default new ClienteController();
