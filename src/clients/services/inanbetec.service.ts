import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmpresaInanbetec, EmpresaInanbetecDocument } from '../schemas/empresa-inanbetec.schema';

@Injectable()
export class InanbetecService {
  private readonly logger = new Logger(InanbetecService.name);

  constructor(
    @InjectModel(EmpresaInanbetec.name)
    private empresaModel: Model<EmpresaInanbetecDocument>,
  ) {}  async buscarClientePorCNPJ(cnpj: string) {
    try {
      this.logger.log(`Buscando cliente na Inanbetec por CNPJ: ${cnpj}`);
      const cnpjLimpo = this.limparDocumento(cnpj);
      
      this.logger.debug(`CNPJ limpo para busca: ${cnpjLimpo}`);
      
      // Buscar por CPF/CNPJ no MongoDB com várias tentativas
      const consultas = [
        { cnpj: cnpjLimpo },
        { cpf: cnpjLimpo },
        { cnpj: this.formatarDocumento(cnpjLimpo, 'cnpj') },
        { cpf: this.formatarDocumento(cnpjLimpo, 'cpf') },
        { documento: cnpjLimpo },
        { documento: this.formatarDocumento(cnpjLimpo, 'cnpj') },
        // Campos aninhados que podem existir
        { 'empresa.cnpj': cnpjLimpo },
        { 'empresa.documento': cnpjLimpo },
        { 'dados.cnpj': cnpjLimpo },
        { 'perfil.cnpj': cnpjLimpo }
      ];
      
      for (const consulta of consultas) {
        this.logger.debug(`Tentando busca com: ${JSON.stringify(consulta)}`);
        const empresa = await this.empresaModel.findOne(consulta).exec();
        
        if (empresa) {
          this.logger.log(`Cliente encontrado na Inanbetec: ${empresa.nome} (${empresa.cpf || empresa.cnpj})`);
          return this.mapearEmpresaParaCliente(empresa);
        }
      }
      
      // Se não encontrou, vamos tentar uma busca mais ampla
      this.logger.debug('Tentando busca ampla por regex...');
      const empresaRegex = await this.empresaModel.findOne({
        $or: [
          { cnpj: { $regex: cnpjLimpo } },
          { cpf: { $regex: cnpjLimpo } },
          { documento: { $regex: cnpjLimpo } }
        ]
      }).exec();
      
      if (empresaRegex) {
        this.logger.log(`Cliente encontrado na Inanbetec via regex: ${empresaRegex.nome}`);
        return this.mapearEmpresaParaCliente(empresaRegex);
      }
      
      // Debug: vamos verificar quantos documentos existem na coleção
      const totalEmpresas = await this.empresaModel.countDocuments();
      this.logger.debug(`Total de empresas na coleção: ${totalEmpresas}`);
      
      // Debug: buscar alguns documentos de exemplo
      const exemplos = await this.empresaModel.find().limit(3).exec();
      this.logger.debug(`Exemplos de documentos: ${JSON.stringify(exemplos.map(e => ({ nome: e.nome, cnpj: e.cnpj, cpf: e.cpf, _id: e._id })))}`);
      
      this.logger.log(`Cliente não encontrado na Inanbetec para CNPJ: ${cnpj}`);
      return null;
    } catch (error) {
      this.logger.error(`Erro ao buscar cliente na Inanbetec: ${error.message}`);
      this.logger.error(`Stack trace: ${error.stack}`);
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

  async atualizarCliente(cnpj: string, clienteData: any) {
    try {
      this.logger.log(`Atualizando cliente na Inanbetec CNPJ: ${cnpj}`);
      const cnpjLimpo = this.limparDocumento(cnpj);
      
      const dadosInanbetec = this.mapearParaInanbetec(clienteData);
      
      const resultado = await this.empresaModel.findOneAndUpdate(
        {
          $or: [
            { cpf: cnpjLimpo },
            { cnpj: cnpjLimpo }
          ]
        },
        dadosInanbetec,
        { new: true }
      ).exec();
      
      if (resultado) {
        this.logger.log(`Cliente atualizado na Inanbetec: ${resultado._id}`);
        return resultado;
      } else {
        this.logger.log(`Cliente não encontrado para atualização: ${cnpj}`);
        return null;
      }
    } catch (error) {
      this.logger.error(`Erro ao atualizar cliente na Inanbetec: ${error.message}`);
      throw error;
    }
  }

  async listarClientes(filtros: any = {}) {
    try {
      this.logger.log(`Listando clientes na Inanbetec com filtros: ${JSON.stringify(filtros)}`);
      
      const query = this.empresaModel.find(filtros);
      const empresas = await query.exec();
      
      this.logger.log(`Lista de clientes retornada da Inanbetec: ${empresas.length} registros`);
      return empresas.map(empresa => this.mapearEmpresaParaCliente(empresa));
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

  private formatarDocumento(documento: string, tipo: 'cpf' | 'cnpj'): string {
    const limpo = this.limparDocumento(documento);
    
    if (tipo === 'cpf' && limpo.length === 11) {
      return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (tipo === 'cnpj' && limpo.length === 14) {
      return limpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    return limpo;
  }

  private mapearEmpresaParaCliente(empresa: EmpresaInanbetecDocument) {
    return {
      id: empresa._id,
      nome: empresa.nome,
      razaoSocial: empresa.razaoSocial,
      nomeFantasia: empresa.nomeFantasia,
      documento: empresa.cnpj || empresa.cpf,
      email: empresa.email,
      telefone: empresa.telefone || empresa.celular,
      endereco: {
        endereco: empresa.endereco,
        numero: empresa.numero,
        complemento: empresa.complemento,
        bairro: empresa.bairro,
        cidade: empresa.cidade,
        estado: empresa.estado,
        cep: empresa.cep
      },
      idEmpresa: empresa.idEmpresa,
      ativo: empresa.ativo,
      origem: 'inanbetec'
    };
  }

  private formatarCEP(cep: string): string {
    if (!cep) return '';
    const limpo = cep.replace(/\D/g, '');
    if (limpo.length === 8) {
      return limpo.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    return limpo;
  }
}