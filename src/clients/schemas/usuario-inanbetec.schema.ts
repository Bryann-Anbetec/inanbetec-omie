import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UsuarioInanbetecDocument = UsuarioInanbetec & Document;

@Schema({ collection: 'usuarios', timestamps: false })
export class UsuarioInanbetec {
  @Prop()
  _id?: string;

  @Prop()
  nome?: string;

  @Prop()
  email?: string;

  @Prop()
  cpf?: string;

  @Prop()
  cnpj?: string;

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
  razaoSocial?: string;

  @Prop()
  nomeFantasia?: string;

  @Prop()
  inscricaoEstadual?: string;

  @Prop()
  inscricaoMunicipal?: string;

  @Prop()
  empresa?: number;

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
}

export const UsuarioInanbetecSchema = SchemaFactory.createForClass(UsuarioInanbetec);