import { Injectable, Logger } from '@nestjs/common';
import { VolumetriaService } from './volumetria.service';
import { OmieService } from './omie.service';
import { PropostasService } from './propostas.service';
import { ConsolidacaoService, ConsolidacaoData } from './consolidacao.service';
import { ConfiguracaoService } from './configuracao.service';

@Injectable()
export class ContractsService {
  private readonly logger = new Logger(ContractsService.name);

  constructor(
    private readonly volumetriaService: VolumetriaService,
    private readonly omieService: OmieService,
    private readonly propostasService: PropostasService,
    private readonly consolidacaoService: ConsolidacaoService,
    private readonly configuracaoService: ConfiguracaoService,
  ) {}

  /**
   * TESTE: Criar contrato SEM SALVAR no banco
   * Agrupa volumetria por produto e separa por proposta
   */
  async testarCriacaoContrato(
    empresaId: number,
    competencia: string, // Formato: YYYY-MM
    enviarParaOmie: boolean = false // Se true, envia para Omie; se false, apenas simula
  ) {
    try {
      this.logger.log(`🧪 === TESTE CRIAÇÃO CONTRATO (SEM PERSISTIR) ===`);
      this.logger.log(`Empresa: ${empresaId} | Competência: ${competencia}`);
      this.logger.log(`Enviar para Omie: ${enviarParaOmie ? 'SIM' : 'NÃO (apenas simulação)'}`);
      
      // 1. Calcular período da competência
      const { dataInicial, dataFinal } = this.calcularPeriodoCompetencia(competencia);
      this.logger.log(`📅 Período: ${dataInicial} até ${dataFinal}`);
      
      // 2. Buscar volumetria da empresa
      this.logger.log(`🔍 Buscando volumetria...`);
      const volumetriaData = await this.volumetriaService.consultarVolumetria({
        dataInicial,
        dataFinal,
        empresas: empresaId.toString()
      });

      if (!volumetriaData || volumetriaData.length === 0) {
        this.logger.warn(`⚠️ Sem dados de volumetria para empresa ${empresaId}`);
        return {
          success: false,
          error: 'Sem dados de volumetria no período',
          dadosProcessamento: {
            empresaId,
            competencia,
            periodo: { dataInicial, dataFinal }
          }
        };
      }

      // 3. Extrair produtos da volumetria
      const produtos = this.extrairProdutosDaVolumetria(volumetriaData[0]);
      this.logger.log(`📦 Produtos detectados na volumetria: ${produtos.length}`);
      // Nota: Valores da volumetria são apenas referência de transações, preços reais vêm das propostas comerciais

      if (produtos.length === 0) {
        this.logger.warn(`⚠️ Nenhum produto com valor encontrado`);
        return {
          success: false,
          error: 'Nenhum produto com valor > 0',
          dadosProcessamento: {
            empresaId,
            competencia,
            volumetria: volumetriaData[0]
          }
        };
      }

      // 4. Buscar TODOS os produtos que têm propostas (não apenas os da volumetria)
      this.logger.log(`🔗 Buscando TODOS os produtos com propostas comerciais...`);
      
      // Primeiro: obter lista completa de produtos que têm propostas
      const produtosComPropostasDisponiveis = await this.propostasService.obterProdutosComPropostas(empresaId);
      this.logger.log(`📋 Produtos com propostas disponíveis: ${produtosComPropostasDisponiveis.join(', ')}`);
      
      const produtosComProposta = [];
      
      // Para cada produto que tem proposta disponível
      for (const nomeProduto of produtosComPropostasDisponiveis) {
        try {
          this.logger.log(`   🔍 Processando produto: ${nomeProduto}`);
          
          // Buscar dados na volumetria (se existir)
          const produtoNaVolumetria = produtos.find(p => 
            p.nome.toLowerCase() === nomeProduto.toLowerCase()
          );
          
          // Buscar proposta comercial
          const numeroProposta = await this.propostasService.obterPropostaPorProduto(
            empresaId, 
            nomeProduto, 
            competencia
          );
          
          if (numeroProposta) {
            // Para quantidade, usar da volumetria se disponível, senão usar 0
            const quantidade = produtoNaVolumetria?.quantidade || 0;
            
            // Buscar preço correto na proposta comercial
            const precoDaProposta = await this.propostasService.obterPrecoProdutoNaProposta(
              numeroProposta,
              nomeProduto,
              quantidade
            );
            
            if (precoDaProposta !== null && precoDaProposta >= 0) { // Aceitar valor 0 também
              produtosComProposta.push({
                produto: nomeProduto,
                valor: precoDaProposta, // ← PREÇO DA PROPOSTA COMERCIAL
                quantidade: quantidade,
                proposta: numeroProposta,
                volumetriaReferencia: produtoNaVolumetria?.valor || 0 // Debug apenas
              });
              
              const statusVolumetria = produtoNaVolumetria ? 
                `(${quantidade} transações, volumetria: R$ ${produtoNaVolumetria.valor})` : 
                '(sem dados na volumetria)';
              
              this.logger.log(`   ✅ ${nomeProduto} → Proposta ${numeroProposta}: R$ ${precoDaProposta} ${statusVolumetria}`);
            } else {
              this.logger.warn(`   ❌ ${nomeProduto} → Proposta ${numeroProposta} encontrada, mas preço não calculado`);
            }
          } else {
            this.logger.warn(`   ❌ ${nomeProduto} → Sem proposta vinculada`);
          }
        } catch (error) {
          this.logger.error(`   🔥 ${nomeProduto} → Erro: ${error.message}`);
        }
      }

      if (produtosComProposta.length === 0) {
        this.logger.warn(`⚠️ Nenhum produto com proposta vinculada encontrado`);
        return {
          success: false,
          error: 'Nenhum produto possui proposta vinculada',
          dadosProcessamento: {
            empresaId,
            competencia,
            produtos,
            produtosSemProposta: produtos.filter(p => p.valor > 0).map(p => p.nome)
          }
        };
      }

      // 5. Agrupar por número de proposta (em memória) - VALORES CORRETOS!
      const propostasConsolidadas = this.agruparPorNumeroProposta(produtosComProposta);
      this.logger.log(`📋 Propostas consolidadas: ${Object.keys(propostasConsolidadas).length}`);
      
      Object.entries(propostasConsolidadas).forEach(([proposta, dados]) => {
        const produtosDetalhes = dados.produtos.map(p => `${p.nome}(R$ ${p.valor})`).join(' + ');
        this.logger.log(`   → Proposta ${proposta}: ${produtosDetalhes} = R$ ${dados.valorTotal}`);
      });

      // 6. Preparar modelos de contrato (sem enviar)
      const contratosPreparados = [];
      
      for (const [numeroProposta, dadosProposta] of Object.entries(propostasConsolidadas)) {
        try {
          // Simular registro de consolidação (sem persistir)
          const registroSimulado = {
            _id: `simulado_${Date.now()}`,
            competencia,
            empresaId,
            proposta: numeroProposta,
            valorTotal: dadosProposta.valorTotal,
            produtos: dadosProposta.produtos,
            status: 'ready_to_send'
          };
          
          // Criar modelo do contrato
          const modeloContrato = await this.criarModeloContratoOmie(registroSimulado);
          
          contratosPreparados.push({
            proposta: numeroProposta,
            valorTotal: dadosProposta.valorTotal,
            produtos: dadosProposta.produtos,
            modeloContrato: modeloContrato,
            registroSimulado: registroSimulado
          });
          
          this.logger.log(`   📄 Contrato preparado - Proposta ${numeroProposta}`);
          
        } catch (error) {
          this.logger.error(`   🔥 Erro ao preparar contrato - Proposta ${numeroProposta}: ${error.message}`);
        }
      }

      // 7. Enviar para Omie (opcional)
      const resultadosEnvio = [];
      
      if (enviarParaOmie) {
        this.logger.log(`🚀 Enviando ${contratosPreparados.length} contratos para Omie...`);
        
        for (const contrato of contratosPreparados) {
          try {
            const response = await this.omieService.incluirContrato(contrato.modeloContrato);
            
            resultadosEnvio.push({
              proposta: contrato.proposta,
              success: response.cCodStatus === '0',
              contratoId: response.nCodCtr,
              integrationCode: response.cCodIntCtr,
              message: response.cDescStatus,
              response: response
            });
            
            if (response.cCodStatus === '0') {
              this.logger.log(`   ✅ Proposta ${contrato.proposta} → Contrato ${response.nCodCtr} criado`);
            } else {
              this.logger.error(`   ❌ Proposta ${contrato.proposta} → Erro: ${response.cDescStatus}`);
            }
            
          } catch (error) {
            this.logger.error(`   🔥 Erro ao enviar proposta ${contrato.proposta}: ${error.message}`);
            resultadosEnvio.push({
              proposta: contrato.proposta,
              success: false,
              error: error.message
            });
          }
        }
      } else {
        this.logger.log(`💡 Simulação concluída - ${contratosPreparados.length} contratos preparados (não enviados)`);
      }

      // Resultado final
      const resultado = {
        success: true,
        modo: enviarParaOmie ? 'ENVIO_REAL' : 'SIMULACAO',
        dadosProcessamento: {
          empresaId,
          competencia,
          periodo: { dataInicial, dataFinal },
          volumetria: volumetriaData[0],
          produtosEncontrados: produtos.length,
          produtosComProposta: produtosComProposta.length,
          propostas: Object.keys(propostasConsolidadas),
          contratosPreparados: contratosPreparados.length
        },
        produtos,
        produtosComProposta,
        propostasConsolidadas,
        contratosPreparados,
        resultadosEnvio: enviarParaOmie ? resultadosEnvio : null
      };

      this.logger.log(`✅ Teste concluído com sucesso!`);
      return resultado;

    } catch (error) {
      this.logger.error(`💥 Erro no teste: ${error.message}`);
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }

  /**
   * MÉTODO PRINCIPAL: Processar consolidação mensal por proposta
   * Este é o fluxo CORRETO conforme a especificação
   */
  async processarConsolidacaoMensal(
    competencia: string, // Formato: YYYY-MM (ex: 2025-08)
    empresaIds?: string[] // Se não informado, processa todas as empresas ativas
  ) {
    try {
      this.logger.log(`=== INICIANDO CONSOLIDAÇÃO MENSAL ===`);
      this.logger.log(`Competência: ${competencia}`);
      
      // 1. Definir período do mês anterior
      const { dataInicial, dataFinal } = this.calcularPeriodoCompetencia(competencia);
      this.logger.log(`Período: ${dataInicial} até ${dataFinal}`);
      
      // 2. Obter lista de empresas a processar
      const empresas = empresaIds || (await this.configuracaoService.obterEmpresasAtivas()).map(id => id.toString());
      this.logger.log(`Empresas a processar: ${empresas.join(', ')}`);
      
      const resultados = [];
      
      // 3. Processar cada empresa
      for (const empresaId of empresas) {
        try {
          this.logger.log(`--- Processando empresa: ${empresaId} ---`);
          
          const resultadoEmpresa = await this.processarEmpresaPorProposta(
            parseInt(empresaId), 
            dataInicial, 
            dataFinal, 
            competencia
          );
          
          resultados.push(resultadoEmpresa);
          
        } catch (error) {
          this.logger.error(`Erro ao processar empresa ${empresaId}: ${error.message}`);
          resultados.push({
            empresaId: parseInt(empresaId),
            success: false,
            error: error.message
          });
        }
      }

      const empresasComSucesso = resultados.filter(r => r.success).length;

      this.logger.log(`=== CONSOLIDAÇÃO MENSAL CONCLUÍDA ===`);
      this.logger.log(`Total empresas: ${resultados.length}`);
      this.logger.log(`Sucessos: ${empresasComSucesso}`);
      this.logger.log(`Erros: ${resultados.length - empresasComSucesso}`);

      return {
        success: true,
        competencia,
        empresasProcessadas: resultados.length,
        empresasComSucesso,
        resultados
      };

    } catch (error) {
      this.logger.error(`Erro crítico na consolidação mensal: ${error.message}`);
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
    empresaId: number,
    dataInicial: string,
    dataFinal: string,
    competencia: string
  ) {
    try {
      // 1. Buscar volumetria da empresa
      this.logger.log(`Consultando volumetria empresa ${empresaId}...`);
      const volumetriaData = await this.volumetriaService.consultarVolumetria({
        dataInicial,
        dataFinal,
        empresas: empresaId.toString()
      });

      if (!volumetriaData || volumetriaData.length === 0) {
        this.logger.warn(`Sem dados de volumetria - Empresa: ${empresaId}`);
        return {
          empresaId,
          success: true,
          propostas: [],
          contratosEnviados: 0,
          motivo: 'Sem dados de volumetria no período'
        };
      }

      // 2. Extrair produtos da volumetria
      const produtos = this.extrairProdutosDaVolumetria(volumetriaData[0]);
      if (produtos.length === 0) {
        this.logger.warn(`Nenhum produto com valor encontrado - Empresa: ${empresaId}`);
        return {
          empresaId,
          success: true,
          propostas: [],
          contratosEnviados: 0,
          motivo: 'Nenhum produto com valor > 0'
        };
      }

      this.logger.log(`Produtos encontrados: ${produtos.map(p => `${p.nome}(${p.valor})`).join(', ')}`);

      // 3. Para cada produto, obter número da proposta
      const produtosComProposta = [];
      
      for (const produto of produtos) {
        if (produto.valor > 0) { // Ignorar produtos com valor 0
          try {
            const numeroProposta = await this.propostasService.obterPropostaPorProduto(
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
              
              this.logger.log(`✅ ${produto.nome} → Proposta: ${numeroProposta} (R$ ${produto.valor})`);
            } else {
              this.logger.warn(`❌ ${produto.nome} → Sem proposta vinculada`);
            }
          } catch (error) {
            this.logger.error(`Erro ao obter proposta para ${produto.nome}: ${error.message}`);
          }
        }
      }

      if (produtosComProposta.length === 0) {
        return {
          empresaId,
          success: true,
          propostas: [],
          contratosEnviados: 0,
          motivo: 'Nenhum produto com proposta vinculada'
        };
      }

      // 4. AGRUPAMENTO CORRETO: Por número de proposta
      const propostasConsolidadas = this.agruparPorNumeroProposta(produtosComProposta);
      
      this.logger.log(`Propostas consolidadas: ${Object.keys(propostasConsolidadas).join(', ')}`);

      // 5. Persistir na tabela de consolidação
      const registrosConsolidacao = [];
      
      for (const [numeroProposta, dadosProposta] of Object.entries(propostasConsolidadas)) {
        const dadosConsolidacao: ConsolidacaoData = {
          competencia,
          empresaId,
          numeroProposta,
          valorTotal: dadosProposta.valorTotal,
          produtos: dadosProposta.produtos
        };
        
        const registro = await this.consolidacaoService.persistirConsolidacao(dadosConsolidacao);
        registrosConsolidacao.push(registro);
        
        this.logger.log(`💾 Proposta ${numeroProposta} salva - Status: ${registro.status}`);
      }

      // 6. Enviar contratos para Omie (apenas registros ready_to_send)
      const contratosEnviados = [];
      
      for (const registro of registrosConsolidacao) {
        if (registro.status === 'ready_to_send') {
          try {
            const contratoOmie = await this.enviarContratoParaOmie(registro);
            contratosEnviados.push(contratoOmie);
            
            this.logger.log(`🚀 Contrato enviado - Proposta: ${registro.proposta} - ID Omie: ${contratoOmie.contratoId}`);
            
          } catch (error) {
            this.logger.error(`Erro ao enviar contrato - Proposta ${registro.proposta}: ${error.message}`);
            await this.consolidacaoService.atualizarStatusConsolidacao(
              registro._id.toString(), 
              'error', 
              error.message
            );
          }
        }
      }

      return {
        empresaId,
        success: true,
        propostas: Object.keys(propostasConsolidadas),
        registrosConsolidacao: registrosConsolidacao.length,
        contratosEnviados: contratosEnviados.length,
        detalhes: contratosEnviados
      };

    } catch (error) {
      this.logger.error(`Erro ao processar empresa ${empresaId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * EXTRAIR PRODUTOS: Interpretar estrutura da volumetria
   */
  private extrairProdutosDaVolumetria(volumetria: any): any[] {
    const produtos = [];

    // Lista de produtos conhecidos com suas regras de extração
    const regrasExtracao = [
      {
        nome: 'cobranca',
        condicao: (v) => v.cobranca && (v.cobranca.qtdeTitulos > 0 || v.cobranca.valorTotal > 0),
        valor: (v) => v.cobranca.valorTotal || 0,
        quantidade: (v) => v.cobranca.qtdeTitulos || 0
      },
      {
        nome: 'pixpay',
        condicao: (v) => v.pixpay && (v.pixpay.qtdeMotoristas > 0 || v.pixpay.valorTotal > 0),
        valor: (v) => v.pixpay.valorTotal || 0,
        quantidade: (v) => v.pixpay.qtdeMotoristas || v.pixpay.qtdeTitulos || 0
      },
      {
        nome: 'webcheckout',
        condicao: (v) => v.webcheckout && (v.webcheckout.qtdeTitulos > 0 || v.webcheckout.valorTotal > 0),
        valor: (v) => v.webcheckout.valorTotal || 0,
        quantidade: (v) => v.webcheckout.qtdeTitulos || 0
      },
      {
        nome: 'bolepix',
        condicao: (v) => v.bolepix && (v.bolepix.qtdeTitulos > 0 || v.bolepix.valorTotal > 0),
        valor: (v) => v.bolepix.valorTotal || 0,
        quantidade: (v) => v.bolepix.qtdeTitulos || 0
      }
    ];

    // Aplicar regras de extração
    for (const regra of regrasExtracao) {
      if (regra.condicao(volumetria)) {
        const valor = regra.valor(volumetria);
        const quantidade = regra.quantidade(volumetria);
        
        produtos.push({
          nome: regra.nome,
          valor: valor,
          quantidade: quantidade
        });
        
        // Produto extraído: ${regra.nome} com ${quantidade} transações
      }
    }

    // Busca automática por outros produtos não mapeados
    const produtosMapeados = regrasExtracao.map(r => r.nome);
    const chavesVolumetria = Object.keys(volumetria).filter(k => 
      k !== 'idEmpresa' && !produtosMapeados.includes(k)
    );
    
    for (const chave of chavesVolumetria) {
      const dados = volumetria[chave];
      if (dados && typeof dados === 'object') {
        const valor = dados.valorTotal || 0;
        const quantidade = dados.qtdeTitulos || dados.qtdeMotoristas || dados.quantidade || 0;
        
        if (valor > 0 || quantidade > 0) {
          produtos.push({
            nome: chave,
            valor: valor,
            quantidade: quantidade
          });
          
          this.logger.log(`   ⚠️ Produto não mapeado encontrado: ${chave} - R$ ${valor} (qty: ${quantidade})`);
        }
      }
    }

    // ${produtos.length} produtos extraídos da volumetria
    return produtos;
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
   * ENVIO PARA OMIE: Criar e enviar contrato por proposta
   */
  private async enviarContratoParaOmie(registroConsolidacao: any) {
    const contratoModel = await this.criarModeloContratoOmie(registroConsolidacao);
    
    const response = await this.omieService.incluirContrato(contratoModel);
    
    // Atualizar status da consolidação
    if (response.cCodStatus === '0') {
      await this.consolidacaoService.atualizarStatusConsolidacao(
        registroConsolidacao._id.toString(), 
        'sent', 
        null,
        contratoModel, 
        response
      );
    } else {
      await this.consolidacaoService.atualizarStatusConsolidacao(
        registroConsolidacao._id.toString(), 
        'error', 
        response.cDescStatus,
        contratoModel, 
        response
      );
    }

    return {
      proposta: registroConsolidacao.proposta,
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
    const { competencia, empresaId, proposta: numeroProposta, valorTotal, produtos } = registroConsolidacao;
    
    // Obter configuração da empresa
    const configEmpresa = await this.configuracaoService.obterConfiguracaoEmpresa(empresaId);
    
    // CORRIGIDO: Código mais compacto (máximo 20 caracteres)
    // Formato: EMP{ID}-{AAMM}-{PROP} onde PROP são os últimos 6 dígitos da proposta
    const [ano, mes] = competencia.split('-');
    const anoCompacto = ano.slice(-2); // Últimos 2 dígitos do ano
    const propCompacta = numeroProposta.slice(-6); // Últimos 6 dígitos da proposta
    const cCodIntCtr = `EMP${empresaId}-${anoCompacto}${mes}-${propCompacta}`;
    
    // Verificar se não excede 20 caracteres
    if (cCodIntCtr.length > 20) {
      this.logger.warn(`⚠️ Código de integração truncado: ${cCodIntCtr} (${cCodIntCtr.length} chars)`);
    }
    
    const descricaoProdutos = produtos.map(p => p.nome).join(', ');
    const descricaoCompleta = `Serviços do período ${mes}/${ano} — Proposta ${numeroProposta} — Produtos: ${descricaoProdutos}`;
    
    this.logger.log(`📋 Código integração: ${cCodIntCtr} (${cCodIntCtr.length} caracteres)`);
    
    return {
      cabecalho: {
        cCodIntCtr: cCodIntCtr,
        cCodSit: '10',
        cTipoFat: configEmpresa.configuracao.tipoFaturamento,
        dVigInicial: configEmpresa.configuracao.vigenciaInicial,
        dVigFinal: configEmpresa.configuracao.vigenciaFinal,
        nCodCli: configEmpresa.codigoClienteOmie,
        nDiaFat: configEmpresa.configuracao.diaFaturamento,
        nValTotMes: valorTotal
      },
      itensContrato: [
        {
          itemCabecalho: {
            codIntItem: '1',
            codLC116: '3.05', // Conforme especificação
            natOperacao: '01',
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
            aliqISS: 0,
            retISS: 'N'
          }
        }
      ],
      observacoes: {
        cObsContrato: `Consolidação automática InAnbetec. Competência ${mes}/${ano}.`
      }
    };
  }

  // Métodos auxiliares
  
  private calcularPeriodoCompetencia(competencia: string) {
    const [ano, mes] = competencia.split('-');
    const ultimoDia = new Date(parseInt(ano), parseInt(mes), 0).getDate();
    
    return {
      dataInicial: `${ano}-${mes}-01`,
      dataFinal: `${ano}-${mes}-${ultimoDia.toString().padStart(2, '0')}`
    };
  }

  // ============================================
  // MÉTODOS EXISTENTES MANTIDOS PARA COMPATIBILIDADE
  // ============================================

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