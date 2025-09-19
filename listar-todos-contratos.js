const axios = require('axios');

// Função para listar TODOS os contratos percorrendo todas as páginas
async function listarTodosContratos() {
  console.log('='.repeat(80));
  console.log('📋 LISTAGEM COMPLETA DE TODOS OS CONTRATOS');
  console.log('='.repeat(80));

  // Importar o handler do index.js
  const { handler } = require('./index.js');

  // Configurar variáveis de ambiente (usando as credenciais reais)
  process.env.OMIE_APP_KEY = '1634899698432';
  process.env.OMIE_APP_SECRET = '959a26dbf95a68a3c94abbabee37cf86';

  const todosContratos = [];
  let paginaAtual = 1;
  let totalPaginas = 1;
  let registrosPorPagina = 50; // Aumentando para 50 por página para ser mais eficiente
  
  console.log(`🚀 Iniciando coleta de contratos com ${registrosPorPagina} registros por página...\n`);

  try {
    do {
      console.log(`📄 Processando página ${paginaAtual}/${totalPaginas}...`);
      
      const evento = {
        httpMethod: 'GET',
        path: '/contratos',
        queryStringParameters: {
          pagina: paginaAtual.toString(),
          registros_por_pagina: registrosPorPagina.toString(),
          apenas_importado_api: 'N'
        }
      };

      const resultado = await handler(evento, {});
      
      if (resultado.statusCode !== 200) {
        console.error(`❌ Erro na página ${paginaAtual}:`, resultado.body);
        break;
      }

      const body = JSON.parse(resultado.body);
      
      if (!body.success) {
        console.error(`❌ Falha na página ${paginaAtual}:`, body.error);
        break;
      }

      // Atualizar informações de paginação
      totalPaginas = body.total_de_paginas;
      
      // Adicionar contratos da página atual
      if (body.contratos && body.contratos.length > 0) {
        todosContratos.push(...body.contratos);
        console.log(`   ✅ ${body.contratos.length} contratos coletados`);
      }

      // Pequena pausa para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 100));
      
      paginaAtual++;
      
    } while (paginaAtual <= totalPaginas);

    // Relatório final
    console.log('\n' + '='.repeat(80));
    console.log('📊 RELATÓRIO FINAL DA COLETA');
    console.log('='.repeat(80));
    console.log(`✅ Total de contratos coletados: ${todosContratos.length}`);
    console.log(`📄 Páginas processadas: ${paginaAtual - 1}/${totalPaginas}`);
    
    // Análise dos contratos
    console.log('\n📈 ANÁLISE DOS CONTRATOS:');
    console.log('-'.repeat(50));
    
    // Agrupar por status
    const contratosPorStatus = {};
    const contratosPorCliente = {};
    let valorTotalMensal = 0;
    
    todosContratos.forEach(contrato => {
      const cabecalho = contrato.cabecalho;
      
      // Status
      const status = cabecalho?.cCodSit || 'Indefinido';
      contratosPorStatus[status] = (contratosPorStatus[status] || 0) + 1;
      
      // Cliente
      const cliente = cabecalho?.nCodCli || 'Indefinido';
      contratosPorCliente[cliente] = (contratosPorCliente[cliente] || 0) + 1;
      
      // Valor total
      valorTotalMensal += parseFloat(cabecalho?.nValTotMes || 0);
    });

    // Mostrar estatísticas por status
    console.log('\n🏷️  CONTRATOS POR STATUS:');
    Object.entries(contratosPorStatus)
      .sort((a, b) => b[1] - a[1])
      .forEach(([status, quantidade]) => {
        const statusName = getStatusName(status);
        console.log(`   ${statusName}: ${quantidade} contratos`);
      });

    // Top 10 clientes com mais contratos
    console.log('\n👥 TOP 10 CLIENTES COM MAIS CONTRATOS:');
    Object.entries(contratosPorCliente)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([cliente, quantidade], index) => {
        console.log(`   ${index + 1}. Cliente ${cliente}: ${quantidade} contratos`);
      });

    console.log(`\n💰 VALOR TOTAL MENSAL: R$ ${valorTotalMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);

    // Salvar todos os contratos em um arquivo JSON para análise posterior
    const fs = require('fs');
    const nomeArquivo = `todos_contratos_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    
    const dadosExportacao = {
      timestamp: new Date().toISOString(),
      totalContratos: todosContratos.length,
      valorTotalMensal: valorTotalMensal,
      contratosPorStatus: contratosPorStatus,
      contratos: todosContratos
    };
    
    fs.writeFileSync(nomeArquivo, JSON.stringify(dadosExportacao, null, 2));
    console.log(`\n💾 Dados salvos em: ${nomeArquivo}`);

    console.log('\n' + '='.repeat(80));
    console.log('✅ COLETA CONCLUÍDA COM SUCESSO!');
    console.log('='.repeat(80));

    return todosContratos;

  } catch (error) {
    console.error('\n❌ ERRO DURANTE A COLETA:', error.message);
    console.log(`\n📊 Contratos coletados até o erro: ${todosContratos.length}`);
    return todosContratos;
  }
}

// Função auxiliar para traduzir códigos de status
function getStatusName(codigo) {
  const statusMap = {
    '10': '🟢 Ativo',
    '20': '🟡 Suspenso',
    '30': '🔴 Cancelado',
    '99': '🔵 Finalizado',
    'Indefinido': '⚪ Indefinido'
  };
  return statusMap[codigo] || `❓ Status ${codigo}`;
}

// Executar a função
if (require.main === module) {
  listarTodosContratos()
    .then(contratos => {
      console.log(`\n🎉 Processo finalizado! ${contratos.length} contratos processados.`);
    })
    .catch(console.error);
}

module.exports = { listarTodosContratos };