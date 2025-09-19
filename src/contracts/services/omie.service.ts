import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OmieService {
  private readonly logger = new Logger(OmieService.name);
  private readonly baseURL: string;
  private readonly appKey: string;
  private readonly appSecret: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseURL = 'https://app.omie.com.br/api/v1/servicos/contrato/';
    this.appKey = this.configService.get<string>('OMIE_APP_KEY');
    this.appSecret = this.configService.get<string>('OMIE_APP_SECRET');

    if (!this.appKey || !this.appSecret) {
      throw new Error('Variáveis de ambiente OMIE_APP_KEY e OMIE_APP_SECRET são obrigatórias');
    }
  }

  async callAPI(method: string, params: any) {
    try {
      const payload = {
        call: method,
        app_key: this.appKey,
        app_secret: this.appSecret,
        param: [params]
      };

      this.logger.log(`Chamando API Omie - Método: ${method}`);
      const response = await firstValueFrom(
        this.httpService.post(this.baseURL, payload)
      );
      
      return (response as any).data;
    } catch (error) {
      this.logger.error(`Erro na chamada da API Omie: ${error.message}`);
      throw error;
    }
  }

  async incluirContrato(contratoCadastro: any) {
    return this.callAPI('IncluirContrato', contratoCadastro);
  }

  async alterarContrato(contratoCadastro: any) {
    return this.callAPI('AlterarContrato', contratoCadastro);
  }

  async consultarContrato(contratoChave: any) {
    return this.callAPI('ConsultarContrato', { contratoChave });
  }

  async listarContratos(csListarRequest: any) {
    return this.callAPI('ListarContratos', csListarRequest);
  }

  async upsertContrato(contratoCadastro: any) {
    return this.callAPI('UpsertContrato', contratoCadastro);
  }

  async excluirItem(contratoChave: any, itensExclusao: any) {
    const params = {
      contratoChave,
      ItensExclusao: itensExclusao
    };
    return this.callAPI('ExcluirItem', params);
  }

  // Métodos para clientes
  async incluirCliente(clienteCadastro: any) {
    const payload = {
      call: 'IncluirCliente',
      app_key: this.appKey,
      app_secret: this.appSecret,
      param: [clienteCadastro]
    };

    try {
      this.logger.log('Incluindo cliente no Omie');
      const response = await firstValueFrom(
        this.httpService.post('https://app.omie.com.br/api/v1/geral/clientes/', payload)
      );
      
      return (response as any).data;
    } catch (error) {
      this.logger.error(`Erro ao incluir cliente no Omie: ${error.message}`);
      throw error;
    }
  }

  async alterarCliente(clienteCadastro: any) {
    const payload = {
      call: 'AlterarCliente',
      app_key: this.appKey,
      app_secret: this.appSecret,
      param: [clienteCadastro]
    };

    try {
      this.logger.log('Alterando cliente no Omie');
      const response = await firstValueFrom(
        this.httpService.post('https://app.omie.com.br/api/v1/geral/clientes/', payload)
      );
      
      return (response as any).data;
    } catch (error) {
      this.logger.error(`Erro ao alterar cliente no Omie: ${error.message}`);
      throw error;
    }
  }

  async consultarCliente(clienteChave: any) {
    const payload = {
      call: 'ConsultarCliente',
      app_key: this.appKey,
      app_secret: this.appSecret,
      param: [{ clienteChave }]
    };

    try {
      this.logger.log('Consultando cliente no Omie');
      const response = await firstValueFrom(
        this.httpService.post('https://app.omie.com.br/api/v1/geral/clientes/', payload)
      );
      
      return (response as any).data;
    } catch (error) {
      this.logger.error(`Erro ao consultar cliente no Omie: ${error.message}`);
      throw error;
    }
  }

  async listarClientes(listarRequest: any) {
    const payload = {
      call: 'ListarClientes',
      app_key: this.appKey,
      app_secret: this.appSecret,
      param: [listarRequest]
    };

    try {
      this.logger.log('Listando clientes no Omie');
      const response = await firstValueFrom(
        this.httpService.post('https://app.omie.com.br/api/v1/geral/clientes/', payload)
      );
      
      return (response as any).data;
    } catch (error) {
      this.logger.error(`Erro ao listar clientes no Omie: ${error.message}`);
      throw error;
    }
  }
}