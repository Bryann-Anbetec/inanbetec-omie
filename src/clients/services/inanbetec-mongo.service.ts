import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { UsuarioInanbetec, UsuarioInanbetecDocument } from '../../shared/schemas/usuario-inanbetec.schema';

@Injectable()
export class InanbetecService {
  private readonly logger = new Logger(InanbetecService.name);

  constructor(
    @InjectModel(UsuarioInanbetec.name) 
    private usuarioModel: Model<UsuarioInanbetecDocument>,
    private readonly configService: ConfigService,
  ) {}

  async buscarClientePorCNPJ(cnpj: string) {
    try {
      this.logger.log(`Buscando cliente na Inanbetec por CNPJ: ${cnpj}`);
      const cnpjLimpo = this.limparDocumento(cnpj);
      
      // Buscar por CPF/CNPJ no MongoDB
      const usuario = await this.usuarioModel.findOne({
        $or: [
          { cpf: cnpjLimpo },
          { cnpj: cnpjLimpo },
          { cpf: this.formatarDocumento(cnpjLimpo, 'cpf') },
          { cnpj: this.formatarDocumento(cnpjLimpo, 'cnpj') }
        ]
      }).exec();
      
      if (usuario) {
        this.logger.log(`Cliente encontrado na Inanbetec: ${usuario.nome} (${usuario.cpf || usuario.cnpj})`);
        return this.mapearUsuarioParaCliente(usuario);
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
      
      const novoUsuario = new this.usuarioModel(dadosInanbetec);
      const resultado = await novoUsuario.save();
      
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
      
      const resultado = await this.usuarioModel.findByIdAndUpdate(
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
      
      const query = this.usuarioModel.find();
      
      // Aplicar filtros se fornecidos
      if (filtros.modificado_apos) {
        query.where('dataCadastro').gte(new Date(filtros.modificado_apos).getTime());
      }
      
      if (filtros.idEmpresa) {
        query.where('idEmpresa').equals(filtros.idEmpresa);
      }
      
      const usuarios = await query.exec();
      
      this.logger.log(`Lista de clientes retornada da Inanbetec: ${usuarios.length} registros`);
      return usuarios.map(usuario => this.mapearUsuarioParaCliente(usuario));
    } catch (error) {
      this.logger.error(`Erro ao listar clientes na Inanbetec: ${error.message}`);
      throw error;
    }
  }

  private mapearUsuarioParaCliente(usuario: UsuarioInanbetecDocument) {
    // Mapear dados do usuário do MongoDB para formato de cliente
    return {
      id: usuario._id,
      cnpj_cpf: usuario.cpf || usuario.cnpj,
      razao_social: usuario.nome,
      nome_fantasia: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone,
      endereco: {
        // Como os usuários não têm endereço completo, vamos usar dados básicos
        endereco: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: ''
      },
      data_cadastro: usuario.dataCadastro,
      origem: 'inanbetec'
    };
  }

  private mapearParaInanbetec(clienteOmie: any) {
    // Mapear dados do formato Omie para o formato usuário Inanbetec
    return {
      nome: clienteOmie.razao_social || clienteOmie.nome,
      email: clienteOmie.email,
      telefone: clienteOmie.telefone1_numero || clienteOmie.telefone,
      cpf: this.isCPF(clienteOmie.cnpj_cpf) ? this.formatarDocumento(clienteOmie.cnpj_cpf, 'cpf') : undefined,
      cnpj: this.isCNPJ(clienteOmie.cnpj_cpf) ? this.formatarDocumento(clienteOmie.cnpj_cpf, 'cnpj') : undefined,
      idEmpresa: this.configService.get<number>('INANBETEC_EMPRESA_ID', 258),
      dataCadastro: new Date(),
      senha: '$2a$08$defaulthash', // Hash padrão
      perfil: {
        nome: 'Cliente Sincronizado',
        modulos: [],
        idEmpresa: this.configService.get<string>('INANBETEC_EMPRESA_ID', '258')
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