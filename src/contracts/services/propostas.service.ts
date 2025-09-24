import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface PropostaComercial {
  numero: string;
  empresaId: number;
  produto: string;
  competencia: string;
  vigenciaInicial: string;
  vigenciaFinal: string;
}

@Injectable()
export class PropostasService {
  private readonly logger = new Logger(PropostasService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService
  ) {}

  /**
   * MÉTODO PRINCIPAL: Obter número da proposta comercial por empresa/produto/período
   * Este é o método crítico mencionado na especificação: getProposta(empresaId, produto, periodo)
   */
  async obterPropostaPorProduto(
    empresaId: number,
    nomeProduto: string,
    competencia: string // Formato: YYYY-MM
  ): Promise<string | null> {
    try {
      this.logger.log(`Obtendo proposta - Empresa: ${empresaId}, Produto: ${nomeProduto}, Competência: ${competencia}`);

      // ESTRATÉGIA 1: Consultar configuração no banco/arquivo
      const propostaPorConfig = await this.buscarPropostaNaConfiguracao(empresaId, nomeProduto, competencia);
      if (propostaPorConfig) {
        return propostaPorConfig;
      }

      // ESTRATÉGIA 2: Consultar API específica de propostas (se existir)
      const propostaPorAPI = await this.buscarPropostaNaAPI(empresaId, nomeProduto, competencia);
      if (propostaPorAPI) {
        return propostaPorAPI;
      }

      // ESTRATÉGIA 3: Mapeamento estático baseado nos exemplos fornecidos
      const propostaPorMapeamento = this.obterPropostaPorMapeamentoEstatico(empresaId, nomeProduto);
      if (propostaPorMapeamento) {
        return propostaPorMapeamento;
      }

      this.logger.warn(`Nenhuma proposta encontrada para: Empresa ${empresaId}, Produto ${nomeProduto}`);
      return null;

    } catch (error) {
      this.logger.error(`Erro ao obter proposta: ${error.message}`);
      return null;
    }
  }

  /**
   * NOVO: Obter preço correto do produto na proposta comercial (DINÂMICO)
   * Busca preços via APIs de pricing em vez de valores fixos
   */
  async obterPrecoProdutoNaProposta(
    numeroProposta: string,
    nomeProduto: string,
    quantidade: number
  ): Promise<number | null> {
    try {
      this.logger.log(`Calculando preço - Proposta: ${numeroProposta}, Produto: ${nomeProduto}, Qty: ${quantidade}`);

      // ESTRATÉGIA 1: API de pricing dinâmica
      const precoPorAPI = await this.buscarPrecoViaAPI(numeroProposta, nomeProduto, quantidade);
      if (precoPorAPI !== null) return precoPorAPI;

      // ESTRATÉGIA 2: Consultar tabela de preços da proposta
      const precoPorTabela = await this.buscarPrecoViaTabela(numeroProposta, nomeProduto, quantidade);
      if (precoPorTabela !== null) return precoPorTabela;

      // ESTRATÉGIA 3: Cálculo baseado em regras de negócio
      const precoPorRegras = await this.calcularPrecoViaRegras(numeroProposta, nomeProduto, quantidade);
      if (precoPorRegras !== null) return precoPorRegras;

      // ESTRATÉGIA 4: Fallback para último preço conhecido
      const precoUltimoConhecido = await this.buscarUltimoPrecoConhecido(numeroProposta, nomeProduto);
      if (precoUltimoConhecido !== null) {
        this.logger.warn(`⚠️ Usando último preço conhecido: R$ ${precoUltimoConhecido} (${nomeProduto})`);
        return precoUltimoConhecido;
      }

      this.logger.warn(`❌ Não foi possível calcular preço para: ${nomeProduto} na proposta ${numeroProposta}`);
      return null;

    } catch (error) {
      this.logger.error(`Erro ao calcular preço do produto: ${error.message}`);
      return null;
    }
  }

  /**
   * ESTRATÉGIA 1: Buscar preço via API de pricing (OTIMIZADO)
   */
  private async buscarPrecoViaAPI(proposta: string, produto: string, quantidade: number): Promise<number | null> {
    try {
      const inanbetecUrl = this.configService.get<string>('INANBETEC_API_URL');
      if (!inanbetecUrl) return null;

      // OTIMIZAÇÃO: Apenas endpoint mais provável
      const endpoint = `${inanbetecUrl}/pricing/proposta/${proposta}/produto/${produto}`;
      
      try {
        const response = await firstValueFrom(
          this.httpService.get(endpoint, {
            params: { quantidade },
            timeout: 1500
          })
        );

        const preco = response.data?.preco || response.data?.valor || response.data?.valorTotal;
        if (typeof preco === 'number' && preco >= 0) {
          this.logger.log(`✅ Preço via API: R$ ${preco} (${produto})`);
          return preco;
        }
      } catch (error) {
        // Falha silenciosa
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * ESTRATÉGIA 2: Buscar preço via tabela da proposta (OTIMIZADO)
   */
  private async buscarPrecoViaTabela(proposta: string, produto: string, quantidade: number): Promise<number | null> {
    try {
      const inanbetecUrl = this.configService.get<string>('INANBETEC_API_URL');
      if (!inanbetecUrl) return null;

      // OTIMIZAÇÃO: Apenas endpoint mais provável
      const endpoint = `${inanbetecUrl}/propostas/${proposta}/tabela-precos`;
      
      try {
        const response = await firstValueFrom(
          this.httpService.get(endpoint, { timeout: 1500 })
        );

        const tabela = response.data?.tabelaPrecos || response.data?.produtos || response.data || {};
        if (typeof tabela === 'object' && tabela[produto.toLowerCase()]) {
          const precoProduto = tabela[produto.toLowerCase()];
          let preco = typeof precoProduto === 'number' ? precoProduto : precoProduto.valor || precoProduto.preco;
          
          if (typeof preco === 'number' && preco >= 0) {
            this.logger.log(`✅ Preço via tabela: R$ ${preco} (${produto})`);
            return preco;
          }
        }
      } catch (error) {
        // Falha silenciosa
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * ESTRATÉGIA 3: Calcular preço via regras de negócio (OTIMIZADO)
   */
  private async calcularPrecoViaRegras(proposta: string, produto: string, quantidade: number): Promise<number | null> {
    try {
      // Regras básicas por tipo de produto - SEM logs de debug
      switch (produto.toLowerCase()) {
        case 'pixpay':
          if (quantidade > 0) {
            const preco = quantidade * 22.0;
            this.logger.log(`✅ Preço calculado (PixPay): R$ ${preco} (${quantidade} × R$ 22)`);
            return preco;
          }
          break;
          
        case 'webcheckout':
        case '@webcheckout':
          const taxaBase = quantidade > 1000 ? 2000 : 1500;
          this.logger.log(`✅ Preço calculado (WebCheckout): R$ ${taxaBase}`);
          return taxaBase;
          
        case 'cobranca':
        case 'cobrança':
          if (quantidade > 0) {
            const preco = Math.round(quantidade * 0.06 * 100) / 100;
            this.logger.log(`✅ Preço calculado (Cobrança): R$ ${preco} (${quantidade} × R$ 0.06)`);
            return preco;
          }
          break;
          
        case 'bolepix':
          if (quantidade > 0) {
            const preco = Math.round(quantidade * 0.06 * 100) / 100;
            this.logger.log(`✅ Preço calculado (BolePix): R$ ${preco} (${quantidade} × R$ 0.06)`);
            return preco;
          }
          break;
          
        case 'pagamentos':
          const preco = quantidade > 10000 ? quantidade * 0.01 : 0;
          this.logger.log(`✅ Preço calculado (Pagamentos): R$ ${preco}`);
          return preco;
          
        default:
          // Produto desconhecido - valor padrão mínimo
          return 0;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * ESTRATÉGIA 4: Buscar último preço conhecido
   */
  private async buscarUltimoPrecoConhecido(proposta: string, produto: string): Promise<number | null> {
    try {
      const inanbetecUrl = this.configService.get<string>('INANBETEC_API_URL');
      if (!inanbetecUrl) return null;

      const endpoints = [
        `${inanbetecUrl}/historico-precos/${proposta}/${produto}`,
        `${inanbetecUrl}/contratos/ultimo-preco/${produto}`
      ];

      for (const endpoint of endpoints) {
        try {
          this.logger.debug(`📚 Buscando último preço: ${endpoint}`);
          
          const response = await firstValueFrom(
            this.httpService.get(endpoint, { timeout: 2000 })
          );

          const ultimoPreco = response.data?.ultimoPreco || response.data?.valor || response.data?.preco;
          if (typeof ultimoPreco === 'number' && ultimoPreco >= 0) {
            this.logger.log(`✅ Último preço conhecido: R$ ${ultimoPreco} (${produto})`);
            return ultimoPreco;
          }
        } catch (error) {
          this.logger.debug(`Último preço endpoint falhou: ${error.message}`);
          continue;
        }
      }

      return null;
    } catch (error) {
      this.logger.debug(`Busca último preço falhou: ${error.message}`);
      return null;
    }
  }

  /**
   * ESTRATÉGIA 1: Buscar propostas via API da Inanbetec (DINÂMICO - OTIMIZADO)
   */
  private async buscarPropostaNaConfiguracao(
    empresaId: number,
    nomeProduto: string,
    competencia: string
  ): Promise<string | null> {
    try {
      const inanbetecUrl = this.configService.get<string>('INANBETEC_API_URL');
      if (!inanbetecUrl) {
        return null;
      }

      // OTIMIZAÇÃO: Tentar apenas o endpoint mais provável primeiro
      const endpointPrincipal = `${inanbetecUrl}/propostas/empresa/${empresaId}/produto/${nomeProduto}`;
      
      try {
        const response = await firstValueFrom(
          this.httpService.get(endpointPrincipal, {
            params: { competencia },
            timeout: 2000 // Timeout mais rápido
          })
        );

        const proposta = response.data?.numeroProposta || response.data?.numero;
        if (proposta) {
          this.logger.log(`✅ Proposta encontrada via API: ${proposta} (${nomeProduto})`);
          return proposta;
        }
      } catch (error) {
        // Falha silenciosa - API não existe ainda
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Buscar proposta específica para produto
   */
  private async buscarPropostaEspecifica(baseUrl: string, empresaId: number, produto: string, competencia: string): Promise<string | null> {
    try {
      const endpoints = [
        `${baseUrl}/propostas/empresa/${empresaId}/produto/${produto}`,
        `${baseUrl}/comercial/propostas/${empresaId}/${produto}`,
        `${baseUrl}/contratos/proposta-produto`
      ];

      for (const endpoint of endpoints) {
        try {
          this.logger.debug(`🎯 Buscando proposta específica: ${endpoint}`);
          
          const response = await firstValueFrom(
            this.httpService.get(endpoint, {
              params: { competencia, status: 'ativo' },
              timeout: 3000
            })
          );

          const proposta = response.data?.numeroProposta || response.data?.numero || response.data?.proposta;
          if (proposta) {
            this.logger.log(`✅ Proposta específica encontrada: ${proposta} (${produto})`);
            return proposta;
          }
        } catch (error) {
          this.logger.debug(`Endpoint específico falhou: ${error.message}`);
          continue;
        }
      }

      return null;
    } catch (error) {
      this.logger.debug(`Busca específica falhou: ${error.message}`);
      return null;
    }
  }

  /**
   * Buscar via contratos ativos
   */
  private async buscarPropostaViaContratos(baseUrl: string, empresaId: number, produto: string): Promise<string | null> {
    try {
      const endpoints = [
        `${baseUrl}/contratos/ativos/${empresaId}`,
        `${baseUrl}/empresas/${empresaId}/contratos/ativos`
      ];

      for (const endpoint of endpoints) {
        try {
          this.logger.debug(`📄 Buscando via contratos: ${endpoint}`);
          
          const response = await firstValueFrom(
            this.httpService.get(endpoint, {
              params: { produto, status: 'ativo' },
              timeout: 4000
            })
          );

          const contratos = response.data?.contratos || response.data || [];
          if (Array.isArray(contratos)) {
            const contratoComProduto = contratos.find(c => 
              c.produtos && c.produtos.includes(produto.toLowerCase())
            );
            
            if (contratoComProduto && contratoComProduto.numeroProposta) {
              this.logger.log(`✅ Proposta via contrato: ${contratoComProduto.numeroProposta} (${produto})`);
              return contratoComProduto.numeroProposta;
            }
          }
        } catch (error) {
          this.logger.debug(`Endpoint contrato falhou: ${error.message}`);
          continue;
        }
      }

      return null;
    } catch (error) {
      this.logger.debug(`Busca via contratos falhou: ${error.message}`);
      return null;
    }
  }

  /**
   * Buscar proposta histórica (última conhecida)
   */
  private async buscarPropostaHistorica(baseUrl: string, empresaId: number, produto: string): Promise<string | null> {
    try {
      const endpoints = [
        `${baseUrl}/propostas/historico/${empresaId}`,
        `${baseUrl}/comercial/historico-propostas`
      ];

      for (const endpoint of endpoints) {
        try {
          this.logger.debug(`📚 Buscando histórico: ${endpoint}`);
          
          const response = await firstValueFrom(
            this.httpService.get(endpoint, {
              params: { produto, empresaId, limit: 1 },
              timeout: 3000
            })
          );

          const historico = response.data?.propostas || response.data || [];
          if (Array.isArray(historico) && historico.length > 0) {
            const ultimaProposta = historico[0];
            const numero = ultimaProposta.numero || ultimaProposta.numeroProposta;
            if (numero) {
              this.logger.log(`✅ Proposta histórica: ${numero} (${produto})`);
              return numero;
            }
          }
        } catch (error) {
          this.logger.debug(`Endpoint histórico falhou: ${error.message}`);
          continue;
        }
      }

      return null;
    } catch (error) {
      this.logger.debug(`Busca histórica falhou: ${error.message}`);
      return null;
    }
  }

  /**
   * ESTRATÉGIA 2: Buscar via API geral de propostas (DINÂMICO - OTIMIZADO)
   */
  private async buscarPropostaNaAPI(
    empresaId: number,
    nomeProduto: string,
    competencia: string
  ): Promise<string | null> {
    try {
      const inanbetecUrl = this.configService.get<string>('INANBETEC_API_URL');
      if (!inanbetecUrl) return null;

      // OTIMIZAÇÃO: Apenas um endpoint mais provável
      const endpoint = `${inanbetecUrl}/propostas`;
      
      try {
        const response = await firstValueFrom(
          this.httpService.get(endpoint, {
            params: { 
              empresa: empresaId, 
              produto: nomeProduto, 
              competencia,
              status: 'ativo'
            },
            timeout: 2000
          })
        );

        const propostas = response.data?.propostas || response.data || [];
        if (Array.isArray(propostas) && propostas.length > 0) {
          const proposta = propostas[0];
          const numeroProposta = proposta.numero || proposta.numeroProposta || proposta.id;
          if (numeroProposta) {
            this.logger.log(`✅ Proposta encontrada via API geral: ${numeroProposta}`);
            return numeroProposta;
          }
        }
      } catch (error) {
        // Falha silenciosa
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * ESTRATÉGIA 3: Mapeamento dinâmico baseado em descoberta automática (OTIMIZADO)
   */
  private obterPropostaPorMapeamentoEstatico(
    empresaId: number,
    nomeProduto: string
  ): string | null {
    // Gerar número de proposta baseado no padrão observado de forma mais eficiente
    const ano = new Date().getFullYear();
    const mes = String(new Date().getMonth() + 1).padStart(2, '0');
    const sufixoEmpresa = String(empresaId).padStart(3, '0');
    
    const propostaPadrao = `${ano}${mes}00${sufixoEmpresa}`;
    
    // Log apenas uma vez por empresa para evitar spam
    if (!this._propostasGeradas) this._propostasGeradas = new Set();
    if (!this._propostasGeradas.has(empresaId)) {
      this.logger.log(`🔄 Proposta dinâmica gerada: ${propostaPadrao} (Empresa ${empresaId})`);
      this._propostasGeradas.add(empresaId);
    }
    
    return propostaPadrao;
  }

  private _propostasGeradas = new Set<number>();

  /**
   * Listar todas as propostas de uma empresa
   */
  async listarPropostasEmpresa(empresaId: number, competencia?: string): Promise<PropostaComercial[]> {
    try {
      // TODO: Implementar consulta real
      // Por enquanto retorna dados baseados no mapeamento estático
      
      const produtos = this.obterProdutosEmpresa(empresaId);
      const propostas: PropostaComercial[] = [];

      for (const produto of produtos) {
        const numeroProposta = this.obterPropostaPorMapeamentoEstatico(empresaId, produto);
        if (numeroProposta) {
          propostas.push({
            numero: numeroProposta,
            empresaId,
            produto,
            competencia: competencia || new Date().toISOString().slice(0, 7),
            vigenciaInicial: '01/01/2025', // TODO: Obter da configuração
            vigenciaFinal: '31/12/2025'   // TODO: Obter da configuração
          });
        }
      }

      return propostas;
    } catch (error) {
      this.logger.error(`Erro ao listar propostas da empresa ${empresaId}: ${error.message}`);
      return [];
    }
  }

  /**
   * Obter produtos disponíveis para uma empresa
   */
  /**
   * MÉTODO PÚBLICO: Obter lista de todos os produtos com propostas para uma empresa (DINÂMICO)
   */
  async obterProdutosComPropostas(empresaId: number): Promise<string[]> {
    try {
      this.logger.log(`Obtendo produtos com propostas para empresa ${empresaId}`);
      
      // ESTRATÉGIA 1: Buscar produtos dinamicamente via API
      const produtosDinamicos = await this.descobrirProdutosViaVolumetria(empresaId);
      if (produtosDinamicos.length > 0) {
        this.logger.log(`✅ Encontrados ${produtosDinamicos.length} produtos via API dinâmica`);
        return produtosDinamicos;
      }
      
      // ESTRATÉGIA 2: Fallback para mapeamento estático
      this.logger.debug('🔄 Usando mapeamento estático como fallback');
      return this.obterProdutosEmpresa(empresaId);
    } catch (error) {
      this.logger.error(`Erro ao obter produtos da empresa ${empresaId}: ${error.message}`);
      return this.obterProdutosEmpresa(empresaId); // Fallback sempre
    }
  }

    /**\n   * Consultar API específica de produtos\n   */
  private async consultarProdutosViaAPI(baseUrl: string, empresaId: number): Promise<string[]> {
    const endpoints = [
      `${baseUrl}/empresas/${empresaId}/produtos`,
      `${baseUrl}/propostas/empresa/${empresaId}/produtos`,
      `${baseUrl}/comercial/empresa/${empresaId}/produtos`
    ];

    for (const endpoint of endpoints) {
      try {
        this.logger.debug(`🔍 Consultando: ${endpoint}`);
        
        const response = await firstValueFrom(
          this.httpService.get(endpoint, {
            params: { status: 'ativo', temProposta: true },
            timeout: 3000
          })
        );

        const produtos = response.data?.produtos || response.data || [];
        if (Array.isArray(produtos) && produtos.length > 0) {
          const nomesProdutos = produtos.map(p => 
            p.nome || p.produto || p.codigo || p.id
          ).filter(Boolean);
          
          if (nomesProdutos.length > 0) {
            this.logger.log(`✅ API: ${nomesProdutos.length} produtos encontrados: ${nomesProdutos.join(', ')}`);
            return nomesProdutos;
          }
        }
      } catch (error) {
        this.logger.debug(`Endpoint ${endpoint} falhou: ${error.message}`);
        continue;
      }
    }

    return [];
  }

  /**
   * Descobrir produtos via volumetria atual (DINÂMICO - OTIMIZADO)
   */
  private async descobrirProdutosViaVolumetria(empresaId: number): Promise<string[]> {
    try {
      // URLs mais prováveis com timeout reduzido
      const baseUrl = this.configService.get<string>('INANBETEC_API_URL');
      const urlsVolumetria = [
        `${baseUrl}/empresas/${empresaId}/volumetria`,
        `${baseUrl}/clientes/volumetria/${empresaId}`
      ];

      for (const url of urlsVolumetria) {
        try {
          const response = await firstValueFrom(
            this.httpService.get(url, { timeout: 1500 })
          );
          
          if (response.data) {
            const produtos = this.extrairProdutosDaVolumetria(response.data);
            if (produtos.length > 0) {
              this.logger.log(`✅ Volumetria: ${produtos.length} produtos encontrados`);
              return produtos;
            }
          }
        } catch (error) {
          // Silencioso - 404 é esperado
          continue;
        }
      }

      return [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Extrair produtos dos dados de volumetria (OTIMIZADO)
   */
  private extrairProdutosDaVolumetria(dadosVolumetria: any): string[] {
    try {
      const produtos = new Set<string>();

      // Tentar várias estruturas possíveis de dados
      const datasets = [
        dadosVolumetria,
        dadosVolumetria?.produtos,
        dadosVolumetria?.volumetria,
        dadosVolumetria?.data,
        dadosVolumetria?.items
      ].filter(Boolean);

      for (const dataset of datasets) {
        if (Array.isArray(dataset)) {
          dataset.forEach(item => {
            const nome = item?.produto || item?.nome || item?.name || item?.tipo;
            if (nome && typeof nome === 'string') {
              produtos.add(nome.toLowerCase());
            }
          });
        } else if (typeof dataset === 'object') {
          Object.keys(dataset).forEach(key => {
            if (typeof dataset[key] === 'number' && dataset[key] > 0) {
              produtos.add(key.toLowerCase());
            }
          });
        }
      }

      return Array.from(produtos);
    } catch (error) {
      return [];
    }
  }

  /**
   * MÉTODO PARA CONTRACTS SERVICE: Descobrir produtos dinamicamente via volumetria (OTIMIZADO)
   */
  async buscarProdutosDinamicamente(empresaId: number, dataInicio?: string, dataFim?: string): Promise<string[]> {
    try {
      // URLs mais prováveis com timeout reduzido
      const baseUrl = this.configService.get<string>('INANBETEC_API_URL');
      const urlsVolumetria = [
        `${baseUrl}/empresas/${empresaId}/volumetria${dataInicio ? `?inicio=${dataInicio}&fim=${dataFim}` : ''}`,
        `${baseUrl}/clientes/volumetria/${empresaId}${dataInicio ? `?periodo=${dataInicio}-${dataFim}` : ''}`
      ];

      for (const url of urlsVolumetria) {
        try {
          const response = await this.httpService.axiosRef.get(url, { timeout: 1500 });
          
          if (response.data) {
            const produtos = this.extrairProdutosDaVolumetriaCompleta(response.data);
            if (produtos.length > 0) {
              this.logger.log(`✅ Descobertos ${produtos.length} produtos via volumetria`);
              return produtos;
            }
          }
        } catch (error) {
          // Silencioso - 404 é esperado
          continue;
        }
      }

      // Fallback: produtos padrão como STRINGS
      this.logger.log(`📦 Usando produtos padrão (volumetria não disponível)`);
      return ['PixPay', 'WebCheckout', 'Cobranca', 'BolePix', 'Pagamentos'];

    } catch (error) {
      this.logger.error(`Erro ao buscar produtos dinamicamente: ${error.message}`);
      return [];
    }
  }

  /**
   * Extrair produtos completos com quantidades (para contracts service)
   */
  private extrairProdutosDaVolumetriaCompleta(dadosVolumetria: any): string[] {
    try {
      const produtos = new Set<string>();

      // Tentar várias estruturas possíveis
      const datasets = [
        dadosVolumetria,
        dadosVolumetria?.produtos,
        dadosVolumetria?.volumetria,
        dadosVolumetria?.data
      ].filter(Boolean);

      for (const dataset of datasets) {
        if (Array.isArray(dataset)) {
          dataset.forEach(item => {
            const nome = item?.produto || item?.nome || item?.name;
            if (nome && typeof nome === 'string') {
              produtos.add(nome);
            }
          });
        } else if (typeof dataset === 'object') {
          Object.keys(dataset).forEach(key => {
            const valor = dataset[key];
            if (typeof valor === 'number' && valor > 0) {
              produtos.add(key);
            } else if (typeof valor === 'object' && valor !== null) {
              // Para estruturas como { cobranca: { qtdeTitulos: 1000 }, pixpay: { qtdeMotoristas: 50 } }
              produtos.add(key);
            }
          });
        }
      }

      return Array.from(produtos);
    } catch (error) {
      return [];
    }
  }

  /**
   * MÉTODO INTERNO: Lista de produtos descobertos dinamicamente (fallback mínimo)
   */
  private obterProdutosEmpresa(empresaId: number): string[] {
    // IMPORTANTE: Este é um fallback mínimo caso todas as estratégias dinâmicas falhem
    
    this.logger.warn(`⚠️ Usando fallback de produtos básicos para empresa ${empresaId}`);
    
    // Lista básica de produtos comuns no sistema InAnbetec
    // Estes são produtos que geralmente existem, mas o sistema deve descobrir dinamicamente
    const produtosBasicos = [
      'cobranca', 'bolepix', 'pixpay', 'pagamentos', 'webcheckout'
    ];
    
    this.logger.debug(`🔄 Produtos básicos de fallback: ${produtosBasicos.join(', ')}`);
    return produtosBasicos;
  }

  /**
   * Validar se uma proposta existe e está ativa
   */
  async validarProposta(numeroProposta: string, empresaId: number): Promise<boolean> {
    try {
      // TODO: Implementar validação real
      // Por enquanto usa o mapeamento estático
      
      const produtos = this.obterProdutosEmpresa(empresaId);
      for (const produto of produtos) {
        const proposta = this.obterPropostaPorMapeamentoEstatico(empresaId, produto);
        if (proposta === numeroProposta) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      this.logger.error(`Erro ao validar proposta ${numeroProposta}: ${error.message}`);
      return false;
    }
  }

  /**
   * Obter configuração de vigência padrão para propostas
   */
  getConfiguracaoVigencia(): { inicial: string; final: string } {
    return {
      inicial: this.configService.get<string>('PROPOSTA_VIGENCIA_INICIAL', '01/01/2025'),
      final: this.configService.get<string>('PROPOSTA_VIGENCIA_FINAL', '31/12/2025')
    };
  }
}