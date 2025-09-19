import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query,
  Logger 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery 
} from '@nestjs/swagger';
import { ClientSyncService } from './services/client-sync.service';
import { InanbetecService } from './services/inanbetec.service';
import { 
  CreateClientDto, 
  SyncClientDto, 
  ClientWebhookDto 
} from './dto/client.dto';

@ApiTags('clientes')
@Controller('clientes')
export class ClientsController {
  private readonly logger = new Logger(ClientsController.name);

  constructor(
    private readonly clientSyncService: ClientSyncService,
    private readonly inanbetecService: InanbetecService,
  ) {}

  @Post('sincronizar')
  @ApiOperation({ 
    summary: 'Sincronizar cliente por CNPJ',
    description: 'Sincroniza um cliente entre Inanbetec e Omie baseado no CNPJ. Se o cliente existir apenas em uma plataforma, será criado na outra.'
  })
  @ApiResponse({ status: 201, description: 'Cliente sincronizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Erro na sincronização' })
  async sincronizarCliente(@Body() dto: SyncClientDto) {
    this.logger.log(`Sincronizando cliente CNPJ: ${dto.documento}`);
    return this.clientSyncService.sincronizarClientePorCNPJ(dto.documento, dto.origem);
  }

  @Post('webhook/inanbetec')
  @ApiOperation({ 
    summary: 'Webhook para eventos de cliente da Inanbetec',
    description: 'Recebe webhooks da Inanbetec quando um cliente é criado, atualizado ou excluído'
  })
  @ApiResponse({ status: 200, description: 'Webhook processado com sucesso' })
  async webhookInanbetec(@Body() dto: ClientWebhookDto) {
    this.logger.log(`Webhook Inanbetec recebido - Evento: ${dto.evento}`);
    return this.clientSyncService.processarWebhookCliente(
      dto.evento,
      dto.cliente,
      'inanbetec'
    );
  }

  @Post('webhook/omie')
  @ApiOperation({ 
    summary: 'Webhook para eventos de cliente do Omie',
    description: 'Recebe webhooks do Omie quando um cliente é criado, atualizado ou excluído'
  })
  @ApiResponse({ status: 200, description: 'Webhook processado com sucesso' })
  async webhookOmie(@Body() dto: ClientWebhookDto) {
    this.logger.log(`Webhook Omie recebido - Evento: ${dto.evento}`);
    return this.clientSyncService.processarWebhookCliente(
      dto.evento,
      dto.cliente,
      'omie'
    );
  }

  @Get('buscar/:cnpj')
  @ApiOperation({ 
    summary: 'Buscar cliente por CNPJ em ambas as plataformas',
    description: 'Busca um cliente por CNPJ tanto na Inanbetec quanto no Omie'
  })
  @ApiParam({ name: 'cnpj', description: 'CNPJ do cliente' })
  @ApiResponse({ status: 200, description: 'Dados do cliente retornados' })
  async buscarCliente(@Param('cnpj') cnpj: string) {
    this.logger.log(`Buscando cliente CNPJ: ${cnpj}`);
    
    try {
      const [clienteInanbetec, clienteOmie] = await Promise.allSettled([
        this.inanbetecService.buscarClientePorCNPJ(cnpj),
        this.clientSyncService.buscarClienteOmiePorCNPJ(cnpj)
      ]);

      return {
        cnpj,
        inanbetec: {
          encontrado: clienteInanbetec.status === 'fulfilled' && clienteInanbetec.value,
          dados: clienteInanbetec.status === 'fulfilled' ? clienteInanbetec.value : null,
          erro: clienteInanbetec.status === 'rejected' ? clienteInanbetec.reason.message : null
        },
        omie: {
          encontrado: clienteOmie.status === 'fulfilled' && clienteOmie.value,
          dados: clienteOmie.status === 'fulfilled' ? clienteOmie.value : null,
          erro: clienteOmie.status === 'rejected' ? clienteOmie.reason.message : null
        }
      };
    } catch (error) {
      this.logger.error(`Erro ao buscar cliente: ${error.message}`);
      throw error;
    }
  }

  @Get('inanbetec')
  @ApiOperation({ 
    summary: 'Listar clientes da Inanbetec',
    description: 'Lista clientes cadastrados na Inanbetec'
  })
  @ApiQuery({ name: 'pagina', required: false, description: 'Número da página' })
  @ApiQuery({ name: 'limite', required: false, description: 'Registros por página' })
  @ApiResponse({ status: 200, description: 'Lista de clientes da Inanbetec' })
  async listarClientesInanbetec(
    @Query('pagina') pagina?: number,
    @Query('limite') limite?: number
  ) {
    this.logger.log('Listando clientes da Inanbetec');
    return this.inanbetecService.listarClientes({
      pagina: pagina || 1,
      limite: limite || 50
    });
  }

  @Post('sincronizacao-manual')
  @ApiOperation({ 
    summary: 'Executar sincronização manual',
    description: 'Executa uma sincronização manual de todos os clientes modificados recentemente'
  })
  @ApiResponse({ status: 200, description: 'Sincronização executada com sucesso' })
  async sincronizacaoManual() {
    this.logger.log('Executando sincronização manual de clientes');
    return this.clientSyncService.sincronizacaoAutomatica();
  }

  @Get('status-sincronizacao')
  @ApiOperation({ 
    summary: 'Status da sincronização de clientes',
    description: 'Retorna informações sobre o status da sincronização automática'
  })
  @ApiResponse({ status: 200, description: 'Status da sincronização' })
  async statusSincronizacao() {
    return {
      sincronizacaoAutomatica: 'ativa',
      proximaExecucao: 'a cada hora',
      ultimaExecucao: new Date().toISOString(),
      status: 'funcionando',
      webhooks: {
        inanbetec: '/clientes/webhook/inanbetec',
        omie: '/clientes/webhook/omie'
      }
    };
  }
}