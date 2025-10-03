/**
 * LAMBDA: SINCRONIZAÇÃO CNPJ (INANBETEC → OMIE)
 * 
 * Esta função busca clientes no InAnbetec e sincroniza com Omie via CNPJ
 * 
 * Event: { empresaIds?: number[], direction: 'inanbetec-to-omie' }
 * 
 * Fluxo:
 * 1. Busca clientes no InAnbetec
 * 2. Para cada cliente, verifica se existe no Omie via CNPJ
 * 3. Se não existe, cria o cliente no Omie
 * 4. Se existe, atualiza dados se necessário
 */

import { LambdaLogger } from '../shared/logger';
import { OmieClient } from '../shared/omie-client';
import { SyncCnpjEvent, LambdaResponse, LambdaContext } from '../shared/types';

const logger = new LambdaLogger('SyncCnpjInanbetecToOmie');

export const handler = async (
  event: SyncCnpjEvent,
  context: LambdaContext
): Promise<LambdaResponse> => {
  logger.log('🔄 Iniciando sincronização CNPJ (InAnbetec → Omie)', { 
    event, 
    requestId: context.requestId 
  });

  try {
    const omieClient = new OmieClient();
    const empresaIds = event.empresaIds || await obterEmpresasAtivas();

    const resultados = [];

    for (const empresaId of empresaIds) {
      logger.log(`Processando empresa: ${empresaId}`);
      
      try {
        // 1. Buscar dados do cliente no InAnbetec
        const clienteInAnbetec = await buscarClienteInAnbetec(empresaId);
        
        if (!clienteInAnbetec) {
          logger.warn(`Empresa ${empresaId} não encontrada no InAnbetec`);
          continue;
        }

        // 2. Verificar se cliente existe no Omie pelo CNPJ
        const clienteOmie = await verificarClienteOmiePorCnpj(
          omieClient, 
          clienteInAnbetec.cnpj
        );

        if (clienteOmie) {
          // Cliente já existe, verificar se precisa atualizar
          logger.log(`Cliente ${clienteInAnbetec.cnpj} já existe no Omie - ID: ${clienteOmie.codigo_cliente_omie}`);
          
          // Aqui poderia implementar lógica de atualização se necessário
          resultados.push({
            empresaId,
            cnpj: clienteInAnbetec.cnpj,
            action: 'already_exists',
            omieClientId: clienteOmie.codigo_cliente_omie
          });
        } else {
          // 3. Criar cliente no Omie
          const novoClienteOmie = await criarClienteOmie(omieClient, clienteInAnbetec);
          
          logger.log(`Cliente ${clienteInAnbetec.cnpj} criado no Omie - ID: ${novoClienteOmie.codigo_cliente_omie}`);
          
          resultados.push({
            empresaId,
            cnpj: clienteInAnbetec.cnpj,
            action: 'created',
            omieClientId: novoClienteOmie.codigo_cliente_omie
          });
        }

      } catch (error) {
        logger.error(`Erro ao processar empresa ${empresaId}:`, error);
        resultados.push({
          empresaId,
          action: 'error',
          error: error.message
        });
      }
    }

    logger.log('✅ Sincronização concluída', { 
      total: resultados.length,
      criados: resultados.filter(r => r.action === 'created').length,
      existentes: resultados.filter(r => r.action === 'already_exists').length,
      erros: resultados.filter(r => r.action === 'error').length
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Sincronização concluída',
        resultados
      })
    };

  } catch (error) {
    logger.error('💥 Erro crítico na sincronização:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};

// Função para obter empresas ativas (substituir pela lógica real)
async function obterEmpresasAtivas(): Promise<number[]> {
  // Aqui você implementaria a lógica para buscar empresas ativas
  // Por enquanto, retornando um array com empresas exemplo
  return [258, 259, 260]; // IDs de exemplo
}

// Função para buscar cliente no InAnbetec
async function buscarClienteInAnbetec(empresaId: number): Promise<any> {
  try {
    const inanbetecApiUrl = process.env.INANBETEC_API_URL;
    const inanbetecApiKey = process.env.INANBETEC_API_KEY;

    if (!inanbetecApiUrl || !inanbetecApiKey) {
      throw new Error('INANBETEC_API_URL e INANBETEC_API_KEY são obrigatórios');
    }

    const response = await fetch(`${inanbetecApiUrl}/empresas/${empresaId}`, {
      headers: {
        'Authorization': `Bearer ${inanbetecApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Erro ao buscar empresa ${empresaId}: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      empresaId: data.id,
      cnpj: data.cnpj,
      razaoSocial: data.razaoSocial,
      nomeFantasia: data.nomeFantasia,
      endereco: data.endereco,
      cidade: data.cidade,
      estado: data.estado,
      cep: data.cep,
      telefone: data.telefone,
      email: data.email
    };

  } catch (error) {
    logger.error(`Erro ao buscar cliente InAnbetec ${empresaId}:`, error);
    throw error;
  }
}

// Função para verificar se cliente existe no Omie por CNPJ
async function verificarClienteOmiePorCnpj(omieClient: OmieClient, cnpj: string): Promise<any> {
  try {
    // Buscar cliente por CNPJ
    const response = await omieClient.consultarCliente({
      cnpj_cpf: cnpj
    });

    return response;

  } catch (error) {
    // Se erro for "cliente não encontrado", retornar null
    if (error.message.includes('não encontrado') || error.message.includes('404')) {
      return null;
    }
    throw error;
  }
}

// Função para criar cliente no Omie
async function criarClienteOmie(omieClient: OmieClient, clienteData: any): Promise<any> {
  try {
    const clienteOmie = {
      codigo_cliente_integracao: `INANBETEC_${clienteData.empresaId}`,
      cnpj_cpf: clienteData.cnpj,
      razao_social: clienteData.razaoSocial,
      nome_fantasia: clienteData.nomeFantasia,
      endereco: clienteData.endereco?.logradouro || '',
      cidade: clienteData.cidade || '',
      estado: clienteData.estado || '',
      cep: clienteData.cep || '',
      telefone1_numero: clienteData.telefone || '',
      email: clienteData.email || '',
      pessoa_fisica: 'N' // Assumindo pessoa jurídica
    };

    const response = await omieClient.incluirCliente(clienteOmie);
    
    return response;

  } catch (error) {
    logger.error('Erro ao criar cliente no Omie:', error);
    throw error;
  }
}