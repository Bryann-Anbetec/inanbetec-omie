import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ObjectId } from 'mongodb';
import axios from 'axios';

export interface EmpresaConfig {
  empresaId: number;
  nomeEmpresa: string;
  codigoClienteOmie: number;
  cnpj: string;
  ativo: boolean;
  configuracao: {
    tipoFaturamento: string; // cTipoFat
    diaFaturamento: number;  // nDiaFat
    vigenciaInicial: string;
    vigenciaFinal: string;
    codigosServico: {
      [produto: string]: {
        codServico: number;
        codLC116: string;
        natOperacao: string;
        aliqISS: number;
      };
    };
  };
}

@Injectable()
export class ConfiguracaoService {
  private readonly logger = new Logger(ConfiguracaoService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectConnection() private readonly mongoConnection: Connection,
  ) {}

  /**
   * EMPRESAS ATIVAS: Obter lista de empresas que devem ser processadas
   */
  async obterEmpresasAtivas(): Promise<number[]> {
    try {
      // TODO: Em produção, buscar do banco de dados
      // Por enquanto usando configuração baseada nos exemplos
      
      const empresasConfig = this.configService.get<string>('EMPRESAS_ATIVAS', '51,66');
      const empresas = empresasConfig.split(',').map(id => parseInt(id.trim()));
      
      this.logger.log(`Empresas ativas configuradas: ${empresas.join(', ')}`);
      return empresas;

    } catch (error) {
      this.logger.error(`Erro ao obter empresas ativas: ${error.message}`);
      return [51, 66]; // Fallback baseado nos exemplos
    }
  }

  /**
   * MAPEAMENTO EMPRESA → CLIENTE OMIE: Obter código do cliente no Omie
   */
  async obterCodigoClienteOmie(empresaId: number): Promise<number> {
    try {
      // Mapeamento baseado na especificação
      const mapeamento: { [key: number]: number } = {
        51: 2370765, // Conforme exemplo na especificação
        66: 1234567, // TODO: Obter valor real
        258: 1234568 // TODO: Obter valor real para empresa 258
      };

      const codigoCliente = mapeamento[empresaId];
      if (!codigoCliente) {
        throw new Error(`Código cliente Omie não configurado para empresa ${empresaId}`);
      }

      return codigoCliente;

    } catch (error) {
      this.logger.error(`Erro ao obter código cliente Omie: ${error.message}`);
      throw error;
    }
  }

  /**
   * CONFIGURAÇÃO COMPLETA DA EMPRESA (DINÂMICO)
   */
  async obterConfiguracaoEmpresa(empresaId: number): Promise<EmpresaConfig> {
    try {
      this.logger.log(`🔍 Obtendo configuração dinâmica para empresa ${empresaId}`);

      // 1. Buscar empresa no MongoDB InAnbetec
      const empresaInAnbetec = await this.buscarEmpresaInAnbetec(empresaId);
      if (!empresaInAnbetec) {
        this.logger.warn(`⚠️ Empresa ${empresaId} não encontrada no banco InAnbetec, usando fallback`);
        return await this.obterConfiguracaoEmpresaFallback(empresaId);
      }

      this.logger.log(`✅ Empresa encontrada: ${empresaInAnbetec.nome} - CNPJ: ${empresaInAnbetec.cnpj}`);

      // 2. Buscar código do cliente no Omie usando o CNPJ
      const codigoClienteOmie = await this.buscarCodigoClienteOmie(empresaInAnbetec.cnpj);
      if (!codigoClienteOmie) {
        this.logger.warn(`⚠️ Cliente CNPJ ${empresaInAnbetec.cnpj} não encontrado no Omie, usando fallback`);
        return await this.obterConfiguracaoEmpresaFallback(empresaId);
      }

      this.logger.log(`✅ Cliente Omie encontrado: ${codigoClienteOmie}`);

      // 3. Retornar configuração dinâmica
      return {
        empresaId: empresaId,
        nomeEmpresa: empresaInAnbetec.nome,
        cnpj: empresaInAnbetec.cnpj,
        codigoClienteOmie: codigoClienteOmie,
        ativo: empresaInAnbetec.status || true,
        configuracao: {
          tipoFaturamento: '01',
          diaFaturamento: 30,
          vigenciaInicial: '01/01/2025',
          vigenciaFinal: '31/12/2025',
          codigosServico: {
            'cobranca': {
              codServico: 1001,
              codLC116: '3.05',
              natOperacao: '01',
              aliqISS: 5.0
            },
            'bolepix': {
              codServico: 1003,
              codLC116: '3.05',
              natOperacao: '01',
              aliqISS: 5.0
            },
            'pagamentos': {
              codServico: 1002,
              codLC116: '3.05',
              natOperacao: '01',
              aliqISS: 5.0
            },
            'pixpay': {
              codServico: 1004,
              codLC116: '3.05',
              natOperacao: '01',
              aliqISS: 5.0
            },
            'webcheckout': {
              codServico: 1005,
              codLC116: '3.05',
              natOperacao: '01',
              aliqISS: 5.0
            }
          }
        }
      };

    } catch (error) {
      this.logger.error(`❌ Erro ao obter configuração da empresa ${empresaId}: ${error.message}`);
      
      // Fallback para configuração estática temporária
      this.logger.warn(`⚠️ Usando configuração de fallback para empresa ${empresaId}`);
      return await this.obterConfiguracaoEmpresaFallback(empresaId);
    }
  }

  /**
   * Buscar empresa no banco InAnbetec
   */
  private async buscarEmpresaInAnbetec(empresaId: number): Promise<any> {
    try {
      const collection = this.mongoConnection.collection('empresas');
      const empresa = await collection.findOne({ 
        $or: [
          { id: empresaId },
          { empresaId: empresaId },
          { _id: new ObjectId(empresaId.toString().padStart(24, '0')) }
        ]
      });

      return empresa;
    } catch (error) {
      this.logger.error(`Erro ao buscar empresa ${empresaId} no MongoDB: ${error.message}`);
      return null;
    }
  }

  /**
   * Buscar código do cliente no Omie usando CNPJ
   */
  private async buscarCodigoClienteOmie(cnpj: string): Promise<number | null> {
    try {
      const omieAppKey = this.configService.get<string>('OMIE_APP_KEY');
      const omieAppSecret = this.configService.get<string>('OMIE_APP_SECRET');

      if (!omieAppKey || !omieAppSecret) {
        throw new Error('Credenciais do Omie não configuradas');
      }

      const payload = {
        call: 'ConsultarCliente',
        app_key: omieAppKey,
        app_secret: omieAppSecret,
        param: [{
          cnpj_cpf: cnpj.replace(/[^\d]/g, '') // Remove formatação
        }]
      };

      const response = await axios.post('https://app.omie.com.br/api/v1/geral/clientes/', payload);
      
      if (response.data && response.data.codigo_cliente_omie) {
        return response.data.codigo_cliente_omie;
      }

      return null;
    } catch (error) {
      this.logger.error(`Erro ao consultar cliente no Omie: ${error.message}`);
      return null;
    }
  }

  /**
   * CONFIGURAÇÃO ESTÁTICA COMO FALLBACK
   */
  private async obterConfiguracaoEmpresaFallback(empresaId: number): Promise<EmpresaConfig> {
    try {
      // TODO: Em produção, buscar do banco de dados
      // Por enquanto usando configuração estática baseada nos exemplos
      
      const configuracoesPadrao: { [key: number]: EmpresaConfig } = {
        51: {
          empresaId: 51,
          nomeEmpresa: 'Empresa 51 - InAnbetec',
          cnpj: '00.000.000/0001-51', // CNPJ de exemplo
          codigoClienteOmie: 2370765,
          ativo: true,
          configuracao: {
            tipoFaturamento: '01',
            diaFaturamento: 30,
            vigenciaInicial: '01/01/2025',
            vigenciaFinal: '31/12/2025',
            codigosServico: {
              'cobranca': {
                codServico: 1001,
                codLC116: '3.05', // Conforme especificação
                natOperacao: '01',
                aliqISS: 5.0
              },
              'pagamentos': {
                codServico: 1002,
                codLC116: '3.05',
                natOperacao: '01',
                aliqISS: 5.0
              },
              'bolepix': {
                codServico: 1003,
                codLC116: '3.05',
                natOperacao: '01',
                aliqISS: 5.0
              },
              'pixpay': {
                codServico: 1004,
                codLC116: '3.05',
                natOperacao: '01',
                aliqISS: 5.0
              }
            }
          }
        },

        66: {
          empresaId: 66,
          nomeEmpresa: 'Empresa 66 - InAnbetec',
          cnpj: '00.000.000/0001-66', // CNPJ de exemplo
          codigoClienteOmie: 1234567, // TODO: Definir valor real
          ativo: true,
          configuracao: {
            tipoFaturamento: '01',
            diaFaturamento: 30,
            vigenciaInicial: '01/01/2025',
            vigenciaFinal: '31/12/2025',
            codigosServico: {
              'cobranca': {
                codServico: 1001,
                codLC116: '3.05',
                natOperacao: '01',
                aliqISS: 5.0
              },
              'webcheckout': {
                codServico: 1005,
                codLC116: '3.05',
                natOperacao: '01',
                aliqISS: 0 // Conforme exemplo (sem valor total)
              }
            }
          }
        },

        258: {
          empresaId: 258,
          nomeEmpresa: 'Empresa 258 - InAnbetec',
          cnpj: '02.678.694/0002-27', // CNPJ real da empresa 258
          codigoClienteOmie: 6488507558, // Código real do cliente no Omie
          ativo: true,
          configuracao: {
            tipoFaturamento: '01',
            diaFaturamento: 30,
            vigenciaInicial: '01/01/2025',
            vigenciaFinal: '31/12/2025',
            codigosServico: {
              'cobranca': {
                codServico: 1001,
                codLC116: '3.05',
                natOperacao: '01',
                aliqISS: 5.0
              },
              'bolepix': {
                codServico: 1003,
                codLC116: '3.05',
                natOperacao: '01',
                aliqISS: 5.0
              },
              'pagamentos': {
                codServico: 1002,
                codLC116: '3.05',
                natOperacao: '01',
                aliqISS: 5.0
              },
              'pixpay': {
                codServico: 1004,
                codLC116: '3.05',
                natOperacao: '01',
                aliqISS: 5.0
              },
              'webcheckout': {
                codServico: 1005,
                codLC116: '3.05',
                natOperacao: '01',
                aliqISS: 5.0
              }
            }
          }
        }
      };

      const config = configuracoesPadrao[empresaId];
      if (!config) {
        throw new Error(`Configuração não encontrada para empresa ${empresaId}`);
      }

      return config;

    } catch (error) {
      this.logger.error(`Erro ao obter configuração da empresa ${empresaId}: ${error.message}`);
      throw error;
    }
  }

  /**
   * CÓDIGOS FISCAIS: Obter códigos específicos para um produto
   */
  async obterCodigosServico(empresaId: number, nomeProduto: string) {
    try {
      const config = await this.obterConfiguracaoEmpresa(empresaId);
      const codigoProduto = config.configuracao.codigosServico[nomeProduto.toLowerCase()];
      
      if (!codigoProduto) {
        // Usar configuração padrão se produto específico não encontrado
        return {
          codServico: 1000,
          codLC116: '3.05',
          natOperacao: '01',
          aliqISS: 5.0
        };
      }

      return codigoProduto;

    } catch (error) {
      this.logger.error(`Erro ao obter códigos de serviço: ${error.message}`);
      throw error;
    }
  }

  /**
   * VALIDAÇÃO: Verificar se empresa está ativa e configurada
   */
  async validarEmpresa(empresaId: number): Promise<boolean> {
    try {
      const empresasAtivas = await this.obterEmpresasAtivas();
      if (!empresasAtivas.includes(empresaId)) {
        return false;
      }

      const config = await this.obterConfiguracaoEmpresa(empresaId);
      return config.ativo;

    } catch (error) {
      this.logger.warn(`Empresa ${empresaId} não está válida: ${error.message}`);
      return false;
    }
  }

  /**
   * DIAS ÚTEIS: Verificar se hoje é primeiro dia útil do mês
   */
  isPrimeiroDiaUtil(): boolean {
    const hoje = new Date();
    const diaSemana = hoje.getDay(); // 0 = domingo, 6 = sábado
    
    // Se for fim de semana, não é dia útil
    if (diaSemana === 0 || diaSemana === 6) {
      return false;
    }

    // Verificar se é o primeiro dia útil do mês
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    
    // Encontrar o primeiro dia útil do mês
    while (primeiroDia.getDay() === 0 || primeiroDia.getDay() === 6) {
      primeiroDia.setDate(primeiroDia.getDate() + 1);
    }
    
    return hoje.getDate() === primeiroDia.getDate();
  }

  /**
   * COMPETÊNCIA ANTERIOR: Calcular mês anterior para processamento
   */
  obterCompetenciaAnterior(): string {
    const hoje = new Date();
    const mesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    
    const ano = mesAnterior.getFullYear();
    const mes = String(mesAnterior.getMonth() + 1).padStart(2, '0');
    
    return `${ano}-${mes}`;
  }

  /**
   * CONFIGURAÇÕES GERAIS: Obter configurações globais do sistema
   */
  obterConfiguracaoGeral() {
    return {
      // URLs
      inanbetecVolumetriaURL: this.configService.get<string>('INANBETEC_VOLUMETRIA_URL'),
      omieApiURL: this.configService.get<string>('OMIE_API_URL'),
      
      // Credenciais
      omieAppKey: this.configService.get<string>('OMIE_APP_KEY'),
      omieAppSecret: this.configService.get<string>('OMIE_APP_SECRET'),
      
      // Configurações de processamento
      maxTentativas: this.configService.get<number>('MAX_TENTATIVAS', 3),
      timeoutAPI: this.configService.get<number>('TIMEOUT_API', 30000),
      
      // Horários de execução
      horarioConsolidacao: this.configService.get<string>('HORARIO_CONSOLIDACAO', '06:00'),
      horarioRetentativa1: this.configService.get<string>('HORARIO_RETENTATIVA_1', '10:00'),
      horarioRetentativa2: this.configService.get<string>('HORARIO_RETENTATIVA_2', '14:00'),
      
      // Limpeza de dados
      mesesRetencao: this.configService.get<number>('MESES_RETENCAO', 12)
    };
  }
}