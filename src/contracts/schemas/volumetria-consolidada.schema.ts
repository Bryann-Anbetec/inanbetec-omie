import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VolumetriaConsolidadaDocument = VolumetriaConsolidada & Document;

@Schema({ timestamps: true })
export class VolumetriaConsolidada {
  @Prop({ required: true })
  competencia: Date; // Competência da consolidação (YYYY-MM-01)

  @Prop({ required: true })
  empresaId: number; // ID da empresa

  @Prop({ required: true })
  numeroProposta: string; // Número da proposta comercial

  @Prop({ required: true })
  proposta: string; // Alias para numeroProposta (compatibilidade)

  @Prop({ required: true })
  valorTotal: number; // Valor total consolidado

  @Prop({ default: 0 })
  quantidadeTotal: number; // Quantidade total de itens

  @Prop({ default: 0 })
  totalProdutos: number; // Total de produtos diferentes

  @Prop({ type: Array, default: [] })
  produtos: Array<{
    nome: string;
    valor: number;
    quantidade?: number;
  }>; // Lista de produtos consolidados

  @Prop({ type: Object, default: {} })
  payload: any; // Dados originais do contrato

  @Prop({ required: true, unique: true })
  codigoIntegracao: string; // Código único para integração

  @Prop({ default: 'ready_to_send', enum: ['ready_to_send', 'sending', 'sent', 'error'] })
  status: string; // Status do envio

  @Prop({ default: 0 })
  tentativas: number; // Número de tentativas de envio

  @Prop()
  mensagemErro?: string; // Mensagem de erro se houver

  @Prop({ type: Object })
  omieRequest?: any; // Request enviado para o Omie

  @Prop({ type: Object })
  omieResponse?: any; // Response recebido do Omie

  @Prop()
  contratoOmieId?: number; // ID do contrato no Omie após sucesso

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const VolumetriaConsolidadaSchema = SchemaFactory.createForClass(VolumetriaConsolidada);

// Criar índice único composto
VolumetriaConsolidadaSchema.index({ competencia: 1, empresaId: 1, numeroProposta: 1 }, { unique: true });