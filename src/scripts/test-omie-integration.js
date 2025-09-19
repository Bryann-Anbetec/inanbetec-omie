#!/usr/bin/env node

/**
 * Script de teste para integração InAnbetec ↔ Omie
 * 
 * Para executar:
 * npm install axios
 * node scripts/test-omie-integration.js
 */

const axios = require('axios');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Dados de teste
const empresaTeste = {
  nome: "Empresa Teste Omie LTDA",
  cnpj: "12.345.678/0001-99",
  responsavel: "João da Silva Teste",
  telefoneEmpresa: "(62) 99999-9999",
  telefoneResponsavel: "(62) 88888-8888",
  emailResponsavel: "teste@empresaomie.com.br",
  cpfResponsavel: "123.456.789-00",
  endereco: "Rua de Teste, 123",
  complemento: "Sala 101",
  cidade: "Goiânia",
  cep: "74000-000",
  status: true
};

async function testCadastrarCliente() {
  console.log('🔄 Testando cadastro de cliente...');
  
  try {
    const response = await axios.post(`${BASE_URL}/v1/clientes/cadastrar`, empresaTeste);
    
    console.log('✅ Cliente cadastrado com sucesso!');
    console.log('📋 Resposta:', JSON.stringify(response.data, null, 2));
    
    return response.data.inanbetec._id;
  } catch (error) {
    console.error('❌ Erro ao cadastrar cliente:', error.response?.data || error.message);
    return null;
  }
}

async function testConsultarOmie(cnpj) {
  console.log(`🔍 Consultando cliente no Omie por CNPJ: ${cnpj}...`);
  
  try {
    const response = await axios.get(`${BASE_URL}/v1/clientes/omie/consultar/${cnpj}`);
    
    console.log('✅ Cliente encontrado no Omie!');
    console.log('📋 Resposta:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('ℹ️  Cliente não encontrado no Omie');
    } else {
      console.error('❌ Erro ao consultar Omie:', error.response?.data || error.message);
    }
  }
}

async function testAlterarCliente(empresaId) {
  console.log(`🔄 Testando alteração de cliente ${empresaId}...`);
  
  const dadosAlterados = {
    ...empresaTeste,
    nome: "Empresa Teste Omie LTDA - ALTERADA",
    telefoneEmpresa: "(62) 77777-7777",
    endereco: "Rua Alterada, 456"
  };
  
  try {
    const response = await axios.put(`${BASE_URL}/v1/clientes/alterar/${empresaId}`, dadosAlterados);
    
    console.log('✅ Cliente alterado com sucesso!');
    console.log('📋 Resposta:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Erro ao alterar cliente:', error.response?.data || error.message);
  }
}

async function testSincronizarClientes() {
  console.log('🔄 Testando sincronização de clientes existentes...');
  
  try {
    const response = await axios.post(`${BASE_URL}/v1/clientes/sincronizar`, {
      sincronizarTodos: false, // Usar false para não sincronizar todos em teste
      empresaIds: [] // Lista vazia para teste, ou adicione IDs específicos
    });
    
    console.log('✅ Sincronização concluída!');
    console.log('📋 Resposta:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Erro na sincronização:', error.response?.data || error.message);
  }
}

async function testListarOmie() {
  console.log('📋 Testando listagem de clientes do Omie...');
  
  try {
    const response = await axios.get(`${BASE_URL}/v1/clientes/omie/listar?pagina=1&registros=5`);
    
    console.log('✅ Clientes listados com sucesso!');
    console.log('📋 Resposta:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Erro ao listar clientes Omie:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('🚀 Iniciando testes de integração InAnbetec ↔ Omie\n');
  
  // Teste 1: Consultar cliente no Omie (antes de cadastrar)
  await testConsultarOmie(empresaTeste.cnpj);
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Teste 2: Cadastrar cliente
  const empresaId = await testCadastrarCliente();
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Teste 3: Consultar cliente no Omie (depois de cadastrar)
  if (empresaId) {
    await testConsultarOmie(empresaTeste.cnpj);
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Teste 4: Alterar cliente
    await testAlterarCliente(empresaId);
    console.log('\n' + '='.repeat(60) + '\n');
  }
  
  // Teste 5: Sincronizar clientes
  await testSincronizarClientes();
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Teste 6: Listar clientes do Omie
  await testListarOmie();
  
  console.log('\n🎉 Testes concluídos!');
}

// Verificar se as variáveis de ambiente estão configuradas
if (!process.env.OMIE_APP_KEY || !process.env.OMIE_APP_SECRET) {
  console.warn('⚠️  Atenção: Variáveis OMIE_APP_KEY e OMIE_APP_SECRET não configuradas.');
  console.warn('   Configure as variáveis no arquivo .env para testar a integração completa.');
}

// Executar testes
runTests().catch(console.error);
