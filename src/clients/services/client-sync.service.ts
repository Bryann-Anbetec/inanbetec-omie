import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InanbetecService } from './inanbetec.service';
import { OmieService } from '../../contracts/services/omie.service';

@Injectable()
export class ClientSyncService {
  private readonly logger = new Logger(ClientSyncService.name);

  constructor(
    private readonly inanbetecService: InanbetecService,
    private readonly omieService: OmieService,
  ) {}

  async sincronizarClientePorCNPJ(cnpj: string, origem?: 'inanbetec' | 'omie') {
    try {
      this.logger.log(`Iniciando sincronização do cliente CNPJ: ${cnpj} - Origem: ${origem || 'auto'}`);
      
      const cnpjLimpo = this.limparDocumento(cnpj);
      
      // Buscar cliente em ambas as plataformas
      const [clienteInanbetec, clienteOmie] = await Promise.allSettled([
        this.inanbetecService.buscarClientePorCNPJ(cnpjLimpo),
        this.buscarClienteOmiePorCNPJ(cnpjLimpo)
      ]);

      const dadosInanbetec = clienteInanbetec.status === 'fulfilled' ? clienteInanbetec.value : null;
      const dadosOmie = clienteOmie.status === 'fulfilled' ? clienteOmie.value : null;

      let resultado = {
        cnpj: cnpjLimpo,
        sincronizado: false,
        acoes: [] as string[],
        detalhes: {}
      };

      // Cenário 1: Cliente existe apenas na Inanbetec
      if (dadosInanbetec && !dadosOmie) {
        this.logger.log('Cliente existe apenas na Inanbetec - Criando no Omie');
        const clienteOmieFormat = this.inanbetecService.mapearParaOmie(dadosInanbetec);
        const novoClienteOmie = await this.omieService.incluirCliente(clienteOmieFormat);
        
        resultado.acoes.push('criado_no_omie');
        resultado.detalhes = { 
          inanbetec: dadosInanbetec, 
          omie: novoClienteOmie,
          acao: 'cliente_criado_no_omie'
        };
        resultado.sincronizado = true;
      }
      // Cenário 2: Cliente existe apenas no Omie
      else if (!dadosInanbetec && dadosOmie) {
        this.logger.log('Cliente existe apenas no Omie - Criando na Inanbetec');
        const novoClienteInanbetec = await this.inanbetecService.criarCliente(dadosOmie);
        
        resultado.acoes.push('criado_na_inanbetec');
        resultado.detalhes = { 
          omie: dadosOmie, 
          inanbetec: novoClienteInanbetec,
          acao: 'cliente_criado_na_inanbetec'
        };
        resultado.sincronizado = true;
      }
      // Cenário 3: Cliente existe em ambas as plataformas
      else if (dadosInanbetec && dadosOmie) {
        this.logger.log('Cliente existe em ambas as plataformas - Verificando necessidade de atualização');
        
        // Determinar qual é mais recente baseado na origem ou data de modificação
        if (origem === 'inanbetec' || this.clienteInanbetecMaisRecente(dadosInanbetec, dadosOmie)) {
          // Atualizar Omie com dados da Inanbetec
          const clienteOmieAtualizado = this.inanbetecService.mapearParaOmie(dadosInanbetec);
          (clienteOmieAtualizado as any).codigo_cliente_omie = dadosOmie.codigo_cliente_omie;
          
          await this.omieService.alterarCliente(clienteOmieAtualizado);
          resultado.acoes.push('atualizado_no_omie');
          resultado.detalhes = {
            origem: 'inanbetec',
            atualizado: 'omie',
            dados: clienteOmieAtualizado
          };
        } else {
          // Atualizar Inanbetec com dados do Omie
          await this.inanbetecService.atualizarCliente(dadosInanbetec.id, dadosOmie);
          resultado.acoes.push('atualizado_na_inanbetec');
          resultado.detalhes = {
            origem: 'omie',
            atualizado: 'inanbetec',
            dados: dadosOmie
          };
        }
        resultado.sincronizado = true;
      }
      // Cenário 4: Cliente não existe em nenhuma plataforma
      else {
        this.logger.warn(`Cliente com CNPJ ${cnpjLimpo} não encontrado em nenhuma plataforma`);
        resultado.acoes.push('nao_encontrado');
        resultado.detalhes = { erro: 'Cliente não encontrado em nenhuma plataforma' };
      }

      this.logger.log(`Sincronização concluída para CNPJ ${cnpjLimpo}: ${JSON.stringify(resultado)}`);
      return resultado;

    } catch (error) {
      this.logger.error(`Erro na sincronização do cliente CNPJ ${cnpj}: ${error.message}`);
      throw error;
    }
  }

  async processarWebhookCliente(evento: string, clienteData: any, origem: 'inanbetec' | 'omie') {
    try {
      this.logger.log(`Processando webhook de cliente - Evento: ${evento}, Origem: ${origem}`);
      
      const cnpj = clienteData.cnpj_cpf || clienteData.documento;
      if (!cnpj) {
        throw new Error('CNPJ/CPF não encontrado nos dados do cliente');
      }

      switch (evento) {
        case 'created':
        case 'updated':
          return await this.sincronizarClientePorCNPJ(cnpj, origem);
        
        case 'deleted':
          this.logger.log(`Cliente deletado na ${origem} - CNPJ: ${cnpj}`);
          // Aqui você pode implementar a lógica de marcação ou exclusão
          return {
            cnpj: this.limparDocumento(cnpj),
            sincronizado: true,
            acoes: [`marcado_como_deletado_${origem}`],
            detalhes: { evento: 'deleted', origem }
          };
        
        default:
          throw new Error(`Evento não suportado: ${evento}`);
      }
    } catch (error) {
      this.logger.error(`Erro no processamento do webhook: ${error.message}`);
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async sincronizacaoAutomatica() {
    try {
      this.logger.log('Iniciando sincronização automática de clientes');
      
      // Buscar clientes modificados recentemente em ambas as plataformas
      const dataLimite = new Date();
      dataLimite.setHours(dataLimite.getHours() - 1); // Última hora
      
      // Buscar clientes modificados na Inanbetec
      const clientesInanbetec = await this.inanbetecService.listarClientes({
        modificado_apos: dataLimite.toISOString()
      });

      // Buscar clientes modificados no Omie
      const clientesOmie = await this.omieService.listarClientes({
        pagina: 1,
        registros_por_pagina: 100,
        apenas_importado_api: 'N'
      });

      const resultados = [];

      // Sincronizar clientes da Inanbetec
      for (const cliente of clientesInanbetec || []) {
        try {
          const resultado = await this.sincronizarClientePorCNPJ(cliente.documento, 'inanbetec');
          resultados.push(resultado);
        } catch (error) {
          this.logger.error(`Erro ao sincronizar cliente Inanbetec ${cliente.documento}: ${error.message}`);
        }
      }

      // Sincronizar clientes do Omie (apenas os modificados recentemente)
      for (const cliente of clientesOmie?.clientes_cadastro || []) {
        try {
          // Verificar se foi modificado recentemente (você pode adicionar essa lógica)
          const resultado = await this.sincronizarClientePorCNPJ(cliente.cnpj_cpf, 'omie');
          resultados.push(resultado);
        } catch (error) {
          this.logger.error(`Erro ao sincronizar cliente Omie ${cliente.cnpj_cpf}: ${error.message}`);
        }
      }

      this.logger.log(`Sincronização automática concluída: ${resultados.length} clientes processados`);
      return resultados;

    } catch (error) {
      this.logger.error(`Erro na sincronização automática: ${error.message}`);
    }
  }

  async buscarClienteOmiePorCNPJ(cnpj: string) {
    try {
      const clientes = await this.omieService.listarClientes({
        pagina: 1,
        registros_por_pagina: 1,
        clientesFiltro: {
          cnpj_cpf: this.limparDocumento(cnpj)
        }
      });

      if (clientes?.clientes_cadastro && clientes.clientes_cadastro.length > 0) {
        return clientes.clientes_cadastro[0];
      }

      return null;
    } catch (error) {
      this.logger.error(`Erro ao buscar cliente no Omie por CNPJ: ${error.message}`);
      return null;
    }
  }

  private clienteInanbetecMaisRecente(clienteInanbetec: any, clienteOmie: any): boolean {
    // Implementar lógica para determinar qual cliente é mais recente
    // Por padrão, assumir que Inanbetec é mais recente se não houver timestamp
    const dataInanbetec = clienteInanbetec.updated_at || clienteInanbetec.created_at;
    const dataOmie = clienteOmie.info?.dAlt || clienteOmie.info?.dInc;

    if (!dataInanbetec || !dataOmie) {
      return true; // Preferir Inanbetec se não houver data
    }

    return new Date(dataInanbetec) > new Date(dataOmie);
  }

  private limparDocumento(documento: string): string {
    if (!documento) return '';
    return documento.replace(/[^\d]/g, '');
  }
}