import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmpresaInanbetecDocument = EmpresaInanbetec & Document;

@Schema({ collection: 'empresas', timestamps: false })
export class EmpresaInanbetec {
  @Prop()
  nome?: string;

  @Prop()
  razaoSocial?: string;

  @Prop()
  nomeFantasia?: string;

  @Prop()
  email?: string;

  @Prop()
  cnpj?: string;

  @Prop()
  cpf?: string;

  @Prop()
  telefone?: string;

  @Prop()
  celular?: string;

  @Prop()
  endereco?: string;

  @Prop()
  numero?: string;

  @Prop()
  complemento?: string;

  @Prop()
  bairro?: string;

  @Prop()
  cidade?: string;

  @Prop()
  estado?: string;

  @Prop()
  cep?: string;

  @Prop()
  inscricaoEstadual?: string;

  @Prop()
  inscricaoMunicipal?: string;

  @Prop()
  ativo?: boolean;

  @Prop()
  dataCriacao?: Date;

  @Prop()
  dataAtualizacao?: Date;

  @Prop()
  tipo?: string;

  @Prop()
  status?: string;

  @Prop()
  documento?: string;

  @Prop()
  idEmpresa?: number;
}

export const EmpresaInanbetecSchema = SchemaFactory.createForClass(EmpresaInanbetec);