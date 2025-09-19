const axios = require('axios');

// Mapeador de dados da Volumetria Inanbetec
class VolumetriaMapper {
  constructor(baseURL = 'https://edi-financeiro.inanbetec.com.br/v1/volumetria') {
    this.baseURL = baseURL;
  }
1
  async consultarVolumetria(params) {
      try {
        console.log(`[LOG] [VolumetriaMapper] Iniciando consulta de volumetria com params:`, params);
        const url = `${this.baseURL}/consultar`;
        const response = await axios.get(url, { params });
        console.log(`[LOG] [VolumetriaMapper] Resposta da volumetria recebida:`, JSON.stringify(response.data));
        return response.data;
      } catch (error) {
        console.error('[LOG] [VolumetriaMapper] Erro ao consultar volumetria:', error.message);
        throw error;
      }
  }

  async buscarServicosPorEmpresa(empresaId) {
      try {
        console.log(`[LOG] [VolumetriaMapper] Buscando serviços para empresa: ${empresaId}`);
        const url = `${this.baseURL}/servicos/${empresaId}`;
        const response = await axios.get(url);
        console.log(`[LOG] [VolumetriaMapper] Serviços recebidos:`, JSON.stringify(response.data));
        return response.data;
      } catch (error) {
        console.error('[LOG] [VolumetriaMapper] Erro ao buscar serviços:', error.message);
        return [];
      }
  }

  async buscarRelatorios(params) {
    try {
      console.log(`[LOG] [VolumetriaMapper] Buscando relatórios com params:`, params);
      const url = `${this.baseURL}/relatorios`;
      const response = await axios.get(url, { params });
      console.log(`[LOG] [VolumetriaMapper] Relatórios recebidos:`, JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error('[LOG] [VolumetriaMapper] Erro ao buscar relatórios:', error.message);
      return [];
    }
  }

  agruparRelatoriosPorProduto(relatorios) {
    console.log(`[LOG] [VolumetriaMapper] Agrupando relatórios por produto`);
    const grupos = {
      cobranca: [],
      pixpay: [],
      outros: []
    };

    relatorios.forEach(relatorio => {
      // Lógica para identificar o tipo de produto baseado nos dados do relatório
      if (relatorio.clearance_type === 'API' || relatorio.clearance_type === 'CNAB') {
        if (relatorio.bank_number === '1' || relatorio.bank_number === '237') {
          grupos.cobranca.push(relatorio);
        } else if (relatorio.bank_number === '341' || relatorio.bank_number === '756') {
          grupos.pixpay.push(relatorio);
        } else {
          grupos.outros.push(relatorio);
        }
      }
    });

    console.log(`[LOG] [VolumetriaMapper] Grupos criados:`, JSON.stringify(grupos));
    return grupos;
  }

  mapearParaContratoOmie(dadosVolumetria, dadosEmpresa = {}) {
    console.log(`[LOG] [VolumetriaMapper] Mapeando dados da volumetria para contrato Omie.`);
    console.log(`[LOG] [VolumetriaMapper] Dados volumetria:`, JSON.stringify(dadosVolumetria));
    console.log(`[LOG] [VolumetriaMapper] Dados empresa:`, JSON.stringify(dadosEmpresa));
    const contrato = {
      cCodIntCtr: `VOL_${dadosVolumetria.idEmpresa}_${Date.now()}`,
      cNumCtr: '',
      nCodCli: dadosVolumetria.idEmpresa || 0,
      cCodSit: '10',
      dVigInicial: this.formatarData(new Date()),
      dVigFinal: this.formatarData(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
      nDiaFat: dadosEmpresa.diaFaturamento || 30,
      nValTotMes: this.calcularValorTotalMensal(dadosVolumetria),
      cTipoFat: '01',
      itensContrato: this.criarItensContrato(dadosVolumetria),
      infAdic: {
        cCidPrestServ: dadosEmpresa.cidade || '',
        cCodCateg: dadosEmpresa.categoria || '',
        nCodCC: dadosEmpresa.centroCusto || 0,
        nCodProj: dadosEmpresa.projeto || 0,
        nCodVend: dadosEmpresa.vendedor || 0
      },
      vencTextos: {
        cTpVenc: '001',
        nDias: dadosEmpresa.diasVencimento || 30,
        cProxMes: 'N',
        cAdContrato: 'N'
      }
    };

    return contrato;
  }

  criarItensContrato(dadosVolumetria) {
      const itens = [];
      console.log(`[LOG] [VolumetriaMapper] Criando itens do contrato a partir da volumetria.`);
      if (dadosVolumetria.cobranca && dadosVolumetria.cobranca.qtdeTitulos > 0) {
        const itemCobranca = {
          codIntItem: `COBRANCA_${dadosVolumetria.idEmpresa}`,
          codServico: 1001,
          natOperacao: '01',
          codServMunic: '1401',
          codLC116: '1401',
          quant: dadosVolumetria.cobranca.qtdeTitulos,
          valorUnit: this.calcularValorUnitario(dadosVolumetria.cobranca),
          valorTotal: dadosVolumetria.cobranca.valorTotal || 0,
          descrCompleta: `Serviço de cobrança - ${dadosVolumetria.cobranca.qtdeTitulos} títulos`,
          aliqISS: 5.0
        };
        console.log(`[LOG] [VolumetriaMapper] Item de cobrança criado:`, JSON.stringify(itemCobranca));
        itens.push(itemCobranca);
      }
      if (dadosVolumetria.pixpay && dadosVolumetria.pixpay.qtdeMotoristas > 0) {
        const itemPixPay = {
          codIntItem: `PIXPAY_${dadosVolumetria.idEmpresa}`,
          codServico: 1002,
          natOperacao: '01',
          codServMunic: '1402',
          codLC116: '1402',
          quant: dadosVolumetria.pixpay.qtdeMotoristas,
          valorUnit: this.calcularValorUnitarioPixPay(dadosVolumetria.pixpay),
          valorTotal: dadosVolumetria.pixpay.valorTotal || 0,
          descrCompleta: `Serviço PixPay - ${dadosVolumetria.pixpay.qtdeMotoristas} motoristas`,
          aliqISS: 5.0
        };
        console.log(`[LOG] [VolumetriaMapper] Item PixPay criado:`, JSON.stringify(itemPixPay));
        itens.push(itemPixPay);
      }
      return itens;
  }

  calcularValorTotalMensal(dadosVolumetria) {
    let valorTotal = 0;
    if (dadosVolumetria.cobranca && dadosVolumetria.cobranca.valorTotal) {
      valorTotal += dadosVolumetria.cobranca.valorTotal;
    }
    if (dadosVolumetria.pixpay && dadosVolumetria.pixpay.valorTotal) {
      valorTotal += dadosVolumetria.pixpay.valorTotal;
    }
    return valorTotal;
  }

  calcularValorUnitario(cobranca) {
    if (!cobranca.qtdeTitulos || cobranca.qtdeTitulos === 0) return 0;
    return (cobranca.valorTotal || 0) / cobranca.qtdeTitulos;
  }

  calcularValorUnitarioPixPay(pixpay) {
    if (!pixpay.qtdeMotoristas || pixpay.qtdeMotoristas === 0) return 0;
    return (pixpay.valorTotal || 0) / pixpay.qtdeMotoristas;
  }

  formatarData(data) {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  mapearRelatorioPorProduto(relatorios, tipoProduto, dadosEmpresa = {}) {
    console.log(`[LOG] [VolumetriaMapper] Mapeando relatórios do produto: ${tipoProduto}`);
    
    if (!relatorios || relatorios.length === 0) {
      return null;
    }

    const totalRecords = relatorios.reduce((sum, rel) => sum + (rel.record_count || 0), 0);
    const empresaId = relatorios[0].company_id;
    
    const contrato = {
      cCodIntCtr: `${tipoProduto.toUpperCase()}_${empresaId}_${Date.now()}`,
      cNumCtr: '',
      nCodCli: empresaId,
      cCodSit: '10',
      dVigInicial: this.formatarData(new Date()),
      dVigFinal: this.formatarData(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
      nDiaFat: dadosEmpresa.diaFaturamento || 30,
      nValTotMes: this.calcularValorPorProduto(relatorios, tipoProduto),
      cTipoFat: '01',
      itensContrato: this.criarItensRelatório(relatorios, tipoProduto, empresaId),
      infAdic: {
        cCidPrestServ: dadosEmpresa.cidade || '',
        cCodCateg: dadosEmpresa.categoria || tipoProduto.toUpperCase(),
        nCodCC: dadosEmpresa.centroCusto || 0,
        nCodProj: dadosEmpresa.projeto || 0,
        nCodVend: dadosEmpresa.vendedor || 0
      },
      vencTextos: {
        cTpVenc: '001',
        nDias: dadosEmpresa.diasVencimento || 30,
        cProxMes: 'N',
        cAdContrato: 'N'
      }
    };

    console.log(`[LOG] [VolumetriaMapper] Contrato ${tipoProduto} mapeado:`, JSON.stringify(contrato));
    return contrato;
  }

  criarItensRelatório(relatorios, tipoProduto, empresaId) {
    const itens = [];
    const totalRecords = relatorios.reduce((sum, rel) => sum + (rel.record_count || 0), 0);
    const valorTotal = this.calcularValorPorProduto(relatorios, tipoProduto);

    if (totalRecords > 0) {
      const codigoServico = this.obterCodigoServico(tipoProduto);
      const item = {
        codIntItem: `${tipoProduto.toUpperCase()}_${empresaId}`,
        codServico: codigoServico.codigo,
        natOperacao: '01',
        codServMunic: codigoServico.municipal,
        codLC116: codigoServico.lc116,
        quant: totalRecords,
        valorUnit: totalRecords > 0 ? valorTotal / totalRecords : 0,
        valorTotal: valorTotal,
        descrCompleta: `${codigoServico.descricao} - ${totalRecords} registros`,
        aliqISS: 5.0
      };
      
      console.log(`[LOG] [VolumetriaMapper] Item ${tipoProduto} criado:`, JSON.stringify(item));
      itens.push(item);
    }

    return itens;
  }

  calcularValorPorProduto(relatorios, tipoProduto) {
    // Lógica de cálculo baseada no tipo de produto e quantidade de registros
    const totalRecords = relatorios.reduce((sum, rel) => sum + (rel.record_count || 0), 0);
    
    const tabelaPrecos = {
      cobranca: 0.50,  // R$ 0,50 por título
      pixpay: 2.00,    // R$ 2,00 por transação
      outros: 1.00     // R$ 1,00 por registro
    };

    return totalRecords * (tabelaPrecos[tipoProduto] || 1.00);
  }

  obterCodigoServico(tipoProduto) {
    const codigos = {
      cobranca: {
        codigo: 1001,
        municipal: '1401',
        lc116: '1401',
        descricao: 'Serviço de cobrança bancária'
      },
      pixpay: {
        codigo: 1002,
        municipal: '1402',
        lc116: '1402',
        descricao: 'Serviço de pagamentos PIX'
      },
      outros: {
        codigo: 1003,
        municipal: '1403',
        lc116: '1403',
        descricao: 'Outros serviços financeiros'
      }
    };

    return codigos[tipoProduto] || codigos.outros;
  }
}

// Cliente Omie
class OmieClient {
  constructor(appKey, appSecret) {
    this.appKey = appKey;
    this.appSecret = appSecret;
    this.baseURL = 'https://app.omie.com.br/api/v1/servicos/contrato/';
  }

  async callAPI(method, params) {
    try {
      const payload = {
        call: method,
        app_key: this.appKey,
        app_secret: this.appSecret,
        param: [params]
      };

      const response = await axios.post(this.baseURL, payload);
      return response.data;
    } catch (error) {
      console.error('Erro na chamada da API Omie:', error.message);
      throw error;
    }
  }

  async incluirContrato(contratoCadastro) {
    return this.callAPI('IncluirContrato', contratoCadastro);
  }

  async alterarContrato(contratoCadastro) {
    return this.callAPI('AlterarContrato', contratoCadastro);
  }

  async consultarContrato(contratoChave) {
    return this.callAPI('ConsultarContrato', { contratoChave });
  }

  async listarContratos(csListarRequest) {
    return this.callAPI('ListarContratos', csListarRequest);
  }

  async upsertContrato(contratoCadastro) {
    return this.callAPI('UpsertContrato', contratoCadastro);
  }

  async excluirItem(contratoChave, itensExclusao) {
    const params = {
      contratoChave,
      ItensExclusao: itensExclusao
    };
    return this.callAPI('ExcluirItem', params);
  }
}

// Modelos de dados
class ContractModels {
  static createContractModel({
    cCodIntCtr, cNumCtr, nCodCli, cCodSit, dVigInicial, dVigFinal,
    nDiaFat, nValTotMes, cTipoFat, itensContrato, infAdic, vencTextos
  }) {
    return {
      cabecalho: {
        cCodIntCtr: cCodIntCtr || '',
        cNumCtr: cNumCtr || '',
        nCodCli: nCodCli || 0,
        cCodSit: cCodSit || '10',
        dVigInicial: dVigInicial || '',
        dVigFinal: dVigFinal || '',
        nDiaFat: nDiaFat || 0,
        nValTotMes: nValTotMes || 0,
        cTipoFat: cTipoFat || '01'
      },
      departamentos: [],
      infAdic: infAdic || {
        cCidPrestServ: '',
        cCodCateg: '',
        nCodCC: 0,
        nCodProj: 0,
        nCodVend: 0
      },
      vencTextos: vencTextos || {
        cTpVenc: '001',
        nDias: 5,
        cProxMes: 'N',
        cAdContrato: 'N'
      },
      itensContrato: itensContrato || [],
      emailCliente: {
        cEnviarBoleto: 'N',
        cEnviarLinkNfse: 'N',
        cEnviarRecibo: 'N',
        cUtilizarEmails: ''
      },
      observacoes: {
        cObsContrato: ''
      }
    };
  }

  static createContractItem({
    codIntItem, codServico, natOperacao, codServMunic, codLC116,
    quant, valorUnit, valorTotal, descrCompleta, aliqISS
  }) {
    return {
      itemCabecalho: {
        codIntItem: codIntItem || '',
        codServico: codServico || 0,
        natOperacao: natOperacao || '01',
        codServMunic: codServMunic || '',
        codLC116: codLC116 || '',
        quant: quant || 1,
        valorUnit: valorUnit || 0,
        valorTotal: valorTotal || 0,
        cNaoGerarFinanceiro: 'N',
        valorDed: 0
      },
      itemDescrServ: {
        descrCompleta: descrCompleta || ''
      },
      itemImpostos: {
        aliqISS: aliqISS || 0,
        valorISS: 0,
        retISS: 'N',
        aliqIR: 0,
        valorIR: 0,
        retIR: 'N',
        aliqPIS: 0,
        valorPIS: 0,
        retPIS: 'N',
        aliqCOFINS: 0,
        valorCOFINS: 0,
        retCOFINS: 'N',
        aliqCSLL: 0,
        valorCSLL: 0,
        retCSLL: 'N',
        aliqINSS: 0,
        valorINSS: 0,
        retINSS: 'N',
        redBaseINSS: 0
      }
    };
  }

  static createListRequest({
    pagina = 1,
    registros_por_pagina = 50,
    apenas_importado_api = 'N'
  }) {
    return {
      pagina,
      registros_por_pagina,
      apenas_importado_api
    };
  }
}

// Controlador principal
class ContractController {
  constructor() {
    const appKey = process.env.OMIE_APP_KEY;
    const appSecret = process.env.OMIE_APP_SECRET;
    
    if (!appKey || !appSecret) {
      throw new Error('Variáveis de ambiente OMIE_APP_KEY e OMIE_APP_SECRET são obrigatórias');
    }
    
    this.omieClient = new OmieClient(appKey, appSecret);
    this.volumetriaMapper = new VolumetriaMapper();
  }

  async createContractFromVolumetria(empresaId, dataInicial, dataFinal, dadosEmpresa = {}) {
      try {
        console.log(`[LOG] [ContractController] Iniciando criação de contrato a partir da volumetria.`);
        // 1. Buscar dados da volumetria
        const volumetriaData = await this.volumetriaMapper.consultarVolumetria({
          dataInicial,
          dataFinal,
          empresas: empresaId
        });
        console.log(`[LOG] [ContractController] Dados de volumetria recebidos:`, JSON.stringify(volumetriaData));
        if (!volumetriaData || volumetriaData.length === 0) {
          console.warn(`[LOG] [ContractController] Nenhum dado de volumetria encontrado para o período informado.`);
          return {
            success: false,
            error: 'Nenhum dado de volumetria encontrado para o período informado'
          };
        }
        // 2. Buscar serviços da empresa (opcional)
        const servicosEmpresa = await this.volumetriaMapper.buscarServicosPorEmpresa(empresaId);
        // 3. Mapear dados para contrato Omie
        const dadosContrato = this.volumetriaMapper.mapearParaContratoOmie(
          volumetriaData[0], 
          dadosEmpresa
        );
        console.log(`[LOG] [ContractController] Dados do contrato mapeado:`, JSON.stringify(dadosContrato));
        // 4. Criar contrato no Omie
        const contractModel = ContractModels.createContractModel(dadosContrato);
        console.log(`[LOG] [ContractController] Modelo do contrato Omie:`, JSON.stringify(contractModel));
        const response = await this.omieClient.incluirContrato(contractModel);
        console.log(`[LOG] [ContractController] Resposta da criação do contrato Omie:`, JSON.stringify(response));
        return {
          success: response.cCodStatus === '0',
          contractId: response.nCodCtr,
          integrationCode: response.cCodIntCtr,
          message: response.cDescStatus,
          volumetriaData: volumetriaData[0],
          servicosEmpresa: servicosEmpresa,
          contractData: dadosContrato
        };
      } catch (error) {
        console.error(`[LOG] [ContractController] Erro na criação do contrato a partir da volumetria:`, error.message);
        return {
          success: false,
          error: error.message
        };
      }
  }

  async createContractsFromReports(empresaId, dataInicial, dataFinal, dadosEmpresa = {}) {
    try {
      console.log(`[LOG] [ContractController] Iniciando criação de contratos baseados em relatórios.`);
      
      // 1. Buscar relatórios
      const relatorios = await this.volumetriaMapper.buscarRelatorios({
        dataInicial,
        dataFinal,
        empresas: empresaId
      });

      if (!relatorios || relatorios.length === 0) {
        return {
          success: false,
          error: 'Nenhum relatório encontrado para o período informado'
        };
      }

      // 2. Agrupar relatórios por produto
      const gruposProdutos = this.volumetriaMapper.agruparRelatoriosPorProduto(relatorios);
      
      // 3. Criar contratos para cada produto
      const contratosCreated = [];
      const erros = [];

      for (const [tipoProduto, relatoriosProduto] of Object.entries(gruposProdutos)) {
        if (relatoriosProduto.length > 0) {
          try {
            console.log(`[LOG] [ContractController] Criando contrato para produto: ${tipoProduto}`);
            
            // Mapear dados para contrato Omie
            const dadosContrato = this.volumetriaMapper.mapearRelatorioPorProduto(
              relatoriosProduto, 
              tipoProduto, 
              dadosEmpresa
            );

            if (dadosContrato) {
              // Criar contrato no Omie
              const contractModel = ContractModels.createContractModel(dadosContrato);
              const response = await this.omieClient.incluirContrato(contractModel);
              
              contratosCreated.push({
                produto: tipoProduto,
                success: response.cCodStatus === '0',
                contractId: response.nCodCtr,
                integrationCode: response.cCodIntCtr,
                message: response.cDescStatus,
                relatorios: relatoriosProduto.length,
                totalRegistros: relatoriosProduto.reduce((sum, rel) => sum + (rel.record_count || 0), 0)
              });
            }
          } catch (error) {
            erros.push({
              produto: tipoProduto,
              error: error.message
            });
          }
        }
      }

      return {
        success: contratosCreated.length > 0,
        contratosCreated,
        erros,
        totalProdutos: Object.keys(gruposProdutos).filter(key => gruposProdutos[key].length > 0).length,
        relatoriosProcessados: relatorios.length
      };

    } catch (error) {
      console.error(`[LOG] [ContractController] Erro na criação de contratos baseados em relatórios:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getVolumetriaData(empresaId, dataInicial, dataFinal) {
    try {
      const volumetriaData = await this.volumetriaMapper.consultarVolumetria({
        dataInicial,
        dataFinal,
        empresas: empresaId
      });

      const servicosEmpresa = await this.volumetriaMapper.buscarServicosPorEmpresa(empresaId);

      return {
        success: true,
        volumetria: volumetriaData,
        servicos: servicosEmpresa,
        contratoMapeado: volumetriaData && volumetriaData.length > 0 ? 
          this.volumetriaMapper.mapearParaContratoOmie(volumetriaData[0]) : null
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getReportsData(empresaId, dataInicial, dataFinal) {
    try {
      console.log(`[LOG] [ContractController] Consultando relatórios para análise.`);
      
      const relatorios = await this.volumetriaMapper.buscarRelatorios({
        dataInicial,
        dataFinal,
        empresas: empresaId
      });

      const gruposProdutos = this.volumetriaMapper.agruparRelatoriosPorProduto(relatorios);
      
      // Mapear contratos para cada produto (sem criar)
      const contratosMapeados = {};
      for (const [tipoProduto, relatoriosProduto] of Object.entries(gruposProdutos)) {
        if (relatoriosProduto.length > 0) {
          contratosMapeados[tipoProduto] = this.volumetriaMapper.mapearRelatorioPorProduto(
            relatoriosProduto, 
            tipoProduto
          );
        }
      }

      return {
        success: true,
        relatorios,
        gruposProdutos,
        contratosMapeados,
        resumo: {
          totalRelatorios: relatorios.length,
          produtosEncontrados: Object.keys(gruposProdutos).filter(key => gruposProdutos[key].length > 0),
          totalRegistros: relatorios.reduce((sum, rel) => sum + (rel.record_count || 0), 0)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createContract(contractData) {
    try {
      const contractModel = ContractModels.createContractModel(contractData);
      const response = await this.omieClient.incluirContrato(contractModel);
      
      return {
        success: response.cCodStatus === '0',
        contractId: response.nCodCtr,
        integrationCode: response.cCodIntCtr,
        message: response.cDescStatus
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getContract(contractKey) {
    try {
      const response = await this.omieClient.consultarContrato(contractKey);
      
      return {
        success: !!response.contratoCadastro,
        contract: response.contratoCadastro || null
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async listContracts(listParams = {}) {
    try {
      const listRequest = ContractModels.createListRequest(listParams);
      const response = await this.omieClient.listarContratos(listRequest);
      
      return {
        success: true,
        pagina: response.pagina,
        total_de_paginas: response.total_de_paginas,
        registros: response.registros,
        total_de_registros: response.total_de_registros,
        contratos: response.contratoCadastro || []
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async updateContract(contractData) {
    try {
      const contractModel = ContractModels.createContractModel(contractData);
      const response = await this.omieClient.alterarContrato(contractModel);
      
      return {
        success: response.cCodStatus === '0',
        contractId: response.nCodCtr,
        integrationCode: response.cCodIntCtr,
        message: response.cDescStatus
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async upsertContract(contractData) {
    try {
      const contractModel = ContractModels.createContractModel(contractData);
      const response = await this.omieClient.upsertContrato(contractModel);
      
      return {
        success: response.cCodStatus === '0',
        contractId: response.nCodCtr,
        integrationCode: response.cCodIntCtr,
        message: response.cDescStatus
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async deleteContractItem(contractKey, itemsToDelete) {
    try {
      const response = await this.omieClient.excluirItem(contractKey, itemsToDelete);
      
      return {
        success: response.cCodStatus === '0',
        message: response.cDescStatus
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Handler principal da Lambda
exports.handler = async (event, context) => {
  console.log('Event received:', JSON.stringify(event, null, 2));
  
  try {
    const controller = new ContractController();
    let result;
    
    // Determinar a ação com base no path ou body
    const path = event.path || '';
    const httpMethod = event.httpMethod || '';
    const body = event.body ? JSON.parse(event.body) : {};
    
    // Roteamento das ações
    if (httpMethod === 'POST' && path.includes('/contratos/relatorios')) {
      // Novo endpoint para criar contratos baseados em relatórios
      const { empresaId, dataInicial, dataFinal, dadosEmpresa } = body;
      result = await controller.createContractsFromReports(empresaId, dataInicial, dataFinal, dadosEmpresa);
    }
    else if (httpMethod === 'GET' && path.includes('/relatorios/')) {
      // Endpoint para consultar dados de relatórios
      const parts = path.split('/');
      const empresaId = parts[parts.length - 1];
      const queryParams = event.queryStringParameters || {};
      result = await controller.getReportsData(empresaId, queryParams.dataInicial, queryParams.dataFinal);
    }
    else if (httpMethod === 'POST' && path.includes('/contratos/volumetria')) {
      // Endpoint para criar contrato baseado em volumetria (método original)
      const { empresaId, dataInicial, dataFinal, dadosEmpresa } = body;
      result = await controller.createContractFromVolumetria(empresaId, dataInicial, dataFinal, dadosEmpresa);
    }
    else if (httpMethod === 'GET' && path.includes('/volumetria/')) {
      // Endpoint para consultar dados de volumetria
      const parts = path.split('/');
      const empresaId = parts[parts.length - 1];
      const queryParams = event.queryStringParameters || {};
      result = await controller.getVolumetriaData(empresaId, queryParams.dataInicial, queryParams.dataFinal);
    }
    else if (httpMethod === 'POST' && path.includes('/contratos')) {
      result = await controller.createContract(body);
    } 
    else if (httpMethod === 'GET' && path.includes('/contratos/')) {
      const contractId = path.split('/').pop();
      result = await controller.getContract({ nCodCtr: parseInt(contractId) });
    }
    else if (httpMethod === 'GET' && path.includes('/contratos')) {
      const queryParams = event.queryStringParameters || {};
      result = await controller.listContracts(queryParams);
    }
    else if (httpMethod === 'PUT' && path.includes('/contratos/')) {
      const contractId = path.split('/').pop();
      result = await controller.updateContract({
        ...body,
        cabecalho: {
          ...body.cabecalho,
          nCodCtr: parseInt(contractId)
        }
      });
    }
    else if (httpMethod === 'DELETE' && path.includes('/contratos/') && path.includes('/itens/')) {
      const parts = path.split('/');
      const contractId = parts[parts.length - 3];
      const itemId = parts[parts.length - 1];
      
      result = await controller.deleteContractItem(
        { nCodCtr: parseInt(contractId) },
        [{ codItem: parseInt(itemId) }]
      );
    }
    else {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'Endpoint não encontrado',
          availableEndpoints: [
            'POST /contratos/relatorios - Criar contratos baseados em relatórios (por produto)',
            'GET /relatorios/{empresaId} - Consultar dados de relatórios agrupados',
            'POST /contratos/volumetria - Criar contrato baseado em volumetria',
            'GET /volumetria/{empresaId} - Consultar dados de volumetria',
            'POST /contratos - Criar contrato',
            'GET /contratos - Listar contratos',
            'GET /contratos/{id} - Buscar contrato',
            'PUT /contratos/{id} - Atualizar contrato',
            'DELETE /contratos/{id}/itens/{itemId} - Excluir item'
          ]
        })
      };
    }
    
    // Retornar resposta
    return {
      statusCode: result.success ? 200 : 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result)
    };
    
  } catch (error) {
    console.error('Error in Lambda handler:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: 'Erro interno do servidor',
        message: error.message
      })
    };
  }
};

// Função de teste para uso local
if (process.env.NODE_ENV === 'development') {
  // Exemplo de uso local
  const testHandler = async () => {
    process.env.OMIE_APP_KEY = 'sua_app_key_aqui';
    process.env.OMIE_APP_SECRET = 'seu_app_secret_aqui';
    
    const event = {
      httpMethod: 'GET',
      path: '/contratos',
      queryStringParameters: {
        pagina: '1',
        registros_por_pagina: '10'
      }
    };
    
    const result = await exports.handler(event, {});
    console.log('Test result:', result);
  };
  
  // testHandler(); // Descomente para testar localmente
}