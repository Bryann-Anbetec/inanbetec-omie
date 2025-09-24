// Teste da integração Volumetria + Omie
const { handler } = require('./index');

// Configurar variáveis de ambiente para teste
process.env.OMIE_APP_KEY = 'test_key';
process.env.OMIE_APP_SECRET = 'test_secret';

async function testarIntegracao() {
  console.log('=== TESTE DE INTEGRAÇÃO VOLUMETRIA + OMIE ===\n');

  try {
    // 1. Teste: Consultar dados de volumetria
    console.log('1. Consultando dados de volumetria...');
    const consultaEvent = {
      httpMethod: 'GET',
      path: '/volumetria/51',
      queryStringParameters: {
        dataInicial: '2025-08-28',
        dataFinal: '2025-08-30'
      }
    };

    const consultaResult = await handler(consultaEvent, {});
    console.log('Resultado da consulta:');
    console.log(JSON.stringify(JSON.parse(consultaResult.body), null, 2));
    console.log('\n');

    // 2. Teste: Criar contrato baseado em volumetria
    console.log('2. Criando contrato baseado em volumetria...');
    const criarEvent = {
      httpMethod: 'POST',
      path: '/contratos/volumetria',
      body: JSON.stringify({
        empresaId: 51,
        dataInicial: '2025-08-28',
        dataFinal: '2025-08-30',
        dadosEmpresa: {
          cidade: 'São Paulo',
          categoria: 'SERVICOS_TI',
          centroCusto: 1001,
          projeto: 2001,
          vendedor: 123,
          diaFaturamento: 30,
          diasVencimento: 30
        }
      })
    };

    const criarResult = await handler(criarEvent, {});
    console.log('Resultado da criação do contrato:');
    console.log(JSON.stringify(JSON.parse(criarResult.body), null, 2));

  } catch (error) {
    console.error('Erro no teste:', error.message);
  }
}

// Função para testar apenas a consulta de volumetria (sem criar contrato)
async function testarApenasCOnsulta() {
  console.log('=== TESTE APENAS CONSULTA VOLUMETRIA ===\n');

  try {
    const consultaEvent = {
      httpMethod: 'GET',
      path: '/volumetria/51',
      queryStringParameters: {
        dataInicial: '2025-08-28',
        dataFinal: '2025-08-30'
      }
    };

    const result = await handler(consultaEvent, {});
    const response = JSON.parse(result.body);
    
    console.log('Status Code:', result.statusCode);
    console.log('Dados retornados:');
    console.log(JSON.stringify(response, null, 2));

    if (response.success) {
      console.log('\n=== ANÁLISE DOS DADOS ===');
      console.log('Empresa ID:', response.volumetria[0]?.idEmpresa);
      
      if (response.volumetria[0]?.cobranca) {
        console.log('Cobrança:');
        console.log('  - Títulos:', response.volumetria[0].cobranca.qtdeTitulos);
        console.log('  - Valor Total:', response.volumetria[0].cobranca.valorTotal);
      }
      
      if (response.volumetria[0]?.pixpay) {
        console.log('PixPay:');
        console.log('  - Motoristas:', response.volumetria[0].pixpay.qtdeMotoristas);
        console.log('  - Valor Total:', response.volumetria[0].pixpay.valorTotal);
      }

      if (response.contratoMapeado) {
        console.log('\nContrato Mapeado:');
        console.log('  - Código Integração:', response.contratoMapeado.cCodIntCtr);
        console.log('  - Cliente:', response.contratoMapeado.nCodCli);
        console.log('  - Valor Mensal:', response.contratoMapeado.nValTotMes);
        console.log('  - Itens:', response.contratoMapeado.itensContrato.length);
      }
    }

  } catch (error) {
    console.error('Erro:', error.message);
  }
}

// Função para testar campos de relatório diretamente na API Inanbetec
async function testarCamposRelatorio() {
  console.log('=== TESTE CAMPOS DE RELATÓRIO INANBETEC ===\n');
  
  const axios = require('axios');
  const baseURL = 'https://edi-financeiro.inanbetec.com.br/v1/volumetria';
  
  const testes = [
    {
      nome: 'Relatórios com parâmetros básicos',
      url: `${baseURL}/relatorios`,
      params: {
        dataInicial: '2025-08-28',
        dataFinal: '2025-08-30',
        empresas: '51'
      }
    },
    {
      nome: 'Relatórios sem parâmetros',
      url: `${baseURL}/relatorios`,
      params: {}
    },
    {
      nome: 'Relatórios com empresa específica',
      url: `${baseURL}/relatorios`,
      params: {
        empresas: '51'
      }
    },
    {
      nome: 'Subserviços com config exemplo',
      url: `${baseURL}/subservicos/config1`,
      params: {}
    },
    {
      nome: 'Register GET',
      url: `${baseURL}/register`,
      params: {}
    }
  ];

  for (const teste of testes) {
    console.log(`\n--- ${teste.nome} ---`);
    try {
      const response = await axios.get(teste.url, { params: teste.params });
      console.log('Status:', response.status);
      console.log('Dados:', JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log('Erro:', error.response?.status || 'Network Error');
      console.log('Mensagem:', error.response?.data || error.message);
      
      // Se for erro 400, pode indicar parâmetros obrigatórios
      if (error.response?.status === 400) {
        console.log('⚠️  Possível parâmetro obrigatório faltando');
      }
    }
  }
}

// Função para analisar todos os endpoints disponíveis
async function analisarEndpoints() {
  console.log('=== ANÁLISE DE ENDPOINTS DISPONÍVEIS ===\n');

  const endpoints = [
    {
      nome: 'Listar Endpoints',
      event: { httpMethod: 'GET', path: '/invalid' }
    },
    {
      nome: 'Consultar Volumetria',
      event: {
        httpMethod: 'GET',
        path: '/volumetria/51',
        queryStringParameters: {
          dataInicial: '2025-08-28',
          dataFinal: '2025-08-30'
        }
      }
    }
  ];

  for (const endpoint of endpoints) {
    console.log(`\n--- ${endpoint.nome} ---`);
    try {
      const result = await handler(endpoint.event, {});
      console.log('Status:', result.statusCode);
      
      const body = JSON.parse(result.body);
      if (result.statusCode === 404 && body.availableEndpoints) {
        console.log('Endpoints disponíveis:');
        body.availableEndpoints.forEach(ep => console.log(`  - ${ep}`));
      } else {
        console.log('Resposta:', JSON.stringify(body, null, 2));
      }
    } catch (error) {
      console.error('Erro:', error.message);
    }
  }
}

// Executar testes
if (require.main === module) {
  console.log('Escolha o teste a executar:');
  console.log('1. Teste completo (testarIntegracao)');
  console.log('2. Apenas consulta (testarApenasCOnsulta)'); 
  console.log('3. Analisar endpoints (analisarEndpoints)');
  console.log('4. Testar campos de relatório (testarCamposRelatorio)');
  
  const teste = process.argv[2] || '2';
  
  switch (teste) {
    case '1':
      testarIntegracao();
      break;
    case '2':
      testarApenasCOnsulta();
      break;
    case '3':
      analisarEndpoints();
      break;
    case '4':
      testarCamposRelatorio();
      break;
    default:
      testarApenasCOnsulta();
  }
}

module.exports = {
  testarIntegracao,
  testarApenasCOnsulta,
  analisarEndpoints,
  testarCamposRelatorio
};
