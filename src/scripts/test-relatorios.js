// Teste da nova lógica de contratos por produto baseados em relatórios
const { handler } = require('./index');

// Configurar variáveis de ambiente para teste
process.env.OMIE_APP_KEY = 'test_key';
process.env.OMIE_APP_SECRET = 'test_secret';

async function testarContratosRelatorios() {
  console.log('=== TESTE CONTRATOS BASEADOS EM RELATÓRIOS ===\n');

  try {
    // 1. Consultar relatórios e ver agrupamento por produto
    console.log('1. Consultando relatórios para análise...');
    const consultaEvent = {
      httpMethod: 'GET',
      path: '/relatorios/51',
      queryStringParameters: {
        dataInicial: '2025-09-01',
        dataFinal: '2025-09-15'
      }
    };

    const consultaResult = await handler(consultaEvent, {});
    const consultaData = JSON.parse(consultaResult.body);
    
    console.log('Status:', consultaResult.statusCode);
    console.log('Relatórios encontrados:', consultaData.resumo?.totalRelatorios);
    console.log('Produtos encontrados:', consultaData.resumo?.produtosEncontrados);
    console.log('Total de registros:', consultaData.resumo?.totalRegistros);
    
    if (consultaData.success && consultaData.contratosMapeados) {
      console.log('\n--- CONTRATOS MAPEADOS POR PRODUTO ---');
      Object.entries(consultaData.contratosMapeados).forEach(([produto, contrato]) => {
        if (contrato) {
          console.log(`\n${produto.toUpperCase()}:`);
          console.log(`  - Código: ${contrato.cCodIntCtr}`);
          console.log(`  - Cliente: ${contrato.nCodCli}`);
          console.log(`  - Valor Mensal: R$ ${contrato.nValTotMes}`);
          console.log(`  - Itens: ${contrato.itensContrato.length}`);
          if (contrato.itensContrato.length > 0) {
            console.log(`  - Quantidade: ${contrato.itensContrato[0].quant}`);
            console.log(`  - Valor Unit: R$ ${contrato.itensContrato[0].valorUnit}`);
          }
        }
      });
    }

    console.log('\n');

    // 2. Criar contratos para cada produto
    console.log('2. Criando contratos para cada produto...');
    const criarEvent = {
      httpMethod: 'POST',
      path: '/contratos/relatorios',
      body: JSON.stringify({
        empresaId: 51,
        dataInicial: '2025-09-01',
        dataFinal: '2025-09-15',
        dadosEmpresa: {
          cidade: 'São Paulo',
          categoria: 'SERVICOS_FINANCEIROS',
          vendedor: 123,
          diaFaturamento: 30
        }
      })
    };

    const criarResult = await handler(criarEvent, {});
    const criarData = JSON.parse(criarResult.body);
    
    console.log('Status:', criarResult.statusCode);
    console.log('Resultado:');
    console.log(JSON.stringify(criarData, null, 2));

  } catch (error) {
    console.error('Erro no teste:', error.message);
  }
}

async function demonstrarDiferenca() {
  console.log('=== COMPARAÇÃO: VOLUMETRIA vs RELATÓRIOS ===\n');

  try {
    // Método antigo - Volumetria (um contrato geral)
    console.log('1. MÉTODO ANTIGO - Volumetria (um contrato):');
    const volumetriaEvent = {
      httpMethod: 'GET',
      path: '/volumetria/51',
      queryStringParameters: {
        dataInicial: '2025-09-01',
        dataFinal: '2025-09-15'
      }
    };

    const volumetriaResult = await handler(volumetriaEvent, {});
    const volumetriaData = JSON.parse(volumetriaResult.body);
    
    if (volumetriaData.success && volumetriaData.contratoMapeado) {
      console.log(`  - UM contrato com valor: R$ ${volumetriaData.contratoMapeado.nValTotMes}`);
      console.log(`  - ${volumetriaData.contratoMapeado.itensContrato.length} itens no contrato`);
    }

    console.log('\n');

    // Método novo - Relatórios (contratos separados por produto)
    console.log('2. MÉTODO NOVO - Relatórios (contratos por produto):');
    const relatoriosEvent = {
      httpMethod: 'GET',
      path: '/relatorios/51',
      queryStringParameters: {
        dataInicial: '2025-09-01',
        dataFinal: '2025-09-15'
      }
    };

    const relatoriosResult = await handler(relatoriosEvent, {});
    const relatoriosData = JSON.parse(relatoriosResult.body);
    
    if (relatoriosData.success && relatoriosData.contratosMapeados) {
      const produtos = Object.keys(relatoriosData.contratosMapeados);
      console.log(`  - ${produtos.length} contratos separados por produto:`);
      
      produtos.forEach(produto => {
        const contrato = relatoriosData.contratosMapeados[produto];
        if (contrato) {
          console.log(`    * ${produto}: R$ ${contrato.nValTotMes}`);
        }
      });
    }

  } catch (error) {
    console.error('Erro na comparação:', error.message);
  }
}

// Exemplo de uso específico por produto
async function exemploUsoEspecifico() {
  console.log('=== EXEMPLO DE USO ESPECÍFICO ===\n');
  
  console.log('CENÁRIO: Empresa tem 3 produtos diferentes');
  console.log('- Cobrança bancária (BB e Bradesco)');
  console.log('- PixPay (Itaú e Sicoob)');
  console.log('- Outros serviços\n');
  
  console.log('RESULTADO ESPERADO:');
  console.log('✅ Contrato 1: COBRANCA_51_timestamp');
  console.log('✅ Contrato 2: PIXPAY_51_timestamp');
  console.log('✅ Contrato 3: OUTROS_51_timestamp\n');
  
  console.log('VANTAGENS:');
  console.log('- Contratos específicos por linha de negócio');
  console.log('- Faturamento separado por produto');
  console.log('- Melhor controle de margens');
  console.log('- Relatórios financeiros detalhados');
}

// Executar testes
if (require.main === module) {
  console.log('Escolha o teste a executar:');
  console.log('1. Testar contratos por relatórios');
  console.log('2. Demonstrar diferença volumetria vs relatórios');
  console.log('3. Exemplo de uso específico');
  
  const teste = process.argv[2] || '1';
  
  switch (teste) {
    case '1':
      testarContratosRelatorios();
      break;
    case '2':
      demonstrarDiferenca();
      break;
    case '3':
      exemploUsoEspecifico();
      break;
    default:
      testarContratosRelatorios();
  }
}

module.exports = {
  testarContratosRelatorios,
  demonstrarDiferenca,
  exemploUsoEspecifico
};