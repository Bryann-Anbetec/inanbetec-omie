const axios = require('axios');

// Simulação do evento Lambda para testar listagem de contratos
async function testarListarContratos() {
  console.log('='.repeat(60));
  console.log('TESTE: Listar Contratos - Endpoint GET /contratos');
  console.log('='.repeat(60));

  // Importar o handler do index.js
  const { handler } = require('./index.js');

  // Configurar variáveis de ambiente para teste
  process.env.OMIE_APP_KEY = '1634899698432';
  process.env.OMIE_APP_SECRET = '959a26dbf95a68a3c94abbabee37cf86';

  // Cenário 1: Listar contratos com parâmetros padrão
  console.log('\n📋 Cenário 1: Listagem básica (página 1, 10 registros)');
  console.log('-'.repeat(50));
  
  const evento1 = {
    httpMethod: 'GET',
    path: '/contratos',
    queryStringParameters: {
      pagina: '1',
      registros_por_pagina: '10',
      apenas_importado_api: 'N'
    }
  };

  try {
    const resultado1 = await handler(evento1, {});
    console.log('✅ Status Code:', resultado1.statusCode);
    
    const body1 = JSON.parse(resultado1.body);
    console.log('✅ Success:', body1.success);
    
    if (body1.success) {
      console.log('📊 Dados da listagem:');
      console.log(`   - Página atual: ${body1.pagina}`);
      console.log(`   - Total de páginas: ${body1.total_de_paginas}`);
      console.log(`   - Registros por página: ${body1.registros}`);
      console.log(`   - Total de registros: ${body1.total_de_registros}`);
      console.log(`   - Contratos retornados: ${body1.contratos ? body1.contratos.length : 0}`);
      
      if (body1.contratos && body1.contratos.length > 0) {
        console.log('\n📝 Primeiro contrato da lista:');
        const primeiroContrato = body1.contratos[0];
        console.log(`   - ID: ${primeiroContrato.cabecalho?.nCodCtr || 'N/A'}`);
        console.log(`   - Código Integração: ${primeiroContrato.cabecalho?.cCodIntCtr || 'N/A'}`);
        console.log(`   - Número: ${primeiroContrato.cabecalho?.cNumCtr || 'N/A'}`);
        console.log(`   - Cliente: ${primeiroContrato.cabecalho?.nCodCli || 'N/A'}`);
        console.log(`   - Status: ${primeiroContrato.cabecalho?.cCodSit || 'N/A'}`);
        console.log(`   - Valor Total Mensal: R$ ${primeiroContrato.cabecalho?.nValTotMes || 'N/A'}`);
      }
    } else {
      console.log('❌ Erro:', body1.error);
    }
    
  } catch (error) {
    console.log('❌ Erro na execução:', error.message);
  }

  // Cenário 2: Listar apenas contratos importados via API
  console.log('\n\n📋 Cenário 2: Apenas contratos importados via API');
  console.log('-'.repeat(50));
  
  const evento2 = {
    httpMethod: 'GET',
    path: '/contratos',
    queryStringParameters: {
      pagina: '1',
      registros_por_pagina: '5',
      apenas_importado_api: 'S'
    }
  };

  try {
    const resultado2 = await handler(evento2, {});
    console.log('✅ Status Code:', resultado2.statusCode);
    
    const body2 = JSON.parse(resultado2.body);
    console.log('✅ Success:', body2.success);
    
    if (body2.success) {
      console.log('📊 Dados da listagem (apenas API):');
      console.log(`   - Total de registros: ${body2.total_de_registros}`);
      console.log(`   - Contratos retornados: ${body2.contratos ? body2.contratos.length : 0}`);
    } else {
      console.log('❌ Erro:', body2.error);
    }
    
  } catch (error) {
    console.log('❌ Erro na execução:', error.message);
  }

  // Cenário 3: Teste com página inexistente
  console.log('\n\n📋 Cenário 3: Página inexistente (999)');
  console.log('-'.repeat(50));
  
  const evento3 = {
    httpMethod: 'GET',
    path: '/contratos',
    queryStringParameters: {
      pagina: '999',
      registros_por_pagina: '10'
    }
  };

  try {
    const resultado3 = await handler(evento3, {});
    console.log('✅ Status Code:', resultado3.statusCode);
    
    const body3 = JSON.parse(resultado3.body);
    console.log('✅ Success:', body3.success);
    
    if (body3.success) {
      console.log('📊 Resultado página inexistente:');
      console.log(`   - Contratos retornados: ${body3.contratos ? body3.contratos.length : 0}`);
    } else {
      console.log('❌ Erro:', body3.error);
    }
    
  } catch (error) {
    console.log('❌ Erro na execução:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('TESTE CONCLUÍDO');
  console.log('='.repeat(60));
}

// Executar o teste
if (require.main === module) {
  testarListarContratos().catch(console.error);
}

module.exports = { testarListarContratos };