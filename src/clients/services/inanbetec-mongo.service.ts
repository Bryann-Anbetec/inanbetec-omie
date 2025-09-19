import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { EmpresaInanbetec, EmpresaInanbetecDocument } from '../schemas/empresa-inanbetec.schema';

@Injectable()
export class InanbetecService {
  private readonly logger = new Logger(InanbetecService.name);

  constructor(
    @InjectModel(EmpresaInanbetec.name) 
    private empresaModel: Model<EmpresaInanbetecDocument>,
    private readonly configService: ConfigService,
  ) {}

  async buscarClientePorCNPJ(cnpj: string) {
    try {
      this.logger.log(`Buscando cliente na Inanbetec por CNPJ: ${cnpj}`);
      const cnpjLimpo = this.limparDocumento(cnpj);
      
      // Buscar por CPF/CNPJ no MongoDB
      const empresa = await this.empresaModel.findOne({
        $or: [
          { cpf: cnpjLimpo },
          { cnpj: cnpjLimpo },
          { documento: cnpjLimpo },
          { cpf: this.formatarDocumento(cnpjLimpo, 'cpf') },
          { cnpj: this.formatarDocumento(cnpjLimpo, 'cnpj') }
        ]
      }).exec();
      
      if (empresa) {
        this.logger.log(`Cliente encontrado na Inanbetec: ${empresa.nome} (${empresa.cpf || empresa.cnpj})`);
        return this.mapearEmpresaParaCliente(empresa);
      }
      
      this.logger.log(`Cliente não encontrado na Inanbetec para CNPJ: ${cnpj}`);
      return null;
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
      
      const dadosInanbetec = this.mapearParaInanbetec(clienteData);
      
      const novaEmpresa = new this.empresaModel(dadosInanbetec);
      const resultado = await novaEmpresa.save();
      
      this.logger.log(`Cliente criado na Inanbetec: ${resultado._id}`);
      return resultado;
    } catch (error) {
      this.logger.error(`Erro ao criar cliente na Inanbetec: ${error.message}`);
      throw error;
    }
  }

  async atualizarCliente(clienteId: string, clienteData: any) {
    try {
      this.logger.log(`Atualizando cliente na Inanbetec ID: ${clienteId}`);
      
      const dadosInanbetec = this.mapearParaInanbetec(clienteData);
      
      const resultado = await this.empresaModel.findByIdAndUpdate(
        clienteId, 
        dadosInanbetec, 
        { new: true }
      ).exec();
      
      this.logger.log(`Cliente atualizado na Inanbetec: ${resultado?._id}`);
      return resultado;
    } catch (error) {
      this.logger.error(`Erro ao atualizar cliente na Inanbetec: ${error.message}`);
      throw error;
    }
  }

  async listarClientes(filtros: any = {}) {
    try {
      this.logger.log(`Listando clientes na Inanbetec com filtros: ${JSON.stringify(filtros)}`);
      
      const query = this.empresaModel.find();
      
      // Aplicar filtros se fornecidos
      if (filtros.modificado_apos) {
        query.where('dataCriacao').gte(new Date(filtros.modificado_apos).getTime());
      }
      
      if (filtros.idEmpresa) {
        query.where('idEmpresa').equals(filtros.idEmpresa);
      }
      
      const empresas = await query.exec();
      
      this.logger.log(`Lista de clientes retornada da Inanbetec: ${empresas.length} registros`);
      return empresas.map(empresa => this.mapearEmpresaParaCliente(empresa));
    } catch (error) {
      this.logger.error(`Erro ao listar clientes na Inanbetec: ${error.message}`);
      throw error;
    }
  }

  private mapearEmpresaParaCliente(empresa: EmpresaInanbetecDocument) {
    // Mapear dados da empresa do MongoDB para formato de cliente
    return {
      id: empresa._id,
      cnpj_cpf: empresa.cpf || empresa.cnpj || empresa.documento,
      razao_social: empresa.razaoSocial || empresa.nome,
      nome_fantasia: empresa.nomeFantasia || empresa.nome,
      email: empresa.email,
      telefone: empresa.telefone || empresa.celular,
      endereco: {
        endereco: empresa.endereco || '',
        numero: empresa.numero || '',
        complemento: empresa.complemento || '',
        bairro: empresa.bairro || '',
        cidade: empresa.cidade || '',
        estado: empresa.estado || '',
        cep: empresa.cep || ''
      },
      data_cadastro: empresa.dataCriacao,
      origem: 'inanbetec'
    };
  }

  private mapearParaInanbetec(clienteOmie: any) {
    // Mapear dados do formato Omie para o formato EmpresaInanbetec
    // Logar os dados para debug
    this.logger.debug(`Dados do cliente Omie para mapeamento: ${JSON.stringify(clienteOmie, null, 2)}`);
    
    return {
      nome: clienteOmie.razao_social || clienteOmie.nome_fantasia || '',
      razaoSocial: clienteOmie.razao_social || '',
      nomeFantasia: clienteOmie.nome_fantasia || clienteOmie.razao_social || '',
      email: clienteOmie.email || '',
      telefone: clienteOmie.telefone1_numero || '',
      celular: clienteOmie.telefone1_numero || '',
      cpf: this.isCPF(clienteOmie.cnpj_cpf) ? this.limparDocumento(clienteOmie.cnpj_cpf) : undefined,
      cnpj: this.isCNPJ(clienteOmie.cnpj_cpf) ? this.limparDocumento(clienteOmie.cnpj_cpf) : undefined,
      documento: this.limparDocumento(clienteOmie.cnpj_cpf),
      // Endereço como campos individuais baseados na estrutura real do Omie
      endereco: clienteOmie.endereco || '',
      numero: clienteOmie.endereco_numero || '',
      complemento: clienteOmie.complemento || '',
      bairro: clienteOmie.bairro || '',
      cidade: clienteOmie.cidade ? clienteOmie.cidade.replace(/\s*\([^)]*\)/, '') : '', // Remove "(UF)" da cidade
      estado: clienteOmie.estado || '',
      cep: this.limparCEP(clienteOmie.cep) || '',
      inscricaoEstadual: clienteOmie.inscricao_estadual || '',
      inscricaoMunicipal: clienteOmie.inscricao_municipal || '',
      ativo: true,
      dataCriacao: new Date(),
      dataAtualizacao: new Date(),
      tipo: 'cliente',
      status: 'ativo',
      idEmpresa: this.configService.get<number>('INANBETEC_EMPRESA_ID', 258)
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
        endereco: clienteInanbetec.endereco?.endereco,
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

  private formatarDocumento(documento: string, tipo: 'cpf' | 'cnpj'): string {
    const limpo = this.limparDocumento(documento);
    
    if (tipo === 'cpf' && limpo.length === 11) {
      return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (tipo === 'cnpj' && limpo.length === 14) {
      return limpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    return documento;
  }

  private isCPF(documento: string): boolean {
    const limpo = this.limparDocumento(documento);
    return limpo.length === 11;
  }

  private isCNPJ(documento: string): boolean {
    const limpo = this.limparDocumento(documento);
    return limpo.length === 14;
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