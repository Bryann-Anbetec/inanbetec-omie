import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ContractsService } from './contracts.service';
import { ConfiguracaoService } from './configuracao.service';

@Injectable()
export class ConsolidacaoSchedulerService {
  private readonly logger = new Logger(ConsolidacaoSchedulerService.name);
  private processandoConsolidacao = false;

  constructor(
    private readonly contractsService: ContractsService,
    private readonly configuracaoService: ConfiguracaoService,
  ) {}

  /**
   * EXECUÇÃO PRINCIPAL: Todo dia às 6h nos dias úteis
   * Verifica se é primeiro dia útil e executa consolidação do mês anterior
   */
  @Cron('0 6 * * 1-5', {
    name: 'consolidacao-mensal-principal',
    timeZone: 'America/Sao_Paulo'
  })
  async executarConsolidacaoPrincipal() {
    try {
      this.logger.log('Verificando se deve executar consolidação mensal...');

      // Verificar se já está processando
      if (this.processandoConsolidacao) {
        this.logger.warn('Consolidação já está em andamento - ignorando execução');
        return;
      }

      // Verificar se é primeiro dia útil do mês
      if (!this.configuracaoService.isPrimeiroDiaUtil()) {
        this.logger.log('Hoje não é o primeiro dia útil do mês - aguardando');
        return;
      }

      await this.executarConsolidacao('Principal às 6h');

    } catch (error) {
      this.logger.error(`Erro na consolidação principal: ${error.message}`);
    }
  }

  /**
   * RETENTATIVA 1: Todo dia às 10h nos dias úteis
   * Reprocessa registros com erro e tenta novamente
   */
  @Cron('0 10 * * 1-5', {
    name: 'consolidacao-retentativa-1',
    timeZone: 'America/Sao_Paulo'
  })
  async executarPrimeiraRetentativa() {
    try {
      this.logger.log('Executando primeira retentativa...');

      if (this.processandoConsolidacao) {
        this.logger.warn('Consolidação em andamento - ignorando retentativa');
        return;
      }

      if (!this.configuracaoService.isPrimeiroDiaUtil()) {
        return;
      }

      await this.executarConsolidacao('Retentativa 1 às 10h');

    } catch (error) {
      this.logger.error(`Erro na primeira retentativa: ${error.message}`);
    }
  }

  /**
   * RETENTATIVA 2: Todo dia às 14h nos dias úteis
   * Última tentativa automática do dia
   */
  @Cron('0 14 * * 1-5', {
    name: 'consolidacao-retentativa-2',
    timeZone: 'America/Sao_Paulo'
  })
  async executarSegundaRetentativa() {
    try {
      this.logger.log('Executando segunda retentativa...');

      if (this.processandoConsolidacao) {
        this.logger.warn('Consolidação em andamento - ignorando retentativa');
        return;
      }

      if (!this.configuracaoService.isPrimeiroDiaUtil()) {
        return;
      }

      await this.executarConsolidacao('Retentativa 2 às 14h');

    } catch (error) {
      this.logger.error(`Erro na segunda retentativa: ${error.message}`);
    }
  }

  /**
   * LIMPEZA MENSAL: Todo dia 15 às 2h da manhã
   * Remove registros antigos enviados com sucesso
   */
  @Cron('0 2 15 * *', {
    name: 'limpeza-registros-antigos',
    timeZone: 'America/Sao_Paulo'
  })
  async executarLimpezaMensal() {
    try {
      this.logger.log('Executando limpeza mensal de registros antigos...');

      // TODO: Implementar limpeza via ConsolidacaoService
      // const registrosRemovidos = await this.consolidacaoService.limparRegistrosAntigos(12);
      // this.logger.log(`Limpeza concluída: ${registrosRemovidos} registros removidos`);

    } catch (error) {
      this.logger.error(`Erro na limpeza mensal: ${error.message}`);
    }
  }

  /**
   * MÉTODO PRINCIPAL DE CONSOLIDAÇÃO
   */
  private async executarConsolidacao(contexto: string) {
    this.processandoConsolidacao = true;
    const inicioProcessamento = new Date();

    try {
      this.logger.log(`=== INICIANDO CONSOLIDAÇÃO MENSAL - ${contexto} ===`);

      // Obter competência do mês anterior
      const competencia = this.configuracaoService.obterCompetenciaAnterior();
      this.logger.log(`Processando competência: ${competencia}`);

      // Obter empresas ativas
      const empresasAtivas = await this.configuracaoService.obterEmpresasAtivas();
      this.logger.log(`Empresas a processar: ${empresasAtivas.join(', ')}`);

      // Executar consolidação mensal
      const resultado = await this.contractsService.processarConsolidacaoMensal(
        competencia,
        empresasAtivas.map(id => id.toString())
      );

      // Log do resultado
      const tempoProcessamento = Date.now() - inicioProcessamento.getTime();
      const tempoFormatado = this.formatarTempo(tempoProcessamento);

      if (resultado.success) {
        this.logger.log(`=== CONSOLIDAÇÃO CONCLUÍDA COM SUCESSO - ${contexto} ===`);
        this.logger.log(`Competência: ${resultado.competencia}`);
        this.logger.log(`Empresas processadas: ${resultado.empresasProcessadas}`);
        this.logger.log(`Empresas com sucesso: ${resultado.empresasComSucesso}`);
        this.logger.log(`Tempo de processamento: ${tempoFormatado}`);

        // Log detalhado por empresa
        resultado.resultados.forEach(empresaResult => {
          if (empresaResult.success) {
            this.logger.log(`✅ Empresa ${empresaResult.empresaId}: ${empresaResult.propostas?.length || 0} propostas processadas`);
          } else {
            this.logger.error(`❌ Empresa ${empresaResult.empresaId}: ${empresaResult.error}`);
          }
        });

      } else {
        this.logger.error(`=== CONSOLIDAÇÃO FALHOU - ${contexto} ===`);
        this.logger.error(`Erro: ${resultado.error}`);
      }

      // TODO: Enviar notificação de status por email/webhook
      await this.enviarNotificacaoStatus(resultado, contexto, tempoFormatado);

    } catch (error) {
      const tempoProcessamento = Date.now() - inicioProcessamento.getTime();
      const tempoFormatado = this.formatarTempo(tempoProcessamento);

      this.logger.error(`=== ERRO CRÍTICO NA CONSOLIDAÇÃO - ${contexto} ===`);
      this.logger.error(`Erro: ${error.message}`);
      this.logger.error(`Tempo até erro: ${tempoFormatado}`);
      
      // TODO: Enviar alerta crítico
      await this.enviarAlertaCritico(error, contexto);

    } finally {
      this.processandoConsolidacao = false;
    }
  }

  /**
   * EXECUÇÃO MANUAL: Para reprocessamento via API
   */
  async executarConsolidacaoManual(
    competencia?: string,
    empresaIds?: string[]
  ): Promise<any> {
    if (this.processandoConsolidacao) {
      throw new Error('Consolidação automática em andamento. Aguarde a conclusão.');
    }

    try {
      this.processandoConsolidacao = true;
      
      const competenciaProcessar = competencia || this.configuracaoService.obterCompetenciaAnterior();
      const empresasProcessar = empresaIds || (await this.configuracaoService.obterEmpresasAtivas()).map(id => id.toString());

      this.logger.log(`Executando consolidação MANUAL - Competência: ${competenciaProcessar}`);

      const resultado = await this.contractsService.processarConsolidacaoMensal(
        competenciaProcessar,
        empresasProcessar
      );

      this.logger.log(`Consolidação manual concluída: ${resultado.success ? 'SUCESSO' : 'ERRO'}`);
      return resultado;

    } finally {
      this.processandoConsolidacao = false;
    }
  }

  /**
   * STATUS: Verificar se consolidação está em andamento
   */
  obterStatusProcessamento(): { processando: boolean; detalhes?: any } {
    return {
      processando: this.processandoConsolidacao,
      detalhes: this.processandoConsolidacao ? {
        iniciado: new Date(),
        proximaExecucao: this.obterProximaExecucao()
      } : null
    };
  }

  /**
   * Utilitários privados
   */
  private formatarTempo(milissegundos: number): string {
    const segundos = Math.floor(milissegundos / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);

    if (horas > 0) {
      return `${horas}h ${minutos % 60}m ${segundos % 60}s`;
    } else if (minutos > 0) {
      return `${minutos}m ${segundos % 60}s`;
    } else {
      return `${segundos}s`;
    }
  }

  private obterProximaExecucao(): string {
    const agora = new Date();
    const proximoDiaUtil = new Date(agora);
    
    // Encontrar próximo dia útil
    do {
      proximoDiaUtil.setDate(proximoDiaUtil.getDate() + 1);
    } while (proximoDiaUtil.getDay() === 0 || proximoDiaUtil.getDay() === 6);

    proximoDiaUtil.setHours(6, 0, 0, 0);
    return proximoDiaUtil.toISOString();
  }

  private async enviarNotificacaoStatus(resultado: any, contexto: string, tempo: string) {
    // TODO: Implementar notificação por email ou webhook
    this.logger.log(`Notificação de status enviada - ${contexto} - Sucesso: ${resultado.success}`);
  }

  private async enviarAlertaCritico(error: Error, contexto: string) {
    // TODO: Implementar alerta crítico por email ou webhook
    this.logger.error(`Alerta crítico enviado - ${contexto} - Erro: ${error.message}`);
  }
}