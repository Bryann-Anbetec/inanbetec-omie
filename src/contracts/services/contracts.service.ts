import { Injectable, Logger } from '@nestjs/common';
import { VolumetriaService } from './volumetria.service';
import { OmieService } from './omie.service';

@Injectable()
export class ContractsService {
  private readonly logger = new Logger(ContractsService.name);

  constructor(
    private readonly volumetriaService: VolumetriaService,
    private readonly omieService: OmieService,
  ) {}

  async createContractFromVolumetria(
    empresaId: string,
    dataInicial: string,
    dataFinal: string,
    dadosEmpresa: any = {}
  ) {
    try {
      this.logger.log('Iniciando criação de contrato a partir da volumetria');
      
      // 1. Buscar dados da volumetria
      const volumetriaData = await this.volumetriaService.consultarVolumetria({
        dataInicial,
        dataFinal,
        empresas: empresaId
      });
      
      this.logger.log(`Dados de volumetria recebidos: ${JSON.stringify(volumetriaData)}`);
      
      if (!volumetriaData || volumetriaData.length === 0) {
        this.logger.warn('Nenhum dado de volumetria encontrado para o período informado');
        return {
          success: false,
          error: 'Nenhum dado de volumetria encontrado para o período informado'
        };
      }

      // 2. Buscar serviços da empresa (opcional)
      const servicosEmpresa = await this.volumetriaService.buscarServicosPorEmpresa(empresaId);

      // 3. Mapear dados para contrato Omie
      const dadosContrato = this.volumetriaService.mapearParaContratoOmie(
        volumetriaData[0], 
        dadosEmpresa
      );
      
      this.logger.log(`Dados do contrato mapeado: ${JSON.stringify(dadosContrato)}`);

      // 4. Criar contrato no Omie
      const contractModel = this.createContractModel(dadosContrato);
      this.logger.log(`Modelo do contrato Omie: ${JSON.stringify(contractModel)}`);
      
      const response = await this.omieService.incluirContrato(contractModel);
      this.logger.log(`Resposta da criação do contrato Omie: ${JSON.stringify(response)}`);

      return {
        success: response.cCodStatus === '0',
        contractId: response.nCodCtr,
        integrationCode: response.cCodIntCtr,
        message: response.cDescStatus,
        volumetriaData: volumetriaData[0],
        servicosEmpresa: servicosEmpresa,
        contractData: dadosContrato
      };
    } catch (error) {
      this.logger.error(`Erro na criação do contrato a partir da volumetria: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createContractsFromReports(
    empresaId: string,
    dataInicial: string,
    dataFinal: string,
    dadosEmpresa: any = {}
  ) {
    try {
      this.logger.log('Iniciando criação de contratos baseados em relatórios');
      
      // 1. Buscar relatórios
      const relatorios = await this.volumetriaService.buscarRelatorios({
        dataInicial,
        dataFinal,
        empresas: empresaId
      });

      if (!relatorios || relatorios.length === 0) {
        return {
          success: false,
          error: 'Nenhum relatório encontrado para o período informado'
        };
      }

      // 2. Agrupar relatórios por produto
      const gruposProdutos = this.volumetriaService.agruparRelatoriosPorProduto(relatorios);
      
      // 3. Criar contratos para cada produto
      const contratosCreated = [];
      const erros = [];

      for (const [tipoProduto, relatoriosProduto] of Object.entries(gruposProdutos)) {
        if ((relatoriosProduto as any[]).length > 0) {
          try {
            this.logger.log(`Criando contrato para produto: ${tipoProduto}`);
            
            // Mapear dados para contrato Omie
            const dadosContrato = this.volumetriaService.mapearRelatorioPorProduto(
              relatoriosProduto as any[], 
              tipoProduto, 
              dadosEmpresa
            );

            if (dadosContrato) {
              // Criar contrato no Omie
              const contractModel = this.createContractModel(dadosContrato);
              const response = await this.omieService.incluirContrato(contractModel);
              
              contratosCreated.push({
                produto: tipoProduto,
                success: response.cCodStatus === '0',
                contractId: response.nCodCtr,
                integrationCode: response.cCodIntCtr,
                message: response.cDescStatus,
                relatorios: (relatoriosProduto as any[]).length,
                totalRegistros: (relatoriosProduto as any[]).reduce((sum, rel) => sum + (rel.record_count || 0), 0)
              });
            }
          } catch (error) {
            erros.push({
              produto: tipoProduto,
              error: error.message
            });
          }
        }
      }

      return {
        success: contratosCreated.length > 0,
        contratosCreated,
        erros,
        totalProdutos: Object.keys(gruposProdutos).filter(key => gruposProdutos[key].length > 0).length,
        relatoriosProcessados: relatorios.length
      };

    } catch (error) {
      this.logger.error(`Erro na criação de contratos baseados em relatórios: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getVolumetriaData(empresaId: string, dataInicial: string, dataFinal: string) {
    try {
      const volumetriaData = await this.volumetriaService.consultarVolumetria({
        dataInicial,
        dataFinal,
        empresas: empresaId
      });

      const servicosEmpresa = await this.volumetriaService.buscarServicosPorEmpresa(empresaId);

      return {
        success: true,
        volumetria: volumetriaData,
        servicos: servicosEmpresa,
        contratoMapeado: volumetriaData && volumetriaData.length > 0 ? 
          this.volumetriaService.mapearParaContratoOmie(volumetriaData[0]) : null
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getReportsData(empresaId: string, dataInicial: string, dataFinal: string) {
    try {
      this.logger.log('Consultando relatórios para análise');
      
      const relatorios = await this.volumetriaService.buscarRelatorios({
        dataInicial,
        dataFinal,
        empresas: empresaId
      });

      const gruposProdutos = this.volumetriaService.agruparRelatoriosPorProduto(relatorios);
      
      // Mapear contratos para cada produto (sem criar)
      const contratosMapeados = {};
      for (const [tipoProduto, relatoriosProduto] of Object.entries(gruposProdutos)) {
        if ((relatoriosProduto as any[]).length > 0) {
          contratosMapeados[tipoProduto] = this.volumetriaService.mapearRelatorioPorProduto(
            relatoriosProduto as any[], 
            tipoProduto
          );
        }
      }

      return {
        success: true,
        relatorios,
        gruposProdutos,
        contratosMapeados,
        resumo: {
          totalRelatorios: relatorios.length,
          produtosEncontrados: Object.keys(gruposProdutos).filter(key => gruposProdutos[key].length > 0),
          totalRegistros: relatorios.reduce((sum, rel) => sum + (rel.record_count || 0), 0)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createContract(contractData: any) {
    try {
      const contractModel = this.createContractModel(contractData);
      const response = await this.omieService.incluirContrato(contractModel);
      
      return {
        success: response.cCodStatus === '0',
        contractId: response.nCodCtr,
        integrationCode: response.cCodIntCtr,
        message: response.cDescStatus
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getContract(contractKey: any) {
    try {
      const response = await this.omieService.consultarContrato(contractKey);
      
      return {
        success: !!response.contratoCadastro,
        contract: response.contratoCadastro || null
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async listContracts(listParams: any = {}) {
    try {
      const listRequest = this.createListRequest(listParams);
      const response = await this.omieService.listarContratos(listRequest);
      
      return {
        success: true,
        pagina: response.pagina,
        total_de_paginas: response.total_de_paginas,
        registros: response.registros,
        total_de_registros: response.total_de_registros,
        contratos: response.contratoCadastro || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async updateContract(contractData: any) {
    try {
      const contractModel = this.createContractModel(contractData);
      const response = await this.omieService.alterarContrato(contractModel);
      
      return {
        success: response.cCodStatus === '0',
        contractId: response.nCodCtr,
        integrationCode: response.cCodIntCtr,
        message: response.cDescStatus
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async upsertContract(contractData: any) {
    try {
      const contractModel = this.createContractModel(contractData);
      const response = await this.omieService.upsertContrato(contractModel);
      
      return {
        success: response.cCodStatus === '0',
        contractId: response.nCodCtr,
        integrationCode: response.cCodIntCtr,
        message: response.cDescStatus
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deleteContractItem(contractKey: any, itemsToDelete: any) {
    try {
      const response = await this.omieService.excluirItem(contractKey, itemsToDelete);
      
      return {
        success: response.cCodStatus === '0',
        message: response.cDescStatus
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  private createContractModel(contractData: any) {
    return {
      cabecalho: {
        cCodIntCtr: contractData.cCodIntCtr || '',
        cNumCtr: contractData.cNumCtr || '',
        nCodCli: contractData.nCodCli || 0,
        cCodSit: contractData.cCodSit || '10',
        dVigInicial: contractData.dVigInicial || '',
        dVigFinal: contractData.dVigFinal || '',
        nDiaFat: contractData.nDiaFat || 0,
        nValTotMes: contractData.nValTotMes || 0,
        cTipoFat: contractData.cTipoFat || '01'
      },
      departamentos: [],
      infAdic: contractData.infAdic || {
        cCidPrestServ: '',
        cCodCateg: '',
        nCodCC: 0,
        nCodProj: 0,
        nCodVend: 0
      },
      vencTextos: contractData.vencTextos || {
        cTpVenc: '001',
        nDias: 5,
        cProxMes: 'N',
        cAdContrato: 'N'
      },
      itensContrato: contractData.itensContrato || [],
      emailCliente: {
        cEnviarBoleto: 'N',
        cEnviarLinkNfse: 'N',
        cEnviarRecibo: 'N',
        cUtilizarEmails: ''
      },
      observacoes: {
        cObsContrato: ''
      }
    };
  }

  private createListRequest(params: any) {
    return {
      pagina: params.pagina || 1,
      registros_por_pagina: params.registros_por_pagina || 50,
      apenas_importado_api: params.apenas_importado_api || 'N'
    };
  }
}