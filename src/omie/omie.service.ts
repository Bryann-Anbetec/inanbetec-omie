import axios, { AxiosResponse } from 'axios';

interface OmieConfig {
  app_key: string;
  app_secret: string;
  base_url: string;
}

interface ClienteOmie {
  codigo_cliente_integracao: string;
  razao_social: string;
  cnpj_cpf: string;
  nome_fantasia?: string;
  telefone1_ddd?: string;
  telefone1_numero?: string;
  contato?: string;
  endereco?: string;
  endereco_numero?: string;
  bairro?: string;
  estado?: string;
  cidade?: string;
  cep?: string;
  email?: string;
  optante_simples_nacional?: string;
  contribuinte?: string;
  codigo_pais?: string;
  codigo_cliente_omie?: number;
}

interface OmieRequest {
  call: string;
  app_key: string;
  app_secret: string;
  param: any[];
}

interface OmieResponse {
  codigo_cliente_omie?: number;
  codigo_cliente_integracao?: string;
  codigo_status?: string;
  descricao_status?: string;
  codigo_erro?: string;
  descricao_erro?: string;
  [key: string]: any;
}

interface EmpresaInAnbetec {
  _id: string;
  nome: string;
  cnpj: string;
  responsavel: string;
  telefoneEmpresa: string;
  telefoneResponsavel: string;
  emailResponsavel: string;
  cpfResponsavel: string;
  endereco: string;
  complemento: string;
  cidade: string;
  cep: string;
  dataCadastro: Date;
  status: boolean;
}

class OmieService {
  private config: OmieConfig;

  constructor() {
    this.config = {
      app_key: process.env.OMIE_APP_KEY || '',
      app_secret: process.env.OMIE_APP_SECRET || '',
      base_url: process.env.OMIE_BASE_URL || 'https://app.omie.com.br/api/v1/geral/clientes/'
    };
  }

  /**
   * Extrai DDD e número do telefone
   */
  private extrairTelefone(telefone: string): { ddd: string; numero: string } {
    // Remove caracteres especiais
    const cleaned = telefone.replace(/[^\d]/g, '');
    
    if (cleaned.length >= 10) {
      return {
        ddd: cleaned.substring(0, 2),
        numero: cleaned.substring(2)
      };
    }
    
    return {
      ddd: '',
      numero: cleaned
    };
  }

  /**
   * Converte empresa do InAnbetec para formato Omie
   */
  private empresaToOmieCliente(empresa: EmpresaInAnbetec): ClienteOmie {
    const telefone = this.extrairTelefone(empresa.telefoneEmpresa);
    
    return {
      codigo_cliente_integracao: `inanbetec_${empresa._id}`,
      razao_social: empresa.nome.substring(0, 60),
      cnpj_cpf: empresa.cnpj.replace(/[^\d]/g, ''),
      nome_fantasia: empresa.nome.substring(0, 100),
      telefone1_ddd: telefone.ddd.substring(0, 5),
      telefone1_numero: telefone.numero.substring(0, 15),
      contato: empresa.responsavel.substring(0, 100),
      endereco: empresa.endereco.substring(0, 60),
      endereco_numero: empresa.complemento ? empresa.complemento.substring(0, 60) : '',
      cidade: empresa.cidade.substring(0, 40),
      cep: empresa.cep.replace(/[^\d]/g, '').substring(0, 10),
      email: empresa.emailResponsavel.substring(0, 500),
      optante_simples_nacional: 'N', // Padrão, pode ser configurável
      contribuinte: 'S', // Padrão, pode ser configurável
      codigo_pais: '1058' // Brasil
    };
  }

  /**
   * Executa chamada para API do Omie
   */
  private async executarChamadaOmie(method: string, params: any): Promise<OmieResponse> {
    const request: OmieRequest = {
      call: method,
      app_key: this.config.app_key,
      app_secret: this.config.app_secret,
      param: [params]
    };

    try {
      const response: AxiosResponse<OmieResponse> = await axios.post(
        this.config.base_url,
        request,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 segundos
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Erro Omie: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        throw new Error('Erro de rede ao conectar com Omie');
      } else {
        throw new Error(`Erro interno: ${error.message}`);
      }
    }
  }

  /**
   * Consulta cliente no Omie por CNPJ
   */
  async consultarClientePorCNPJ(cnpj: string): Promise<OmieResponse | null> {
    const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
    
    try {
      const response = await this.executarChamadaOmie('ConsultarCliente', {
        cnpj_cpf: cnpjLimpo
      });
      
      return response;
    } catch (error: any) {
      // Se o cliente não existe, retorna null
      if (error.message.includes('5004') || error.message.includes('não encontrado')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Consulta cliente no Omie por código de integração
   */
  async consultarClientePorIntegracao(codigoIntegracao: string): Promise<OmieResponse | null> {
    try {
      const response = await this.executarChamadaOmie('ConsultarCliente', {
        codigo_cliente_integracao: codigoIntegracao
      });
      
      return response;
    } catch (error: any) {
      // Se o cliente não existe, retorna null
      if (error.message.includes('5004') || error.message.includes('não encontrado')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Inclui novo cliente no Omie
   */
  async incluirCliente(empresa: EmpresaInAnbetec): Promise<OmieResponse> {
    const clienteOmie = this.empresaToOmieCliente(empresa);
    
    return await this.executarChamadaOmie('IncluirCliente', clienteOmie);
  }

  /**
   * Usa UpsertCliente para incluir ou atualizar
   */
  async upsertCliente(empresa: EmpresaInAnbetec): Promise<OmieResponse> {
    const clienteOmie = this.empresaToOmieCliente(empresa);
    
    return await this.executarChamadaOmie('UpsertCliente', clienteOmie);
  }

  /**
   * Altera cliente existente no Omie
   */
  async alterarCliente(empresa: EmpresaInAnbetec, codigoClienteOmie: number): Promise<OmieResponse> {
    const clienteOmie = this.empresaToOmieCliente(empresa);
    clienteOmie.codigo_cliente_omie = codigoClienteOmie;
    
    return await this.executarChamadaOmie('AlterarCliente', clienteOmie);
  }

  /**
   * Lista clientes do Omie
   */
  async listarClientes(pagina: number = 1, registrosPorPagina: number = 100): Promise<OmieResponse> {
    return await this.executarChamadaOmie('ListarClientes', {
      pagina,
      registros_por_pagina: registrosPorPagina,
      apenas_importado_api: 'N'
    });
  }

  /**
   * Sincroniza cliente InAnbetec com Omie
   * Verifica se existe, inclui se não existir, ou atualiza se existir
   */
  async sincronizarCliente(empresa: EmpresaInAnbetec): Promise<{ 
    sucesso: boolean; 
    codigoClienteOmie?: number; 
    acao: 'incluido' | 'atualizado' | 'relacionado'; 
    error?: string 
  }> {
    try {
      // 1. Verifica se já existe no Omie por CNPJ
      const clienteExistente = await this.consultarClientePorCNPJ(empresa.cnpj);
      
      if (clienteExistente && clienteExistente.codigo_cliente_omie) {
        // Cliente já existe, vamos atualizar
        const response = await this.alterarCliente(empresa, clienteExistente.codigo_cliente_omie);
        
        return {
          sucesso: true,
          codigoClienteOmie: clienteExistente.codigo_cliente_omie,
          acao: 'atualizado'
        };
      } else {
        // Cliente não existe, vamos incluir
        const response = await this.incluirCliente(empresa);
        
        return {
          sucesso: true,
          codigoClienteOmie: response.codigo_cliente_omie,
          acao: 'incluido'
        };
      }
    } catch (error: any) {
      return {
        sucesso: false,
        acao: 'incluido',
        error: error.message
      };
    }
  }

  /**
   * Executa retry com backoff exponencial
   */
  async executarComRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        // Não faz retry para erros de validação ou duplicidade
        if (error.message.includes('5004') || 
            error.message.includes('duplicado') ||
            error.message.includes('já existe')) {
          throw error;
        }
        
        if (attempt === maxRetries) {
          break;
        }
        
        // Calcula delay com backoff exponencial
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }

  /**
   * Sincroniza cliente com retry
   */
  async sincronizarClienteComRetry(empresa: EmpresaInAnbetec): Promise<{ 
    sucesso: boolean; 
    codigoClienteOmie?: number; 
    acao: 'incluido' | 'atualizado' | 'relacionado'; 
    error?: string 
  }> {
    return await this.executarComRetry(() => this.sincronizarCliente(empresa));
  }
}

export default new OmieService();
