import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class VolumetriaService {
  private readonly logger = new Logger(VolumetriaService.name);
  private readonly baseURL: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseURL = this.configService.get<string>(
      'INANBETEC_VOLUMETRIA_URL',
      'https://edi-financeiro.inanbetec.com.br/v1/volumetria',
    );
  }

  async consultarVolumetria(params: any) {
    try {
      this.logger.log(`Iniciando consulta de volumetria com params: ${JSON.stringify(params)}`);
      const url = `${this.baseURL}/consultar`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, { params })
      );
      
      this.logger.log(`Resposta da volumetria recebida: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Erro ao consultar volumetria: ${error.message}`);
      throw error;
    }
  }

  async buscarServicosPorEmpresa(empresaId: string) {
    try {
      this.logger.log(`Buscando serviços para empresa: ${empresaId}`);
      const url = `${this.baseURL}/servicos/${empresaId}`;
      
      const response = await firstValueFrom(
        this.httpService.get(url)
      );
      
      this.logger.log(`Serviços recebidos: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Erro ao buscar serviços: ${error.message}`);
      return [];
    }
  }

  async buscarRelatorios(params: any) {
    try {
      this.logger.log(`Buscando relatórios com params: ${JSON.stringify(params)}`);
      const url = `${this.baseURL}/relatorios`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, { params })
      );
      
      this.logger.log(`Relatórios recebidos: ${JSON.stringify(response.data)}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Erro ao buscar relatórios: ${error.message}`);
      return [];
    }
  }

  agruparRelatoriosPorProduto(relatorios: any[]) {
    this.logger.log('Agrupando relatórios por produto');
    const grupos = {
      cobranca: [],
      pixpay: [],
      outros: []
    };

    relatorios.forEach(relatorio => {
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

    this.logger.log(`Grupos criados: ${JSON.stringify(grupos)}`);
    return grupos;
  }

  mapearParaContratoOmie(dadosVolumetria: any, dadosEmpresa: any = {}) {
    this.logger.log('Mapeando dados da volumetria para contrato Omie');
    this.logger.log(`Dados volumetria: ${JSON.stringify(dadosVolumetria)}`);
    this.logger.log(`Dados empresa: ${JSON.stringify(dadosEmpresa)}`);

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

  mapearRelatorioPorProduto(relatorios: any[], tipoProduto: string, dadosEmpresa: any = {}) {
    this.logger.log(`Mapeando relatórios do produto: ${tipoProduto}`);
    
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
      itensContrato: this.criarItensRelatorio(relatorios, tipoProduto, empresaId),
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

    this.logger.log(`Contrato ${tipoProduto} mapeado: ${JSON.stringify(contrato)}`);
    return contrato;
  }

  private criarItensContrato(dadosVolumetria: any) {
    const itens = [];
    this.logger.log('Criando itens do contrato a partir da volumetria');

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
      this.logger.log(`Item de cobrança criado: ${JSON.stringify(itemCobranca)}`);
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
      this.logger.log(`Item PixPay criado: ${JSON.stringify(itemPixPay)}`);
      itens.push(itemPixPay);
    }

    return itens;
  }

  private criarItensRelatorio(relatorios: any[], tipoProduto: string, empresaId: string) {
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
      
      this.logger.log(`Item ${tipoProduto} criado: ${JSON.stringify(item)}`);
      itens.push(item);
    }

    return itens;
  }

  private calcularValorTotalMensal(dadosVolumetria: any) {
    let valorTotal = 0;
    if (dadosVolumetria.cobranca && dadosVolumetria.cobranca.valorTotal) {
      valorTotal += dadosVolumetria.cobranca.valorTotal;
    }
    if (dadosVolumetria.pixpay && dadosVolumetria.pixpay.valorTotal) {
      valorTotal += dadosVolumetria.pixpay.valorTotal;
    }
    return valorTotal;
  }

  private calcularValorUnitario(cobranca: any) {
    if (!cobranca.qtdeTitulos || cobranca.qtdeTitulos === 0) return 0;
    return (cobranca.valorTotal || 0) / cobranca.qtdeTitulos;
  }

  private calcularValorUnitarioPixPay(pixpay: any) {
    if (!pixpay.qtdeMotoristas || pixpay.qtdeMotoristas === 0) return 0;
    return (pixpay.valorTotal || 0) / pixpay.qtdeMotoristas;
  }

  private calcularValorPorProduto(relatorios: any[], tipoProduto: string) {
    const totalRecords = relatorios.reduce((sum, rel) => sum + (rel.record_count || 0), 0);
    
    const tabelaPrecos = {
      cobranca: 0.50,  // R$ 0,50 por título
      pixpay: 2.00,    // R$ 2,00 por transação
      outros: 1.00     // R$ 1,00 por registro
    };

    return totalRecords * (tabelaPrecos[tipoProduto] || 1.00);
  }

  private obterCodigoServico(tipoProduto: string) {
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

  private formatarData(data: Date) {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }
}