const axios = require('axios');

// Mapeador de dados da Volumetria Inanbetec para contratos Omie
class VolumetriaMapper {
  constructor(baseURL = 'https://edi-financeiro.inanbetec.com.br/v1/volumetria') {
    this.baseURL = baseURL;
  }

  // Consultar volumetria
  async consultarVolumetria(params) {
    try {
      const url = `${this.baseURL}/consultar`;
      const response = await axios.get(url, { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao consultar volumetria:', error.message);
      throw error;
    }
  }

  // Buscar serviços por empresa
  async buscarServicosPorEmpresa(empresaId) {
    try {
      const url = `${this.baseURL}/servicos/${empresaId}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar serviços:', error.message);
      throw error;
    }
  }

  // Buscar faixas por configuração
  async buscarFaixasPorConfig(config) {
    try {
      const url = `${this.baseURL}/subservicos/${config}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar faixas:', error.message);
      throw error;
    }
  }

  // Buscar relatórios
  async buscarRelatorios(params) {
    try {
      const url = `${this.baseURL}/relatorios`;
      const response = await axios.get(url, { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error.message);
      throw error;
    }
  }

  // Mapear dados da volumetria para contrato Omie
  mapearParaContratoOmie(dadosVolumetria, dadosEmpresa = {}) {
    const contrato = {
      // Cabeçalho do contrato
      cCodIntCtr: `VOL_${dadosVolumetria.idEmpresa}_${Date.now()}`,
      cNumCtr: '', // Será gerado pelo Omie
      nCodCli: dadosVolumetria.idEmpresa || 0,
      cCodSit: '10', // Situação ativa
      dVigInicial: this.formatarData(new Date()),
      dVigFinal: this.formatarData(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)), // 1 ano
      nDiaFat: 30, // Faturamento mensal
      nValTotMes: this.calcularValorTotalMensal(dadosVolumetria),
      cTipoFat: '01', // Fixo

      // Itens do contrato baseados na volumetria
      itensContrato: this.criarItensContrato(dadosVolumetria),

      // Informações adicionais
      infAdic: {
        cCidPrestServ: dadosEmpresa.cidade || '',
        cCodCateg: '',
        nCodCC: 0,
        nCodProj: 0,
        nCodVend: dadosEmpresa.vendedor || 0
      },

      // Vencimentos
      vencTextos: {
        cTpVenc: '001',
        nDias: 30,
        cProxMes: 'N',
        cAdContrato: 'N'
      }
    };

    return contrato;
  }

  // Criar itens do contrato baseados na volumetria
  criarItensContrato(dadosVolumetria) {
    const itens = [];

    // Item para cobrança
    if (dadosVolumetria.cobranca && dadosVolumetria.cobranca.qtdeTitulos > 0) {
      itens.push({
        codIntItem: `COBRANCA_${dadosVolumetria.idEmpresa}`,
        codServico: 1001, // Código do serviço de cobrança
        natOperacao: '01',
        codServMunic: '1401', // Código municipal do serviço
        codLC116: '1401', // Código LC116 para cobrança
        quant: dadosVolumetria.cobranca.qtdeTitulos,
        valorUnit: this.calcularValorUnitario(dadosVolumetria.cobranca),
        valorTotal: dadosVolumetria.cobranca.valorTotal || 0,
        descrCompleta: `Serviço de cobrança - ${dadosVolumetria.cobranca.qtdeTitulos} títulos`,
        aliqISS: 5.0 // 5% de ISS
      });
    }

    // Item para PixPay
    if (dadosVolumetria.pixpay && dadosVolumetria.pixpay.qtdeMotoristas > 0) {
      itens.push({
        codIntItem: `PIXPAY_${dadosVolumetria.idEmpresa}`,
        codServico: 1002, // Código do serviço PixPay
        natOperacao: '01',
        codServMunic: '1402', // Código municipal do serviço
        codLC116: '1402', // Código LC116 para pagamentos
        quant: dadosVolumetria.pixpay.qtdeMotoristas,
        valorUnit: this.calcularValorUnitarioPixPay(dadosVolumetria.pixpay),
        valorTotal: dadosVolumetria.pixpay.valorTotal || 0,
        descrCompleta: `Serviço PixPay - ${dadosVolumetria.pixpay.qtdeMotoristas} motoristas`,
        aliqISS: 5.0 // 5% de ISS
      });
    }

    return itens;
  }

  // Calcular valor total mensal
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

  // Calcular valor unitário para cobrança
  calcularValorUnitario(cobranca) {
    if (!cobranca.qtdeTitulos || cobranca.qtdeTitulos === 0) {
      return 0;
    }
    return (cobranca.valorTotal || 0) / cobranca.qtdeTitulos;
  }

  // Calcular valor unitário para PixPay
  calcularValorUnitarioPixPay(pixpay) {
    if (!pixpay.qtdeMotoristas || pixpay.qtdeMotoristas === 0) {
      return 0;
    }
    return (pixpay.valorTotal || 0) / pixpay.qtdeMotoristas;
  }

  // Formatar data para padrão Omie (DD/MM/AAAA)
  formatarData(data) {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  // Analisar estrutura completa dos dados
  async analisarEstruturaDados(empresaId, dataInicial, dataFinal) {
    console.log('=== ANÁLISE COMPLETA DOS DADOS DA VOLUMETRIA ===\n');

    try {
      // 1. Consultar volumetria
      console.log('1. DADOS DA VOLUMETRIA:');
      const volumetria = await this.consultarVolumetria({
        dataInicial,
        dataFinal,
        empresas: empresaId
      });
      console.log(JSON.stringify(volumetria, null, 2));
      console.log('\n');

      // 2. Buscar serviços
      console.log('2. SERVIÇOS DA EMPRESA:');
      try {
        const servicos = await this.buscarServicosPorEmpresa(empresaId);
        console.log(JSON.stringify(servicos, null, 2));
      } catch (error) {
        console.log('Erro ao buscar serviços:', error.message);
      }
      console.log('\n');

      // 3. Buscar relatórios
      console.log('3. RELATÓRIOS DISPONÍVEIS:');
      try {
        const relatorios = await this.buscarRelatorios({
          dataInicial,
          dataFinal,
          empresas: empresaId
        });
        console.log(JSON.stringify(relatorios, null, 2));
      } catch (error) {
        console.log('Erro ao buscar relatórios:', error.message);
      }
      console.log('\n');

      // 4. Mapear para contrato Omie
      if (volumetria && volumetria.length > 0) {
        console.log('4. CONTRATO MAPEADO PARA OMIE:');
        const contratoOmie = this.mapearParaContratoOmie(volumetria[0]);
        console.log(JSON.stringify(contratoOmie, null, 2));
      }

      return {
        volumetria,
        contratoMapeado: volumetria && volumetria.length > 0 ? this.mapearParaContratoOmie(volumetria[0]) : null
      };

    } catch (error) {
      console.error('Erro na análise:', error.message);
      throw error;
    }
  }
}

module.exports = VolumetriaMapper;

// Exemplo de uso para análise
if (require.main === module) {
  const mapper = new VolumetriaMapper();
  
  // Analisar dados da empresa 51
  mapper.analisarEstruturaDados(51, '2025-08-28', '2025-08-30')
    .then(resultado => {
      console.log('\n=== ANÁLISE CONCLUÍDA ===');
    })
    .catch(error => {
      console.error('Erro:', error.message);
    });
}
