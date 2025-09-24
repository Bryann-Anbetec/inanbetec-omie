const axios = require('axios');
const fs = require('fs');

// Função para listar TODOS os contratos com TODOS os campos detalhados
async function listarTodosContratosCompletos() {
  console.log('='.repeat(80));
  console.log('📋 LISTAGEM COMPLETA - TODOS OS CAMPOS DE TODOS OS CONTRATOS');
  console.log('='.repeat(80));

  // Importar o handler do index.js
  const { handler } = require('./index.js');

  // Configurar variáveis de ambiente
  process.env.OMIE_APP_KEY = '1634899698432';
  process.env.OMIE_APP_SECRET = '959a26dbf95a68a3c94abbabee37cf86';

  const todosContratos = [];
  let paginaAtual = 1;
  let totalPaginas = 1;
  let registrosPorPagina = 50;
  
  console.log(`🚀 Iniciando coleta COMPLETA de contratos...\n`);

  try {
    // Primeira fase: Coletar todos os contratos
    do {
      console.log(`📄 Coletando página ${paginaAtual}/${totalPaginas}...`);
      
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

      totalPaginas = body.total_de_paginas;
      
      if (body.contratos && body.contratos.length > 0) {
        todosContratos.push(...body.contratos);
        console.log(`   ✅ ${body.contratos.length} contratos coletados`);
      }

      await new Promise(resolve => setTimeout(resolve, 100));
      paginaAtual++;
      
    } while (paginaAtual <= totalPaginas);

    console.log('\n' + '='.repeat(80));
    console.log('📊 EXIBINDO TODOS OS CONTRATOS COM TODOS OS CAMPOS');
    console.log('='.repeat(80));
    console.log(`✅ Total de contratos coletados: ${todosContratos.length}\n`);

    // Segunda fase: Exibir todos os contratos com todos os campos
    todosContratos.forEach((contrato, index) => {
      console.log('🔸'.repeat(60));
      console.log(`📋 CONTRATO ${index + 1}/${todosContratos.length}`);
      console.log('🔸'.repeat(60));
      
      // Exibir TODOS os campos do contrato
      console.log('📄 ESTRUTURA COMPLETA DO CONTRATO:');
      console.log(JSON.stringify(contrato, null, 2));
      
      console.log('\n📊 RESUMO ORGANIZADO:');
      
      // Cabeçalho
      if (contrato.cabecalho) {
        console.log('\n🏷️  CABEÇALHO:');
        Object.entries(contrato.cabecalho).forEach(([campo, valor]) => {
          console.log(`   ${campo}: ${valor}`);
        });
      }
      
      // Departamentos
      if (contrato.departamentos && contrato.departamentos.length > 0) {
        console.log('\n🏢 DEPARTAMENTOS:');
        contrato.departamentos.forEach((dept, i) => {
          console.log(`   Departamento ${i + 1}:`, JSON.stringify(dept, null, 4));
        });
      }
      
      // Informações Adicionais
      if (contrato.infAdic) {
        console.log('\n📋 INFORMAÇÕES ADICIONAIS:');
        Object.entries(contrato.infAdic).forEach(([campo, valor]) => {
          console.log(`   ${campo}: ${valor}`);
        });
      }
      
      // Textos de Vencimento
      if (contrato.vencTextos) {
        console.log('\n📅 TEXTOS DE VENCIMENTO:');
        Object.entries(contrato.vencTextos).forEach(([campo, valor]) => {
          console.log(`   ${campo}: ${valor}`);
        });
      }
      
      // Itens do Contrato
      if (contrato.itensContrato && contrato.itensContrato.length > 0) {
        console.log('\n📦 ITENS DO CONTRATO:');
        contrato.itensContrato.forEach((item, i) => {
          console.log(`   📦 Item ${i + 1}:`);
          
          if (item.itemCabecalho) {
            console.log('      🏷️  Cabeçalho do Item:');
            Object.entries(item.itemCabecalho).forEach(([campo, valor]) => {
              console.log(`         ${campo}: ${valor}`);
            });
          }
          
          if (item.itemDescrServ) {
            console.log('      📝 Descrição do Serviço:');
            Object.entries(item.itemDescrServ).forEach(([campo, valor]) => {
              console.log(`         ${campo}: ${valor}`);
            });
          }
          
          if (item.itemImpostos) {
            console.log('      💰 Impostos:');
            Object.entries(item.itemImpostos).forEach(([campo, valor]) => {
              console.log(`         ${campo}: ${valor}`);
            });
          }
          
          // Outros campos do item
          Object.entries(item).forEach(([campo, valor]) => {
            if (!['itemCabecalho', 'itemDescrServ', 'itemImpostos'].includes(campo)) {
              console.log(`      ${campo}: ${JSON.stringify(valor, null, 2)}`);
            }
          });
        });
      }
      
      // Email Cliente
      if (contrato.emailCliente) {
        console.log('\n📧 EMAIL CLIENTE:');
        Object.entries(contrato.emailCliente).forEach(([campo, valor]) => {
          console.log(`   ${campo}: ${valor}`);
        });
      }
      
      // Observações
      if (contrato.observacoes) {
        console.log('\n📝 OBSERVAÇÕES:');
        Object.entries(contrato.observacoes).forEach(([campo, valor]) => {
          console.log(`   ${campo}: ${valor}`);
        });
      }
      
      // Outros campos não categorizados
      console.log('\n🔧 OUTROS CAMPOS:');
      Object.entries(contrato).forEach(([campo, valor]) => {
        if (!['cabecalho', 'departamentos', 'infAdic', 'vencTextos', 'itensContrato', 'emailCliente', 'observacoes'].includes(campo)) {
          console.log(`   ${campo}: ${JSON.stringify(valor, null, 2)}`);
        }
      });
      
      console.log('\n');
    });

    // Salvar dados completos em arquivo JSON
    const nomeArquivo = `contratos_completos_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    
    const dadosCompletos = {
      timestamp: new Date().toISOString(),
      totalContratos: todosContratos.length,
      metadata: {
        paginasProcessadas: totalPaginas,
        registrosPorPagina: registrosPorPagina
      },
      contratos: todosContratos
    };
    
    fs.writeFileSync(nomeArquivo, JSON.stringify(dadosCompletos, null, 2));
    
    console.log('='.repeat(80));
    console.log('✅ LISTAGEM COMPLETA FINALIZADA!');
    console.log('='.repeat(80));
    console.log(`📊 Total de contratos processados: ${todosContratos.length}`);
    console.log(`💾 Dados completos salvos em: ${nomeArquivo}`);
    console.log(`📄 Tamanho do arquivo: ${(fs.statSync(nomeArquivo).size / 1024 / 1024).toFixed(2)} MB`);
    console.log('='.repeat(80));

    return todosContratos;

  } catch (error) {
    console.error('\n❌ ERRO DURANTE A COLETA:', error.message);
    console.log(`\n📊 Contratos coletados até o erro: ${todosContratos.length}`);
    return todosContratos;
  }
}

// Função auxiliar para exibir um contrato específico
async function exibirContratoEspecifico(indice) {
  console.log(`🔍 Exibindo apenas o contrato ${indice}...\n`);
  
  const contratos = await listarTodosContratosCompletos();
  
  if (indice > 0 && indice <= contratos.length) {
    const contrato = contratos[indice - 1];
    console.log(`\n📋 CONTRATO ${indice} - DETALHES COMPLETOS:`);
    console.log('='.repeat(60));
    console.log(JSON.stringify(contrato, null, 2));
  } else {
    console.log(`❌ Índice inválido. Use um número entre 1 e ${contratos.length}`);
  }
}

// Executar a função
if (require.main === module) {
  // Verificar se foi passado um índice específico como argumento
  const indiceEspecifico = process.argv[2];
  
  if (indiceEspecifico) {
    exibirContratoEspecifico(parseInt(indiceEspecifico))
      .catch(console.error);
  } else {
    listarTodosContratosCompletos()
      .then(contratos => {
        console.log(`\n🎉 Processo finalizado! ${contratos.length} contratos processados com TODOS os campos!`);
        console.log('\n💡 DICA: Para ver apenas um contrato específico, use:');
        console.log('   node listar-contratos-completos.js [número_do_contrato]');
        console.log('   Exemplo: node listar-contratos-completos.js 1');
      })
      .catch(console.error);
  }
}

module.exports = { listarTodosContratosCompletos, exibirContratoEspecifico };