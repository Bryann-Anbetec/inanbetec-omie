/**
 * LAMBDA: SINCRONIZAÇÃO CNPJ (OMIE → INANBETEC)
 * 
 * Esta função busca clientes no Omie e sincroniza com InAnbetec via CNPJ
 * 
 * Event: { empresaIds?: number[], direction: 'omie-to-inanbetec' }
 * 
 * Fluxo:
 * 1. Busca clientes no Omie
 * 2. Para cada cliente, verifica se existe no InAnbetec via CNPJ
 * 3. Se não existe, cria o cliente no InAnbetec
 * 4. Se existe, atualiza dados se necessário
 */

import { LambdaLogger } from '../shared/logger';
import { OmieClient } from '../shared/omie-client';
import { SyncCnpjEvent, LambdaResponse, LambdaContext } from '../shared/types';

const logger = new LambdaLogger('SyncCnpjOmieToInanbetec');

export const handler = async (
  event: SyncCnpjEvent,
  context: LambdaContext
): Promise<LambdaResponse> => {
  logger.log('🔄 Iniciando sincronização CNPJ (Omie → InAnbetec)', { 
    event, 
    requestId: context.requestId 
  });

  try {
    const omieClient = new OmieClient();
    const resultados = [];

    // 1. Buscar todos os clientes do Omie
    const clientesOmie = await buscarTodosClientesOmie(omieClient);
    
    logger.log(`Encontrados ${clientesOmie.length} clientes no Omie`);

    for (const clienteOmie of clientesOmie) {
      if (!clienteOmie.cnpj_cpf) {
        logger.warn(`Cliente Omie ${clienteOmie.codigo_cliente_omie} sem CNPJ, pulando`);
        continue;
      }

      try {
        // 2. Verificar se cliente existe no InAnbetec pelo CNPJ
        const clienteInAnbetec = await verificarClienteInAnbetecPorCnpj(clienteOmie.cnpj_cpf);

        if (clienteInAnbetec) {
          // Cliente já existe
          logger.log(`Cliente ${clienteOmie.cnpj_cpf} já existe no InAnbetec - ID: ${clienteInAnbetec.id}`);
          
          resultados.push({
            cnpj: clienteOmie.cnpj_cpf,
            omieClientId: clienteOmie.codigo_cliente_omie,
            inanbetecClientId: clienteInAnbetec.id,
            action: 'already_exists'
          });
        } else {
          // 3. Criar cliente no InAnbetec
          const novoClienteInAnbetec = await criarClienteInAnbetec(clienteOmie);
          
          logger.log(`Cliente ${clienteOmie.cnpj_cpf} criado no InAnbetec - ID: ${novoClienteInAnbetec.id}`);
          
          resultados.push({
            cnpj: clienteOmie.cnpj_cpf,
            omieClientId: clienteOmie.codigo_cliente_omie,
            inanbetecClientId: novoClienteInAnbetec.id,
            action: 'created'
          });
        }

      } catch (error) {
        logger.error(`Erro ao processar cliente ${clienteOmie.cnpj_cpf}:`, error);
        resultados.push({
          cnpj: clienteOmie.cnpj_cpf,
          omieClientId: clienteOmie.codigo_cliente_omie,
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

// Função para buscar todos os clientes do Omie
async function buscarTodosClientesOmie(omieClient: OmieClient): Promise<any[]> {
  try {
    const todosClientes = [];
    let pagina = 1;
    const registrosPorPagina = 50;
    let temMaisRegistros = true;

    while (temMaisRegistros) {
      logger.log(`Buscando página ${pagina} de clientes no Omie`);
      
      const response = await omieClient.listarClientes({
        pagina,
        registros_por_pagina: registrosPorPagina,
        apenas_importado_api: 'N'
      });

      if (response.clientes_cadastro && response.clientes_cadastro.length > 0) {
        todosClientes.push(...response.clientes_cadastro);
        
        // Verificar se há mais páginas
        const totalRegistros = response.total_de_registros || 0;
        const registrosCarregados = pagina * registrosPorPagina;
        temMaisRegistros = registrosCarregados < totalRegistros;
        
        pagina++;
      } else {
        temMaisRegistros = false;
      }
    }

    return todosClientes;

  } catch (error) {
    logger.error('Erro ao buscar clientes do Omie:', error);
    throw error;
  }
}

// Função para verificar se cliente existe no InAnbetec por CNPJ
async function verificarClienteInAnbetecPorCnpj(cnpj: string): Promise<any> {
  try {
    const inanbetecApiUrl = process.env.INANBETEC_API_URL;
    const inanbetecApiKey = process.env.INANBETEC_API_KEY;

    if (!inanbetecApiUrl || !inanbetecApiKey) {
      throw new Error('INANBETEC_API_URL e INANBETEC_API_KEY são obrigatórios');
    }

    const response = await fetch(`${inanbetecApiUrl}/empresas/search?cnpj=${cnpj}`, {
      headers: {
        'Authorization': `Bearer ${inanbetecApiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Erro ao buscar empresa por CNPJ ${cnpj}: ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    logger.error(`Erro ao buscar cliente InAnbetec por CNPJ ${cnpj}:`, error);
    throw error;
  }
}

// Função para criar cliente no InAnbetec
async function criarClienteInAnbetec(clienteOmie: any): Promise<any> {
  try {
    const inanbetecApiUrl = process.env.INANBETEC_API_URL;
    const inanbetecApiKey = process.env.INANBETEC_API_KEY;

    if (!inanbetecApiUrl || !inanbetecApiKey) {
      throw new Error('INANBETEC_API_URL e INANBETEC_API_KEY são obrigatórios');
    }

    const clienteInAnbetec = {
      cnpj: clienteOmie.cnpj_cpf,
      razaoSocial: clienteOmie.razao_social,
      nomeFantasia: clienteOmie.nome_fantasia,
      endereco: {
        logradouro: clienteOmie.endereco,
        cidade: clienteOmie.cidade,
        estado: clienteOmie.estado,
        cep: clienteOmie.cep
      },
      telefone: clienteOmie.telefone1_numero,
      email: clienteOmie.email,
      origem: 'OMIE_SYNC',
      codigoOmie: clienteOmie.codigo_cliente_omie
    };

    const response = await fetch(`${inanbetecApiUrl}/empresas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${inanbetecApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(clienteInAnbetec)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Erro ao criar empresa no InAnbetec: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    logger.error('Erro ao criar cliente no InAnbetec:', error);
    throw error;
  }
}