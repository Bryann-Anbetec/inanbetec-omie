import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class InanbetecService {
  private readonly logger = new Logger(InanbetecService.name);
  private readonly baseURL: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseURL = this.configService.get<string>(
      'INANBETEC_API_URL',
      'https://api.inanbetec.com.br/v1',
    );
  }

  async buscarClientePorCNPJ(cnpj: string) {
    try {
      this.logger.log(`Buscando cliente na Inanbetec por CNPJ: ${cnpj}`);
      const url = `${this.baseURL}/clientes/buscar`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, {
          params: { cnpj: this.limparDocumento(cnpj) }
        })
      );
      
      this.logger.log(`Cliente encontrado na Inanbetec: ${JSON.stringify((response as any).data)}`);
      return (response as any).data;
    } catch (error) {
      this.logger.error(`Erro ao buscar cliente na Inanbetec: ${error.message}`);
      if (error.response?.status === 404) {
        return null; // Cliente não encontrado
      }
      throw error;
    }
  }

  async criarCliente(clienteData: any) {
    try {
      this.logger.log(`Criando cliente na Inanbetec: ${JSON.stringify(clienteData)}`);
      const url = `${this.baseURL}/clientes`;
      
      const dadosInanbetec = this.mapearParaInanbetec(clienteData);
      
      const response = await firstValueFrom(
        this.httpService.post(url, dadosInanbetec)
      );
      
      this.logger.log(`Cliente criado na Inanbetec: ${JSON.stringify((response as any).data)}`);
      return (response as any).data;
    } catch (error) {
      this.logger.error(`Erro ao criar cliente na Inanbetec: ${error.message}`);
      throw error;
    }
  }

  async atualizarCliente(clienteId: string, clienteData: any) {
    try {
      this.logger.log(`Atualizando cliente na Inanbetec ID: ${clienteId}`);
      const url = `${this.baseURL}/clientes/${clienteId}`;
      
      const dadosInanbetec = this.mapearParaInanbetec(clienteData);
      
      const response = await firstValueFrom(
        this.httpService.put(url, dadosInanbetec)
      );
      
      this.logger.log(`Cliente atualizado na Inanbetec: ${JSON.stringify((response as any).data)}`);
      return (response as any).data;
    } catch (error) {
      this.logger.error(`Erro ao atualizar cliente na Inanbetec: ${error.message}`);
      throw error;
    }
  }

  async listarClientes(filtros: any = {}) {
    try {
      this.logger.log(`Listando clientes na Inanbetec com filtros: ${JSON.stringify(filtros)}`);
      const url = `${this.baseURL}/clientes`;
      
      const response = await firstValueFrom(
        this.httpService.get(url, { params: filtros })
      );
      
      this.logger.log(`Lista de clientes retornada da Inanbetec: ${(response as any).data?.length || 0} registros`);
      return (response as any).data;
    } catch (error) {
      this.logger.error(`Erro ao listar clientes na Inanbetec: ${error.message}`);
      throw error;
    }
  }

  private mapearParaInanbetec(clienteOmie: any) {
    // Mapear dados do formato Omie para o formato Inanbetec
    return {
      cnpj_cpf: clienteOmie.cnpj_cpf || clienteOmie.documento,
      razao_social: clienteOmie.razao_social || clienteOmie.nome,
      nome_fantasia: clienteOmie.nome_fantasia || clienteOmie.nomeFantasia,
      email: clienteOmie.email,
      telefone1: clienteOmie.telefone1_numero || clienteOmie.telefone,
      endereco: {
        logradouro: clienteOmie.endereco?.endereco || clienteOmie.endereco?.logradouro,
        numero: clienteOmie.endereco?.numero,
        complemento: clienteOmie.endereco?.complemento,
        bairro: clienteOmie.endereco?.bairro,
        cidade: clienteOmie.endereco?.cidade,
        estado: clienteOmie.endereco?.estado,
        cep: clienteOmie.endereco?.cep
      }
    };
  }

  mapearParaOmie(clienteInanbetec: any) {
    // Mapear dados do formato Inanbetec para o formato Omie
    return {
      cnpj_cpf: this.limparDocumento(clienteInanbetec.cnpj_cpf),
      razao_social: clienteInanbetec.razao_social,
      nome_fantasia: clienteInanbetec.nome_fantasia,
      email: clienteInanbetec.email,
      telefone1_numero: clienteInanbetec.telefone,
      endereco: {
        endereco: clienteInanbetec.endereco?.logradouro,
        numero: clienteInanbetec.endereco?.numero,
        complemento: clienteInanbetec.endereco?.complemento,
        bairro: clienteInanbetec.endereco?.bairro,
        cidade: clienteInanbetec.endereco?.cidade,
        estado: clienteInanbetec.endereco?.estado,
        cep: this.limparCEP(clienteInanbetec.endereco?.cep)
      },
      tags: [
        {
          tag: 'origem:inanbetec'
        }
      ]
    };
  }

  private limparDocumento(documento: string): string {
    if (!documento) return '';
    return documento.replace(/[^\d]/g, '');
  }

  private limparCEP(cep: string): string {
    if (!cep) return '';
    return cep.replace(/[^\d]/g, '');
  }
}