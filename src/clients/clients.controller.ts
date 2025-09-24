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
import { InanbetecService } from './services/inanbetec-mongo.service';
// DTOs de sincronização removidos - apenas consulta ativa

@ApiTags('clientes')
@Controller('clientes')
export class ClientsController {
  private readonly logger = new Logger(ClientsController.name);

  constructor(
    private readonly clientSyncService: ClientSyncService,
    private readonly inanbetecService: InanbetecService,
  ) {}

  // SINCRONIZAÇÃO DESABILITADA - Para evitar problemas com base de dados
  // Use apenas consulta por CNPJ

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

  @Get('status-sistema')
  @ApiOperation({ 
    summary: 'Status do sistema de clientes',
    description: 'Retorna informações sobre o estado atual do sistema de clientes'
  })
  @ApiResponse({ status: 200, description: 'Status do sistema' })
  async statusSistema() {
    return {
      sincronizacaoAutomatica: 'DESABILITADA',
      motivo: 'Sistema em modo somente leitura por segurança',
      operacoesPermitidas: [
        'Busca de clientes por CNPJ',
        'Listagem de clientes Inanbetec'
      ],
      operacoesDesabilitadas: [
        'Sincronização manual',
        'Webhooks de modificação',
        'Criação de novos clientes',
        'Atualização de dados'
      ],
      dataDesabilitacao: '2024-12-19',
      status: 'MODO SEGURO ATIVO'
    };
  }
}