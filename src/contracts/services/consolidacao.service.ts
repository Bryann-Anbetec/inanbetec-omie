import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { VolumetriaConsolidada, VolumetriaConsolidadaDocument } from '../schemas/volumetria-consolidada.schema';

export interface ConsolidacaoData {
  competencia: string; // YYYY-MM
  empresaId: number;
  numeroProposta: string;
  valorTotal: number;
  produtos: Array<{
    nome: string;
    valor: number;
    quantidade?: number;
  }>;
  payload?: any; // Dados adicionais do contrato original
}

export interface FiltrosConsolidacao {
  competencia?: string;
  empresaId?: number;
  status?: string;
  proposta?: string;
}

@Injectable()
export class ConsolidacaoService {
  private readonly logger = new Logger(ConsolidacaoService.name);

  constructor(
    @InjectModel(VolumetriaConsolidada.name) 
    private consolidacaoModel: Model<VolumetriaConsolidadaDocument>
  ) {}

  /**
   * PERSISTIR: Salvar dados consolidados no MongoDB
   */
  async persistirConsolidacao(dados: ConsolidacaoData): Promise<VolumetriaConsolidadaDocument> {
    try {
      // Calcular totais dos produtos
      const quantidadeTotal = dados.produtos.reduce((total, produto) => 
        total + (produto.quantidade || 1), 0
      );

      const totalProdutos = dados.produtos.length;

      // Gerar código único para integração com Omie
      const codigoIntegracao = this.gerarCodigoIntegracao(
        dados.competencia, 
        dados.empresaId, 
        dados.numeroProposta
      );

      // Criar documento para persistir
      const consolidacao = new this.consolidacaoModel({
        competencia: this.converterCompetenciaParaDate(dados.competencia),
        empresaId: dados.empresaId,
        numeroProposta: dados.numeroProposta,
        proposta: dados.numeroProposta, // Para compatibilidade
        valorTotal: dados.valorTotal,
        quantidadeTotal,
        totalProdutos,
        produtos: dados.produtos,
        payload: dados.payload || {},
        codigoIntegracao,
        status: 'ready_to_send',
        tentativas: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const resultado = await consolidacao.save();
      
      this.logger.log(`Consolidação persistida - ID: ${resultado._id}`);
      return resultado;

    } catch (error) {
      if (error.code === 11000) { // Duplicate key error
        this.logger.warn(`Consolidação duplicada detectada - reprocessando: ${dados.competencia}/${dados.empresaId}/${dados.numeroProposta}`);
        return await this.buscarConsolidacao(dados.competencia, dados.empresaId, dados.numeroProposta);
      }
      
      this.logger.error(`Erro ao persistir consolidação: ${error.message}`);
      throw error;
    }
  }

  /**
   * BUSCAR POR CHAVE: Encontrar consolidação específica
   */
  async buscarConsolidacao(
    competencia: string,
    empresaId: number,
    proposta: string
  ): Promise<VolumetriaConsolidadaDocument | null> {
    try {
      const competenciaDate = this.converterCompetenciaParaDate(competencia);
      
      return await this.consolidacaoModel.findOne({
        competencia: competenciaDate,
        empresaId,
        proposta
      }).exec();

    } catch (error) {
      this.logger.error(`Erro ao buscar consolidação: ${error.message}`);
      return null;
    }
  }

  /**
   * ATUALIZAR STATUS: Atualizar status e informações de envio
   */
  async atualizarStatusConsolidacao(
    id: string,
    novoStatus: string,
    mensagemErro?: string,
    omieRequest?: any,
    omieResponse?: any
  ): Promise<VolumetriaConsolidadaDocument> {
    try {
      const updates: any = {
        status: novoStatus,
        updatedAt: new Date()
      };

      if (mensagemErro) {
        updates.mensagemErro = mensagemErro;
      }

      if (omieRequest) {
        updates.omieRequest = omieRequest;
      }

      if (omieResponse) {
        updates.omieResponse = omieResponse;
        
        // Se sucesso no Omie, salvar IDs do contrato
        if (omieResponse.cCodStatus === '0') {
          updates.contratoOmieId = omieResponse.nCodCtr;
          updates.mensagemErro = null; // Limpar erro anterior
        }
      }

      // Incrementar tentativas se for erro
      if (novoStatus === 'error') {
        updates.$inc = { tentativas: 1 };
      }

      const resultado = await this.consolidacaoModel.findByIdAndUpdate(
        id,
        updates,
        { new: true }
      );

      if (!resultado) {
        throw new Error(`Consolidação não encontrada: ${id}`);
      }

      this.logger.log(`Status atualizado para ${novoStatus} - ID: ${id}`);
      return resultado;

    } catch (error) {
      this.logger.error(`Erro ao atualizar status: ${error.message}`);
      throw error;
    }
  }

  /**
   * BUSCAR: Consultar registros de consolidação
   */
  async listarConsolidacoes(filtros: FiltrosConsolidacao = {}): Promise<VolumetriaConsolidadaDocument[]> {
    try {
      const query: any = {};

      if (filtros.competencia) {
        query.competencia = this.converterCompetenciaParaDate(filtros.competencia);
      }

      if (filtros.empresaId) {
        query.empresaId = filtros.empresaId;
      }

      if (filtros.status) {
        query.status = filtros.status;
      }

      if (filtros.proposta) {
        query.proposta = filtros.proposta;
      }

      return await this.consolidacaoModel
        .find(query)
        .sort({ createdAt: -1 })
        .exec();

    } catch (error) {
      this.logger.error(`Erro ao listar consolidações: ${error.message}`);
      throw error;
    }
  }

  /**
   * REPROCESSAR: Marcar registro para reenvio
   */
  async marcarParaReprocessamento(id: string): Promise<boolean> {
    try {
      const resultado = await this.consolidacaoModel.findByIdAndUpdate(
        id,
        {
          status: 'ready_to_send',
          mensagemErro: null,
          omieRequest: null,
          omieResponse: null
        },
        { new: true }
      );

      if (resultado) {
        this.logger.log(`Consolidação marcada para reprocessamento: ${id}`);
        return true;
      }

      return false;

    } catch (error) {
      this.logger.error(`Erro ao marcar para reprocessamento: ${error.message}`);
      return false;
    }
  }

  /**
   * ATUALIZAR TOTAIS: Recalcular valores de uma consolidação
   */
  async atualizarTotais(id: string, novosTotais: any): Promise<void> {
    try {
      const resultado = await this.consolidacaoModel.findByIdAndUpdate(
        id,
        {
          valorTotal: novosTotais.valorTotal,
          quantidadeTotal: novosTotais.quantidadeTotal,
          totalProdutos: novosTotais.totalProdutos,
          updatedAt: new Date()
        },
        { new: true }
      );

      if (!resultado) {
        throw new Error(`Consolidação não encontrada: ${id}`);
      }

      this.logger.log(`Totais atualizados - ID: ${id}`);

    } catch (error) {
      this.logger.error(`Erro ao atualizar totais: ${error.message}`);
      throw error;
    }
  }

  /**
   * ESTATÍSTICAS: Obter estatísticas de consolidações
   */
  async obterEstatisticas(competencia?: string): Promise<any> {
    try {
      const matchStage: any = {};
      
      if (competencia) {
        matchStage.competencia = this.converterCompetenciaParaDate(competencia);
      }

      const stats = await this.consolidacaoModel.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$status',
            total: { $sum: 1 },
            valorTotal: { $sum: '$valorTotal' },
            valorMedio: { $avg: '$valorTotal' }
          }
        }
      ]);

      // Transformar resultado para formato legível
      const resultado = {
        totalRegistros: 0,
        porStatus: {},
        valorTotalGeral: 0
      };

      for (const stat of stats) {
        resultado.totalRegistros += stat.total;
        resultado.valorTotalGeral += stat.valorTotal;
        resultado.porStatus[stat._id] = {
          total: stat.total,
          valorTotal: stat.valorTotal,
          valorMedio: stat.valorMedio
        };
      }

      return resultado;

    } catch (error) {
      this.logger.error(`Erro ao obter estatísticas: ${error.message}`);
      throw error;
    }
  }

  /**
   * LIMPEZA: Remover consolidações antigas ou com erro
   */
  async limparConsolidacoes(competencia?: string, apenasErros: boolean = false): Promise<number> {
    try {
      const filtro: any = {};
      
      if (competencia) {
        filtro.competencia = this.converterCompetenciaParaDate(competencia);
      }
      
      if (apenasErros) {
        filtro.status = 'error';
      }

      const resultado = await this.consolidacaoModel.deleteMany(filtro);
      
      this.logger.log(`Limpeza concluída: ${resultado.deletedCount} registros removidos`);
      return resultado.deletedCount;

    } catch (error) {
      this.logger.error(`Erro na limpeza: ${error.message}`);
      throw error;
    }
  }

  /**
   * Utilitários privados
   */
  private converterCompetenciaParaDate(competencia: string): Date {
    // YYYY-MM → YYYY-MM-01
    const [ano, mes] = competencia.split('-');
    return new Date(`${ano}-${mes}-01T00:00:00.000Z`);
  }

  private gerarCodigoIntegracao(competencia: string, empresaId: number, proposta: string): string {
    // CTR-{AAAA}-{MM}-EMP{empresaId}-PROP-{numeroProposta}
    const [ano, mes] = competencia.split('-');
    return `CTR-${ano}-${mes}-EMP${empresaId}-PROP-${proposta}`;
  }

  /**
   * LIMPEZA: Remover registros antigos (manutenção)
   */
  async limparRegistrosAntigos(mesesAnteriores: number = 12): Promise<number> {
    try {
      const dataLimite = new Date();
      dataLimite.setMonth(dataLimite.getMonth() - mesesAnteriores);

      const resultado = await this.consolidacaoModel.deleteMany({
        competencia: { $lt: dataLimite },
        status: 'sent' // Só remove os já enviados com sucesso
      });

      this.logger.log(`Limpeza concluída: ${resultado.deletedCount} registros removidos`);
      return resultado.deletedCount;

    } catch (error) {
      this.logger.error(`Erro na limpeza de registros: ${error.message}`);
      return 0;
    }
  }
}