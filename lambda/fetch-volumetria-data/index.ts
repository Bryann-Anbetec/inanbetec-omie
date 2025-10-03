/**
 * LAMBDA: BUSCAR DADOS DE VOLUMETRIA
 * 
 * Esta função busca dados de volumetria em endpoint específico
 * 
 * Event: { competencia: string, empresaId: number, dataInicial: string, dataFinal: string }
 * 
 * Fluxo:
 * 1. Recebe parâmetros de competência e empresa
 * 2. Calcula período se não fornecido
 * 3. Busca dados de volumetria no endpoint
 * 4. Invoca próxima Lambda para processar os dados
 */

import { LambdaLogger } from '../shared/logger';
import { FetchVolumetriaEvent, LambdaResponse, LambdaContext, VolumetriaData } from '../shared/types';

const logger = new LambdaLogger('FetchVolumetriaData');

export const handler = async (
  event: FetchVolumetriaEvent,
  context: LambdaContext
): Promise<LambdaResponse> => {
  logger.log('📊 Iniciando busca de dados de volumetria', { 
    event, 
    requestId: context.requestId 
  });

  try {
    const { competencia, empresaId } = event;
    
    // Calcular período se não fornecido
    const { dataInicial, dataFinal } = event.dataInicial && event.dataFinal 
      ? { dataInicial: event.dataInicial, dataFinal: event.dataFinal }
      : calcularPeriodoCompetencia(competencia);

    logger.log(`Buscando volumetria - Empresa: ${empresaId}, Período: ${dataInicial} até ${dataFinal}`);

    // Buscar dados de volumetria
    const volumetriaData = await buscarVolumetriaDados({
      dataInicial,
      dataFinal,
      empresas: empresaId.toString()
    });

    if (!volumetriaData || volumetriaData.length === 0) {
      logger.warn(`Sem dados de volumetria para empresa ${empresaId} no período`);
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'Sem dados de volumetria no período',
          data: {
            empresaId,
            competencia,
            periodo: { dataInicial, dataFinal },
            volumetria: []
          }
        })
      };
    }

    logger.log(`Encontrados dados de volumetria: ${volumetriaData.length} registros`);

    // Invocar próxima Lambda para processar os dados
    await invocarProcessamentoData({
      volumetriaData,
      competencia,
      empresaId
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Dados de volumetria obtidos e enviados para processamento',
        data: {
          empresaId,
          competencia,
          periodo: { dataInicial, dataFinal },
          registrosEncontrados: volumetriaData.length
        }
      })
    };

  } catch (error) {
    logger.error('💥 Erro ao buscar dados de volumetria:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};

// Função para calcular período da competência
function calcularPeriodoCompetencia(competencia: string): { dataInicial: string; dataFinal: string } {
  const [ano, mes] = competencia.split('-');
  const ultimoDia = new Date(parseInt(ano), parseInt(mes), 0).getDate();
  
  return {
    dataInicial: `${ano}-${mes}-01`,
    dataFinal: `${ano}-${mes}-${ultimoDia.toString().padStart(2, '0')}`
  };
}

// Função para buscar dados de volumetria
async function buscarVolumetriaDados(params: {
  dataInicial: string;
  dataFinal: string;
  empresas: string;
}): Promise<VolumetriaData[]> {
  try {
    const volumetriaApiUrl = process.env.VOLUMETRIA_API_URL;
    const volumetriaApiKey = process.env.VOLUMETRIA_API_KEY;

    if (!volumetriaApiUrl || !volumetriaApiKey) {
      throw new Error('VOLUMETRIA_API_URL e VOLUMETRIA_API_KEY são obrigatórios');
    }

    logger.log('Iniciando consulta de volumetria', params);

    const queryParams = new URLSearchParams({
      dataInicial: params.dataInicial,
      dataFinal: params.dataFinal,
      empresas: params.empresas
    });

    const response = await fetch(`${volumetriaApiUrl}/volumetria?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${volumetriaApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro na API de volumetria: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    logger.log('Resposta da volumetria recebida:', data);

    return data || [];

  } catch (error) {
    logger.error('Erro ao buscar dados de volumetria:', error);
    throw error;
  }
}

// Função para invocar a próxima Lambda (processar e gravar dados)
async function invocarProcessamentoData(payload: {
  volumetriaData: VolumetriaData[];
  competencia: string;
  empresaId: number;
}): Promise<void> {
  try {
    const AWS = require('aws-sdk');
    const lambda = new AWS.Lambda({
      region: process.env.AWS_REGION || 'us-east-1'
    });

    const params = {
      FunctionName: process.env.PROCESS_DATA_LAMBDA_ARN || 'process-and-store-data',
      InvocationType: 'Event', // Assíncrona
      Payload: JSON.stringify(payload)
    };

    logger.log('Invocando Lambda de processamento de dados');

    await lambda.invoke(params).promise();

    logger.log('Lambda de processamento invocada com sucesso');

  } catch (error) {
    logger.error('Erro ao invocar Lambda de processamento:', error);
    throw error;
  }
}