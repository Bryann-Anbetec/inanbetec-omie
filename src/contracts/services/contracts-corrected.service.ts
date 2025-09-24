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

  /**
   * FLUXO CORRETO: Processar consolidação mensal por proposta
   * Executado no primeiro dia útil do mês para processar mês anterior
   */
  async processarConsolidacaoMensal(
    competencia: string, // Formato: YYYY-MM (ex: 2025-08)
    empresaIds?: string[] // Se não informado, processa todas as empresas ativas
  ) {
    try {
      this.logger.log(`Iniciando consolidação mensal - Competência: ${competencia}`);
      
      // 1. Definir período do mês anterior
      const { dataInicial, dataFinal } = this.calcularPeriodoCompetencia(competencia);
      
      // 2. Obter lista de empresas a processar
      const empresas = empresaIds || await this.obterEmpresasAtivas();
      
      const resultados = [];
      
      // 3. Processar cada empresa
      for (const empresaId of empresas) {
        try {
          this.logger.log(`Processando empresa: ${empresaId}`);
          
          const resultadoEmpresa = await this.processarEmpresaPorProposta(
            empresaId, 
            dataInicial, 
            dataFinal, 
            competencia
          );
          
          resultados.push(resultadoEmpresa);
          
        } catch (error) {
          this.logger.error(`Erro ao processar empresa ${empresaId}: ${error.message}`);
          resultados.push({
            empresaId,
            success: false,
            error: error.message
          });
        }
      }

      return {
        success: true,
        competencia,
        empresasProcessadas: resultados.length,
        empresasComSucesso: resultados.filter(r => r.success).length,
        resultados
      };

    } catch (error) {
      this.logger.error(`Erro na consolidação mensal: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * FLUXO CORRETO: Processar uma empresa agrupando por proposta
   */
  private async processarEmpresaPorProposta(
    empresaId: string,
    dataInicial: string,
    dataFinal: string,
    competencia: string
  ) {
    try {
      // 1. Buscar volumetria da empresa
      const volumetriaData = await this.volumetriaService.consultarVolumetria({
        dataInicial,
        dataFinal,
        empresas: empresaId
      });

      if (!volumetriaData || volumetriaData.length === 0) {
        return {
          empresaId,
          success: true,
          propostas: [],
          motivo: 'Sem dados de volumetria no período'
        };
      }

      // 2. Para cada produto na volumetria, obter número da proposta
      const produtosComProposta = [];
      
      for (const dadoVolumetria of volumetriaData) {
        // Iterar pelos produtos na volumetria
        const produtos = this.extrairProdutosDaVolumetria(dadoVolumetria);
        
        for (const produto of produtos) {
          if (produto.valor > 0) { // Ignorar produtos com valor 0
            try {
              // CHAMADA NOVA: Obter proposta do produto
              const numeroProposta = await this.obterPropostaDoProduto(
                empresaId, 
                produto.nome, 
                competencia
              );
              
              if (numeroProposta) {
                produtosComProposta.push({
                  produto: produto.nome,
                  valor: produto.valor,
                  quantidade: produto.quantidade,
                  proposta: numeroProposta
                });
              } else {
                this.logger.warn(`Produto ${produto.nome} sem proposta vinculada - Empresa: ${empresaId}`);
              }
            } catch (error) {
              this.logger.error(`Erro ao obter proposta para produto ${produto.nome}: ${error.message}`);
            }
          }
        }
      }

      // 3. AGRUPAMENTO CORRETO: Por número de proposta (não por produto)
      const propostasConsolidadas = this.agruparPorNumeroProposta(produtosComProposta);
      
      // 4. Persistir na tabela de consolidação
      const registrosConsolidacao = [];
      
      for (const [numeroProposta, dadosProposta] of Object.entries(propostasConsolidadas)) {
        const registro = await this.persistirConsolidacao({
          competencia,
          empresaId,
          numeroProposta,
          valorTotal: dadosProposta.valorTotal,
          produtos: dadosProposta.produtos,
          origemPayload: volumetriaData
        });
        
        registrosConsolidacao.push(registro);
      }

      // 5. Enviar contratos para Omie (apenas registros ready_to_send)
      const contratosEnviados = [];
      
      for (const registro of registrosConsolidacao) {
        if (registro.status === 'ready_to_send') {
          try {
            const contratoOmie = await this.enviarContratoParaOmie(registro);
            contratosEnviados.push(contratoOmie);
          } catch (error) {
            this.logger.error(`Erro ao enviar contrato para Omie - Proposta ${registro.numeroProposta}: ${error.message}`);
            await this.atualizarStatusConsolidacao(registro.id, 'error', error.message);
          }
        }
      }

      return {
        empresaId,
        success: true,
        propostas: Object.keys(propostasConsolidadas),
        registrosConsolidacao: registrosConsolidacao.length,
        contratosEnviados: contratosEnviados.length
      };

    } catch (error) {
      this.logger.error(`Erro ao processar empresa ${empresaId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * MÉTODO NOVO: Obter número da proposta comercial para um produto
   * Este método precisa ser implementado baseado na fonte de dados das propostas
   */
  private async obterPropostaDoProduto(
    empresaId: string, 
    nomeProduto: string, 
    competencia: string
  ): Promise<string | null> {
    try {
      // TODO: Implementar integração com o sistema que armazena as propostas comerciais
      // Pode ser uma tabela no banco, uma API específica, etc.
      
      // Exemplo de implementação (ajustar conforme sua fonte de dados):
      // return await this.propostasService.buscarPropostaPorProduto(empresaId, nomeProduto, competencia);
      
      // TEMPORÁRIO: Mock para teste
      const mockPropostas = {
        'cobranca': '202300100024',
        'pagamentos': '202300100024', 
        'bolepix': '202400200137',
        'webcheckout': 'P-8899'
      };
      
      return mockPropostas[nomeProduto] || null;
      
    } catch (error) {
      this.logger.error(`Erro ao obter proposta - Empresa: ${empresaId}, Produto: ${nomeProduto}:`, error);
      return null;
    }
  }

  /**
   * AGRUPAMENTO CORRETO: Por número de proposta
   */
  private agruparPorNumeroProposta(produtos: any[]): { [proposta: string]: any } {
    const agrupamento = {};
    
    for (const produto of produtos) {
      const { proposta, valor, produto: nomeProduto, quantidade } = produto;
      
      if (!agrupamento[proposta]) {
        agrupamento[proposta] = {
          valorTotal: 0,
          produtos: []
        };
      }
      
      // Somar valores da mesma proposta
      agrupamento[proposta].valorTotal += valor;
      agrupamento[proposta].produtos.push({
        nome: nomeProduto,
        valor: valor,
        quantidade: quantidade || 0
      });
    }
    
    // Arredondar para 2 casas decimais
    for (const proposta of Object.keys(agrupamento)) {
      agrupamento[proposta].valorTotal = Math.round(agrupamento[proposta].valorTotal * 100) / 100;
    }
    
    return agrupamento;
  }

  /**
   * ENVIO CORRETO: Contrato por proposta para Omie
   */
  private async enviarContratoParaOmie(registroConsolidacao: any) {
    const contratoModel = await this.criarModeloContratoOmie(registroConsolidacao);
    
    const response = await this.omieService.incluirContrato(contratoModel);
    
    // Atualizar status da consolidação
    if (response.cCodStatus === '0') {
      await this.atualizarStatusConsolidacao(
        registroConsolidacao.id, 
        'sent', 
        null, 
        contratoModel, 
        response
      );
    } else {
      await this.atualizarStatusConsolidacao(
        registroConsolidacao.id, 
        'error', 
        response.cDescStatus,
        contratoModel, 
        response
      );
    }

    return {
      proposta: registroConsolidacao.numeroProposta,
      success: response.cCodStatus === '0',
      contratoId: response.nCodCtr,
      integrationCode: response.cCodIntCtr,
      message: response.cDescStatus
    };
  }

  /**
   * MODELO CORRETO: Contrato Omie conforme especificação
   */
  private async criarModeloContratoOmie(registroConsolidacao: any) {
    const { competencia, empresaId, numeroProposta, valorTotal, produtos } = registroConsolidacao;
    
    // Gerar código único: CTR-{AAAA}-{MM}-EMP{empresaId}-PROP-{numeroProposta}
    const [ano, mes] = competencia.split('-');
    const cCodIntCtr = `CTR-${ano}-${mes}-EMP${empresaId}-PROP-${numeroProposta}`;
    
    const descricaoProdutos = produtos.map(p => p.nome).join(', ');
    const descricaoCompleta = `Serviços do período ${mes}/${ano} — Proposta ${numeroProposta} — Produtos: ${descricaoProdutos}`;
    
    const nCodCli = await this.obterCodigoClienteOmie(empresaId);
    
    return {
      cabecalho: {
        cCodIntCtr: cCodIntCtr,
        cCodSit: '10', // Status do contrato
        cTipoFat: '01', // Tipo de faturamento (configuração fixa)
        dVigInicial: '01/01/2025', // TODO: Obter da configuração
        dVigFinal: '31/12/2025',   // TODO: Obter da configuração
        nCodCli: nCodCli, // Mapear empresa -> cliente Omie
        nDiaFat: 30, // TODO: Obter da configuração
        nValTotMes: valorTotal
      },
      itensContrato: [
        {
          itemCabecalho: {
            codIntItem: '1',
            codLC116: '3.05', // TODO: Obter da configuração
            natOperacao: '01', // TODO: Obter da configuração
            quant: 1,
            seq: 1,
            valorTotal: valorTotal,
            valorUnit: valorTotal,
            cNaoGerarFinanceiro: 'N'
          },
          itemDescrServ: {
            descrCompleta: descricaoCompleta
          },
          itemImpostos: {
            aliqISS: 0, // TODO: Obter da configuração
            retISS: 'N'
          }
        }
      ],
      observacoes: {
        cObsContrato: `Consolidação automática InAnbetec. Competência ${mes}/${ano}.`
      }
    };
  }

  // Métodos auxiliares que precisam ser implementados:
  
  private calcularPeriodoCompetencia(competencia: string) {
    const [ano, mes] = competencia.split('-');
    const ultimoDia = new Date(parseInt(ano), parseInt(mes), 0).getDate();
    
    return {
      dataInicial: `${ano}-${mes}-01`,
      dataFinal: `${ano}-${mes}-${ultimoDia.toString().padStart(2, '0')}`
    };
  }

  private extrairProdutosDaVolumetria(volumetria: any): any[] {
    // TODO: Implementar extração dos produtos da estrutura de volumetria
    // Baseado nos exemplos: cobranca.qtdeTitulos, pixpay.qtdeMotoristas, etc.
    return [];
  }

  private async obterEmpresasAtivas(): Promise<string[]> {
    // TODO: Implementar consulta de empresas ativas
    return ['51', '66']; // Mock baseado nos exemplos
  }

  private async persistirConsolidacao(dados: any) {
    // TODO: Implementar persistência na tabela ab_volumetria_consolidada
    return { id: 'mock-id', status: 'ready_to_send', ...dados };
  }

  private async atualizarStatusConsolidacao(id: string, status: string, erro?: string, request?: any, response?: any) {
    // TODO: Implementar atualização do status na tabela
    this.logger.log(`Atualizando status consolidação ${id}: ${status}`);
  }

  private async obterCodigoClienteOmie(empresaId: string): Promise<number> {
    // TODO: Implementar mapeamento empresa -> código cliente Omie
    const mapeamento = { '51': 2370765, '66': 1234567 }; // Mock
    return mapeamento[empresaId] || 0;
  }
}