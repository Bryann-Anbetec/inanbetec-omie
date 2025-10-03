/**
 * CLIENTE MONGODB PARA LAMBDAS
 * Cliente simplificado para operações MongoDB
 */

import { MongoClient, Db, Collection, ObjectId } from 'mongodb';
import { LambdaLogger } from './logger';
import { ConsolidacaoData } from './types';

export class MongoDBClient {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private logger: LambdaLogger;

  constructor() {
    this.logger = new LambdaLogger('MongoDBClient');
  }

  async connect(): Promise<void> {
    try {
      const mongoUri = process.env.MONGODB_URI;
      if (!mongoUri) {
        throw new Error('MONGODB_URI é obrigatório');
      }

      this.client = new MongoClient(mongoUri);
      await this.client.connect();
      
      const dbName = process.env.MONGODB_DATABASE || 'omie-integration';
      this.db = this.client.db(dbName);
      
      this.logger.log('Conectado ao MongoDB com sucesso');
    } catch (error) {
      this.logger.error('Erro ao conectar no MongoDB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.logger.log('Desconectado do MongoDB');
    }
  }

  private getCollection(name: string): Collection {
    if (!this.db) {
      throw new Error('MongoDB não conectado');
    }
    return this.db.collection(name);
  }

  // Operações de consolidação
  async salvarConsolidacao(dados: ConsolidacaoData): Promise<any> {
    try {
      const collection = this.getCollection('consolidacoes');
      
      // Verificar se já existe
      const existing = await collection.findOne({
        competencia: dados.competencia,
        empresaId: dados.empresaId,
        numeroProposta: dados.numeroProposta
      });

      if (existing) {
        this.logger.warn(`Consolidação já existe - Empresa: ${dados.empresaId}, Proposta: ${dados.numeroProposta}`);
        return existing;
      }

      const resultado = await collection.insertOne({
        ...dados,
        status: dados.status || 'ready_to_send',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      this.logger.log(`Consolidação salva - ID: ${resultado.insertedId}`);
      
      return {
        _id: resultado.insertedId,
        ...dados,
        status: dados.status || 'ready_to_send'
      };
    } catch (error) {
      this.logger.error('Erro ao salvar consolidação:', error);
      throw error;
    }
  }

  async atualizarStatusConsolidacao(
    id: string, 
    status: 'ready_to_send' | 'sent' | 'error',
    error?: string
  ): Promise<void> {
    try {
      const collection = this.getCollection('consolidacoes');
      
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            status,
            error,
            updatedAt: new Date()
          }
        }
      );

      this.logger.log(`Status da consolidação atualizado - ID: ${id}, Status: ${status}`);
    } catch (error) {
      this.logger.error('Erro ao atualizar status da consolidação:', error);
      throw error;
    }
  }

  async obterConsolidacoesParaEnviar(): Promise<ConsolidacaoData[]> {
    try {
      const collection = this.getCollection('consolidacoes');
      
      const resultados = await collection.find({
        status: 'ready_to_send'
      }).toArray();

      this.logger.log(`Encontradas ${resultados.length} consolidações para enviar`);
      
      return resultados.map(doc => ({
        _id: doc._id,
        competencia: doc.competencia,
        empresaId: doc.empresaId,
        numeroProposta: doc.numeroProposta,
        valorTotal: doc.valorTotal,
        produtos: doc.produtos,
        status: doc.status
      }));
    } catch (error) {
      this.logger.error('Erro ao obter consolidações:', error);
      throw error;
    }
  }

  // Operações de configuração de empresa
  async obterConfiguracaoEmpresa(empresaId: number): Promise<any> {
    try {
      const collection = this.getCollection('empresas');
      
      const config = await collection.findOne({ empresaId });
      
      if (config) {
        this.logger.log(`Configuração encontrada para empresa ${empresaId}`);
        return config;
      }

      // Fallback para configuração padrão
      this.logger.warn(`Empresa ${empresaId} não encontrada, usando fallback`);
      return {
        empresaId,
        codigoClienteOmie: 6488507558, // Código padrão
        configuracao: {
          tipoFaturamento: '01',
          vigenciaInicial: '01/01/2025',
          vigenciaFinal: '31/12/2025',
          diaFaturamento: 30
        }
      };
    } catch (error) {
      this.logger.error('Erro ao obter configuração da empresa:', error);
      throw error;
    }
  }
}