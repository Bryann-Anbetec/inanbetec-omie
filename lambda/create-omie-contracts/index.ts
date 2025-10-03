/**
 * LAMBDA: CRIAR CONTRATOS NO OMIE
 * 
 * Esta função recebe dados processados e cria contratos no Omie
 * 
 * Event: { consolidacaoData: ConsolidacaoData }
 * 
 * Fluxo:
 * 1. Recebe dados de consolidação
 * 2. Busca configuração da empresa
 * 3. Cria modelo de contrato Omie
 * 4. Envia contrato para API Omie
 * 5. Atualiza status no banco
 */

import { LambdaLogger } from '../shared/logger';
import { OmieClient } from '../shared/omie-client';
import { MongoDBClient } from '../shared/mongodb-client';
import { CreateContractEvent, LambdaResponse, LambdaContext, ContratoOmie, EmpresaConfig } from '../shared/types';

const logger = new LambdaLogger('CreateOmieContracts');

export const handler = async (
  event: CreateContractEvent,
  context: LambdaContext
): Promise<LambdaResponse> => {
  logger.log('📄 Iniciando criação de contrato no Omie', { 
    event, 
    requestId: context.requestId 
  });

  const mongoClient = new MongoDBClient();
  const omieClient = new OmieClient();

  try {
    await mongoClient.connect();

    const { consolidacaoData } = event;

    if (!consolidacaoData) {
      throw new Error('Dados de consolidação não fornecidos');
    }

    logger.log(`Processando contrato - Proposta: ${consolidacaoData.numeroProposta}, Empresa: ${consolidacaoData.empresaId}`);

    // 1. Buscar configuração da empresa
    const empresaConfig = await mongoClient.obterConfiguracaoEmpresa(+consolidacaoData.empresaId);
    
    // 2. Criar modelo de contrato Omie
    const contratoModel = await criarModeloContratoOmie(consolidacaoData, empresaConfig);
    
    logger.log('Modelo de contrato criado, enviando para Omie...');

    // 3. Enviar contrato para Omie
    const response = await omieClient.incluirContrato(contratoModel);

    if (response.cCodStatus === '0') {
      // Sucesso
      logger.log(`✅ Contrato criado com sucesso - ID Omie: ${response.nCodCtr}`);
      
      // Atualizar status no banco
      await mongoClient.atualizarStatusConsolidacao(
        consolidacaoData._id?.toString() || '',
        'sent',
        undefined
      );

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'Contrato criado com sucesso',
          data: {
            proposta: consolidacaoData.numeroProposta,
            contratoId: response.nCodCtr,
            integrationCode: response.cCodIntCtr
          }
        })
      };
    } else {
      // Erro da API Omie
      logger.error(`❌ Erro ao criar contrato: ${response.cDescStatus}`);
      
      // Atualizar status de erro no banco
      await mongoClient.atualizarStatusConsolidacao(
        consolidacaoData._id?.toString() || '',
        'error',
        response.cDescStatus
      );

      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          error: response.cDescStatus,
          data: {
            proposta: consolidacaoData.numeroProposta
          }
        })
      };
    }

  } catch (error) {
    logger.error('💥 Erro ao criar contrato:', error);
    
    // Atualizar status de erro no banco se possível
    if (event.consolidacaoData?._id) {
      try {
        await mongoClient.atualizarStatusConsolidacao(
          event.consolidacaoData._id.toString(),
          'error',
          error.message
        );
      } catch (updateError) {
        logger.error('Erro ao atualizar status de erro:', updateError);
      }
    }
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  } finally {
    await mongoClient.disconnect();
  }
};

// Função para criar modelo de contrato Omie
async function criarModeloContratoOmie(
  consolidacaoData: any,
  empresaConfig: EmpresaConfig
): Promise<ContratoOmie> {
  const { competencia, empresaId, numeroProposta, valorTotal, produtos } = consolidacaoData;
  
  // CORRIGIDO: Código mais compacto (máximo 20 caracteres)
  // Formato: EMP{ID}-{AAMM}-{PROP} onde PROP são os últimos 6 dígitos da proposta
  const [ano, mes] = competencia.split('-');
  const anoCompacto = ano.slice(-2); // Últimos 2 dígitos do ano
  const propCompacta = numeroProposta.slice(-6); // Últimos 6 dígitos da proposta
  const cCodIntCtr = `EMP${empresaId}-${anoCompacto}${mes}-${propCompacta}`;
  
  // Verificar se não excede 20 caracteres
  if (cCodIntCtr.length > 20) {
    logger.error(`⚠️ Código de integração truncado: ${cCodIntCtr} (${cCodIntCtr.length} chars)`);
  }
  
  const descricaoProdutos = produtos.map((p: any) => p.nome).join(', ');
  const descricaoCompleta = `Serviços do período ${mes}/${ano} — Proposta ${numeroProposta} — Produtos: ${descricaoProdutos}`;
  
  logger.log(`📋 Código integração: ${cCodIntCtr} (${cCodIntCtr.length} caracteres)`);
  
  const contratoModel: ContratoOmie = {
    cabecalho: {
      cCodIntCtr: cCodIntCtr,
      cNumCtr: numeroProposta, // Número do contrato obrigatório
      cCodSit: '10',
      cTipoFat: empresaConfig.configuracao.tipoFaturamento,
      dVigInicial: empresaConfig.configuracao.vigenciaInicial,
      dVigFinal: empresaConfig.configuracao.vigenciaFinal,
      nCodCli: empresaConfig.codigoClienteOmie,
      nDiaFat: empresaConfig.configuracao.diaFaturamento,
      nValTotMes: valorTotal
    },
    itensContrato: produtos
      .filter((produto: any) => produto.valor > 0) // Filtrar produtos com valor 0
      .map((produto: any, index: number) => {
        const quantidade = produto.quantidade || 1;
        const valorTotalItem = parseFloat(produto.valor) || 0; // Este já é o valor total do produto
        const valorUnitario = quantidade > 0 ? Math.round((valorTotalItem / quantidade) * 100) / 100 : valorTotalItem; // Calcular unitário
        
        // Log detalhado para debug
        logger.log(`🔍 Item ${index + 1}: ${produto.nome} - Qtd: ${quantidade}, ValorTotal: ${valorTotalItem}, ValorUnit: ${valorUnitario}`);
        
        if (valorTotalItem === 0 || isNaN(valorTotalItem)) {
          logger.error(`⚠️ PROBLEMA: Produto ${produto.nome} tem valorTotalItem inválido: ${valorTotalItem}`);
        }
        
        return {
          itemCabecalho: {
            aliqDesconto: 0,
            cCodCategItem: '1.01.03',
            cNaoGerarFinanceiro: 'N',
            cTpDesconto: '',
            codIntItem: (index + 1).toString(),
            codLC116: '1.06',
            codNBS: '',
            codServMunic: '620230000',
            codServico: 2360610897,
            natOperacao: '01',
            quant: quantidade,
            seq: index + 1,
            valorAcrescimo: 0,
            valorDed: 0,
            valorDesconto: 0,
            valorOutrasRetencoes: 0,
            valorTotal: valorTotalItem, // Valor total deste item específico
            valorUnit: valorUnitario // Valor unitário do produto - CAMPO OBRIGATÓRIO
          },
          itemDescrServ: {
            descrCompleta: produto.nome.toUpperCase() // Simplificado como no código original
          },
          itemImpostos: {
            aliqCOFINS: 3,
            aliqCSLL: 1,
            aliqINSS: 0,
            aliqIR: 1.5,
            aliqISS: 2,
            aliqPIS: 0.65,
            lDeduzISS: false,
            redBaseCOFINS: 0,
            redBaseINSS: 0,
            redBasePIS: 0,
            retCOFINS: 'S',
            retCSLL: 'S',
            retINSS: 'N',
            retIR: 'N',
            retISS: 'N',
            retPIS: 'S',
            valorCOFINS: Math.round(valorTotalItem * 0.03 * 100) / 100,
            valorCSLL: Math.round(valorTotalItem * 0.01 * 100) / 100,
            valorINSS: 0,
            valorIR: Math.round(valorTotalItem * 0.015 * 100) / 100,
            valorISS: Math.round(valorTotalItem * 0.02 * 100) / 100,
            valorPIS: Math.round(valorTotalItem * 0.0065 * 100) / 100
          },
          itemLeiTranspImp: {
            aliMunicipal: 0,
            aliqEstadual: 0,
            aliqFederal: 0,
            chave: '',
            fonte: ''
          }
        };
      }),
    observacoes: {
      cObsContrato: `Consolidação automática InAnbetec. Competência ${mes}/${ano}.`
    },
    infAdic: {
      cCodCateg: '1.01.01',
      nCodCC: 2404200141
    },
    vencTextos: {
      cAdContrato: 'N',
      cAdPeriodo: 'S',
      cAdVenc: 'S',
      cAntecipar: 'S',
      cCodPerRef: '001',
      cDiaFim: 1,
      cDiaIni: 1,
      cPostergar: 'N',
      cProxMes: '',
      cTpVenc: '002',
      nDias: 30,
      nDiaFixo: 30
    },
    departamentos: [
      {
        cCodDep: '5643744987', // Código do departamento "Produtos próprio"
        cDesDep: '', // Sempre vazio conforme especificação
        nPerDep: 100, // 100% do valor para este departamento
        nValDep: valorTotal // Valor total do contrato
      }
    ],
    emailCliente: {
      cEnviarBoleto: 'S', // CORRIGIDO: Enviar boleto SIM
      cEnviarLinkNfse: 'S', // CORRIGIDO: Enviar link NFSe SIM
      cEnviarRecibo: 'N',
      cUtilizarEmails: ''
    }
  };
  
  // Log completo do modelo que será enviado para debug
  logger.log(`📤 JSON completo que será enviado para Omie:`);
  logger.log(JSON.stringify(contratoModel, null, 2));
  
  // Validação extra: verificar se todos os itens têm valorUnit válido
  contratoModel.itensContrato.forEach((item, index) => {
    if (!item.itemCabecalho.valorUnit || item.itemCabecalho.valorUnit === 0) {
      logger.error(`🚨 ERRO: Item ${index + 1} tem valorUnit inválido: ${item.itemCabecalho.valorUnit}`);
      throw new Error(`Item ${index + 1} tem valorUnit inválido`);
    }
  });
  
  return contratoModel;
}