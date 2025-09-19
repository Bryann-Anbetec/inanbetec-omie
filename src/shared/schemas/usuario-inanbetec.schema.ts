import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UsuarioInanbetecDocument = UsuarioInanbetec & Document;

@Schema({ collection: 'usuarios' })
export class UsuarioInanbetec {
  @Prop()
  _id: string;

  @Prop({ required: true })
  nome: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  telefone: string;

  @Prop({ required: true })
  cpf: string;

  @Prop()
  cnpj?: string;

  @Prop({ type: Object })
  usuarioWinthor?: {
    matricula: number;
    nome: string;
  };

  @Prop([{ type: Object }])
  motoristaWinthor?: Array<{
    matricula: number;
    nome: string;
  }>;

  @Prop({ type: Object })
  perfil: {
    nome: string;
    modulos: Array<{
      rotas: string[];
      servico: string;
    }>;
    idEmpresa: string;
  };

  @Prop({ required: true })
  idEmpresa: number;

  @Prop()
  permiteEditarValorPgt?: boolean;

  @Prop()
  tipoAprovador?: string;

  @Prop({ type: Date })
  dataCadastro: Date;

  @Prop()
  senha: string;

  @Prop({ default: 0 })
  __v: number;
}

export const UsuarioInanbetecSchema = SchemaFactory.createForClass(UsuarioInanbetec);