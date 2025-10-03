/**
 * LAMBDA: PROCESSAR E GRAVAR DADOS
 * 
 * Esta função recebe dados de volumetria, processa, grava no banco e invoca a próxima Lambda
 * 
 * Event: { volumetriaData: VolumetriaData[], competencia: string, empresaId: number }
 * 
 * Fluxo:
 * 1. Recebe dados de volumetria
 * 2. Extrai produtos da volumetria
 * 3. Busca propostas comerciais para cada produto
 * 4. Consolida dados por proposta
 * 5. Grava consolidação no banco
 * 6. Invoca Lambda de criação de contratos
 */

import { LambdaLogger } from '../shared/logger';
import { MongoDBClient } from '../shared/mongodb-client';
import { ProcessDataEvent, LambdaResponse, LambdaContext, VolumetriaData, Produto, ConsolidacaoData } from '../shared/types';

const logger = new LambdaLogger('ProcessAndStoreData');

export const handler = async (
  event: ProcessDataEvent,
  context: LambdaContext
): Promise<LambdaResponse> => {
  logger.log('⚙️ Iniciando processamento e gravação de dados', { 
    event, 
    requestId: context.requestId 
  });

  const mongoClient = new MongoDBClient();

  try {
    await mongoClient.connect();

    const { volumetriaData, competencia, empresaId } = event;

    if (!volumetriaData || volumetriaData.length === 0) {
      logger.warn('Sem dados de volumetria para processar');
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'Sem dados para processar'
        })
      };
    }

    // 1. Extrair produtos da volumetria
    const produtos = extrairProdutosDaVolumetria(volumetriaData[0]);
    logger.log(`Produtos extraídos da volumetria: ${produtos.length}`);

    if (produtos.length === 0) {
      logger.warn('Nenhum produto encontrado na volumetria');
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'Nenhum produto encontrado'
        })
      };
    }

    // 2. Buscar propostas comerciais para cada produto
    const produtosComProposta = [];
    const produtosDisponiveis = await obterProdutosComPropostas(empresaId);

    for (const nomeProduto of produtosDisponiveis) {
      try {
        logger.log(`Processando produto: ${nomeProduto}`);
        
        // Buscar dados na volumetria
        const produtoNaVolumetria = produtos.find(p => 
          p.nome.toLowerCase() === nomeProduto.toLowerCase()
        );
        
        // Buscar proposta comercial
        const numeroProposta = await obterPropostaPorProduto(empresaId, nomeProduto, competencia);
        
        if (numeroProposta) {
          const quantidade = produtoNaVolumetria?.quantidade || 0;
          
          // Buscar preço da proposta
          const precoDaProposta = await obterPrecoProdutoNaProposta(
            numeroProposta,
            nomeProduto,
            quantidade
          );
          
          if (precoDaProposta !== null && precoDaProposta >= 0) {
            produtosComProposta.push({
              produto: nomeProduto,
              valor: precoDaProposta,
              quantidade: quantidade,
              proposta: numeroProposta
            });
            
            logger.log(`✅ ${nomeProduto} → Proposta ${numeroProposta}: R$ ${precoDaProposta}`);
          }
        }
      } catch (error) {
        logger.error(`Erro ao processar produto ${nomeProduto}:`, error);
      }
    }

    if (produtosComProposta.length === 0) {
      logger.warn('Nenhum produto com proposta encontrado');
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'Nenhum produto com proposta encontrado'
        })
      };
    }

    // 3. Agrupar por número de proposta
    const propostasConsolidadas = agruparPorNumeroProposta(produtosComProposta);
    logger.log(`Propostas consolidadas: ${Object.keys(propostasConsolidadas).length}`);

    // 4. Gravar consolidações no banco
    const consolidacoesSalvas = [];
    
    for (const [numeroProposta, dadosProposta] of Object.entries(propostasConsolidadas)) {
      try {
        const dadosConsolidacao: ConsolidacaoData = {
          competencia,
          empresaId: empresaId.toString(), // Converter para string
          numeroProposta,
          valorTotal: dadosProposta.valorTotal,
          produtos: dadosProposta.produtos,
          status: 'completed', // Status válido
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const consolidacaoSalva = await mongoClient.salvarConsolidacao(dadosConsolidacao);
        consolidacoesSalvas.push(consolidacaoSalva);
        
        logger.log(`💾 Consolidação salva - Proposta: ${numeroProposta}`);
        
        // 5. Invocar Lambda de criação de contratos
        await invocarCriacaoContratos(consolidacaoSalva);
        
      } catch (error) {
        logger.error(`Erro ao processar proposta ${numeroProposta}:`, error);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Dados processados e gravados com sucesso',
        data: {
          empresaId,
          competencia,
          produtosProcessados: produtosComProposta.length,
          propostasConsolidadas: Object.keys(propostasConsolidadas).length,
          consolidacoesSalvas: consolidacoesSalvas.length
        }
      })
    };

  } catch (error) {
    logger.error('💥 Erro no processamento:', error);
    
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

// Função para extrair produtos da volumetria
function extrairProdutosDaVolumetria(volumetria: VolumetriaData): Produto[] {
  const produtos: Produto[] = [];

  const regrasExtracao = [
    {
      nome: 'cobranca',
      condicao: (v: VolumetriaData) => v.cobranca && (v.cobranca.qtdeTitulos > 0 || v.cobranca.valorTotal > 0),
      valor: (v: VolumetriaData) => v.cobranca?.valorTotal || 0,
      quantidade: (v: VolumetriaData) => v.cobranca?.qtdeTitulos || 0
    },
    {
      nome: 'pixpay',
      condicao: (v: VolumetriaData) => v.pixpay && (v.pixpay.qtdeMotoristas > 0 || (v.pixpay.valorTotal && v.pixpay.valorTotal > 0)),
      valor: (v: VolumetriaData) => v.pixpay?.valorTotal || 0,
      quantidade: (v: VolumetriaData) => v.pixpay?.qtdeMotoristas || 0
    },
    {
      nome: 'webcheckout',
      condicao: (v: VolumetriaData) => v.webcheckout && (v.webcheckout.qtdeTitulos > 0 || v.webcheckout.valorTotal > 0),
      valor: (v: VolumetriaData) => v.webcheckout?.valorTotal || 0,
      quantidade: (v: VolumetriaData) => v.webcheckout?.qtdeTitulos || 0
    },
    {
      nome: 'bolepix',
      condicao: (v: VolumetriaData) => v.bolepix && (v.bolepix.qtdeTitulos > 0 || v.bolepix.valorTotal > 0),
      valor: (v: VolumetriaData) => v.bolepix?.valorTotal || 0,
      quantidade: (v: VolumetriaData) => v.bolepix?.qtdeTitulos || 0
    },
    {
      nome: 'pagamentos',
      condicao: (v: VolumetriaData) => v.pagamentos && (v.pagamentos.qtdeTitulos > 0 || v.pagamentos.valorTotal > 0),
      valor: (v: VolumetriaData) => v.pagamentos?.valorTotal || 0,
      quantidade: (v: VolumetriaData) => v.pagamentos?.qtdeTitulos || 0
    }
  ];

  for (const regra of regrasExtracao) {
    if (regra.condicao(volumetria)) {
      produtos.push({
        nome: regra.nome,
        valor: regra.valor(volumetria),
        quantidade: regra.quantidade(volumetria)
      });
    }
  }

  return produtos;
}

// Função para obter produtos com propostas (implementar conforme sua lógica)
async function obterProdutosComPropostas(empresaId: number): Promise<string[]> {
  // Implementar lógica para buscar produtos que têm propostas
  // Por enquanto, retornando lista básica
  return ['cobranca', 'bolepix', 'pixpay', 'pagamentos', 'webcheckout'];
}

// Função para obter proposta por produto (implementar conforme sua lógica)
async function obterPropostaPorProduto(empresaId: number, nomeProduto: string, competencia: string): Promise<string | null> {
  // Implementar lógica de geração/busca de proposta
  // Por enquanto, gerando proposta dinâmica
  const [ano, mes] = competencia.split('-');
  return `${ano}${mes}00${empresaId}`;
}

// Função para obter preço do produto na proposta (implementar conforme sua lógica)
async function obterPrecoProdutoNaProposta(numeroProposta: string, nomeProduto: string, quantidade: number): Promise<number | null> {
  // Implementar lógica de cálculo de preço conforme regras de negócio
  const precosPorProduto: { [key: string]: number } = {
    'cobranca': quantidade * 0.06, // R$ 0,06 por título
    'bolepix': quantidade * 0.06,  // R$ 0,06 por título
    'pixpay': quantidade * 22,     // R$ 22 por motorista
    'pagamentos': 0,               // Sem cobrança
    'webcheckout': 1500            // Valor fixo
  };

  return precosPorProduto[nomeProduto] || 0;
}

// Função para agrupar por número de proposta
function agruparPorNumeroProposta(produtos: any[]): { [proposta: string]: any } {
  const agrupamento: { [key: string]: any } = {};
  
  for (const produto of produtos) {
    const { proposta, valor, produto: nomeProduto, quantidade } = produto;
    
    if (!agrupamento[proposta]) {
      agrupamento[proposta] = {
        valorTotal: 0,
        produtos: []
      };
    }
    
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

// Função para invocar Lambda de criação de contratos
async function invocarCriacaoContratos(consolidacaoData: ConsolidacaoData): Promise<void> {
  try {
    const AWS = require('aws-sdk');
    const lambda = new AWS.Lambda({
      region: process.env.AWS_REGION || 'us-east-1'
    });

    const params = {
      FunctionName: process.env.CREATE_CONTRACTS_LAMBDA_ARN || 'create-omie-contracts',
      InvocationType: 'Event', // Assíncrona
      Payload: JSON.stringify({
        consolidacaoData
      })
    };

    logger.log(`Invocando Lambda de criação de contratos - Proposta: ${consolidacaoData.numeroProposta}`);

    await lambda.invoke(params).promise();

    logger.log('Lambda de criação de contratos invocada com sucesso');

  } catch (error) {
    logger.error('Erro ao invocar Lambda de criação de contratos:', error);
    throw error;
  }
}