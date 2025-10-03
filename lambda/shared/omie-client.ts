/**
 * CLIENTE OMIE PARA LAMBDAS
 * Cliente HTTP simplificado para interagir com API Omie
 */

import { LambdaLogger } from './logger';
import { OmieResponse } from './types';

export class OmieClient {
  private logger: LambdaLogger;
  private appKey: string;
  private appSecret: string;
  private baseUrl = 'https://app.omie.com.br/api/v1';

  constructor() {
    this.logger = new LambdaLogger('OmieClient');
    this.appKey = process.env.OMIE_APP_KEY || '';
    this.appSecret = process.env.OMIE_APP_SECRET || '';

    if (!this.appKey || !this.appSecret) {
      throw new Error('OMIE_APP_KEY e OMIE_APP_SECRET são obrigatórios');
    }
  }

  async incluirContrato(contratoData: any): Promise<OmieResponse> {
    return this.callApi('IncluirContrato', 'contratos/contrato/', [contratoData]);
  }

  async listarClientes(params: any = {}): Promise<any> {
    return this.callApi('ListarClientes', 'geral/clientes/', [params]);
  }

  async incluirCliente(clienteData: any): Promise<any> {
    return this.callApi('IncluirCliente', 'geral/clientes/', [clienteData]);
  }

  async consultarCliente(params: any): Promise<any> {
    return this.callApi('ConsultarCliente', 'geral/clientes/', [params]);
  }

  private async callApi(call: string, endpoint: string, params: any[]): Promise<any> {
    try {
      this.logger.log(`Chamando API Omie - Método: ${call}`);

      const payload = {
        call,
        app_key: this.appKey,
        app_secret: this.appSecret,
        param: params
      };

      this.logger.debug('Payload completo:', payload);

      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (!response.ok) {
        this.logger.error('Erro na chamada da API Omie:', responseData);
        throw new Error(`Request failed with status code ${response.status}`);
      }

      this.logger.log('Resposta da API Omie recebida com sucesso');
      this.logger.debug('Resposta:', responseData);

      return responseData;

    } catch (error) {
      this.logger.error('Erro na chamada da API Omie:', error);
      throw error;
    }
  }
}