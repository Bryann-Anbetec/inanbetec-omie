import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  ParseIntPipe,
  Logger 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery 
} from '@nestjs/swagger';
import { ContractsService } from './services/contracts.service';
import { 
  CreateContractFromVolumetriaDto, 
  CreateContractFromReportsDto, 
  ListContractsDto 
} from './dto/contract.dto';

@ApiTags('contratos')
@Controller('contratos')
export class ContractsController {
  private readonly logger = new Logger(ContractsController.name);

  constructor(private readonly contractsService: ContractsService) {}

  @Post('volumetria')
  @ApiOperation({ 
    summary: 'Criar contrato baseado em volumetria',
    description: 'Cria um contrato único no Omie baseado nos dados de volumetria da Inanbetec'
  })
  @ApiResponse({ status: 201, description: 'Contrato criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Erro na criação do contrato' })
  async createContractFromVolumetria(@Body() dto: CreateContractFromVolumetriaDto) {
    this.logger.log(`Criando contrato a partir da volumetria para empresa: ${dto.empresaId}`);
    return this.contractsService.createContractFromVolumetria(
      dto.empresaId,
      dto.dataInicial,
      dto.dataFinal,
      dto.dadosEmpresa
    );
  }

  @Post('relatorios')
  @ApiOperation({ 
    summary: 'Criar contratos baseados em relatórios por produto',
    description: 'Cria múltiplos contratos no Omie baseados nos relatórios agrupados por produto (cobrança, pixpay, outros)'
  })
  @ApiResponse({ status: 201, description: 'Contratos criados com sucesso' })
  @ApiResponse({ status: 400, description: 'Erro na criação dos contratos' })
  async createContractsFromReports(@Body() dto: CreateContractFromReportsDto) {
    this.logger.log(`Criando contratos a partir de relatórios para empresa: ${dto.empresaId}`);
    return this.contractsService.createContractsFromReports(
      dto.empresaId,
      dto.dataInicial,
      dto.dataFinal,
      dto.dadosEmpresa
    );
  }

  @Get()
  @ApiOperation({ 
    summary: 'Listar contratos',
    description: 'Lista contratos do Omie com paginação'
  })
  @ApiQuery({ name: 'pagina', required: false, description: 'Número da página' })
  @ApiQuery({ name: 'registros_por_pagina', required: false, description: 'Registros por página' })
  @ApiQuery({ name: 'apenas_importado_api', required: false, description: 'Apenas contratos via API' })
  @ApiResponse({ status: 200, description: 'Lista de contratos retornada com sucesso' })
  async listContracts(@Query() query: ListContractsDto) {
    this.logger.log(`Listando contratos - Página: ${query.pagina}`);
    return this.contractsService.listContracts(query);
  }

  @Get('volumetria/:empresaId')
  @ApiOperation({ 
    summary: 'Consultar dados de volumetria',
    description: 'Consulta dados de volumetria para análise sem criar contrato'
  })
  @ApiParam({ name: 'empresaId', description: 'ID da empresa' })
  @ApiQuery({ name: 'dataInicial', required: true, description: 'Data inicial' })
  @ApiQuery({ name: 'dataFinal', required: true, description: 'Data final' })
  @ApiResponse({ status: 200, description: 'Dados de volumetria retornados com sucesso' })
  async getVolumetriaData(
    @Param('empresaId') empresaId: string,
    @Query('dataInicial') dataInicial: string,
    @Query('dataFinal') dataFinal: string
  ) {
    this.logger.log(`Consultando volumetria para empresa: ${empresaId}`);
    return this.contractsService.getVolumetriaData(empresaId, dataInicial, dataFinal);
  }

  @Get('relatorios/:empresaId')
  @ApiOperation({ 
    summary: 'Consultar dados de relatórios agrupados',
    description: 'Consulta relatórios agrupados por produto para análise sem criar contratos'
  })
  @ApiParam({ name: 'empresaId', description: 'ID da empresa' })
  @ApiQuery({ name: 'dataInicial', required: true, description: 'Data inicial' })
  @ApiQuery({ name: 'dataFinal', required: true, description: 'Data final' })
  @ApiResponse({ status: 200, description: 'Dados de relatórios retornados com sucesso' })
  async getReportsData(
    @Param('empresaId') empresaId: string,
    @Query('dataInicial') dataInicial: string,
    @Query('dataFinal') dataFinal: string
  ) {
    this.logger.log(`Consultando relatórios para empresa: ${empresaId}`);
    return this.contractsService.getReportsData(empresaId, dataInicial, dataFinal);
  }

  @Get(':id')
  @ApiOperation({ 
    summary: 'Buscar contrato por ID',
    description: 'Busca um contrato específico no Omie'
  })
  @ApiParam({ name: 'id', description: 'ID do contrato' })
  @ApiResponse({ status: 200, description: 'Contrato encontrado' })
  @ApiResponse({ status: 404, description: 'Contrato não encontrado' })
  async getContract(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Buscando contrato: ${id}`);
    return this.contractsService.getContract({ nCodCtr: id });
  }

  @Put(':id')
  @ApiOperation({ 
    summary: 'Atualizar contrato',
    description: 'Atualiza um contrato existente no Omie'
  })
  @ApiParam({ name: 'id', description: 'ID do contrato' })
  @ApiResponse({ status: 200, description: 'Contrato atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Erro na atualização do contrato' })
  async updateContract(
    @Param('id', ParseIntPipe) id: number,
    @Body() contractData: any
  ) {
    this.logger.log(`Atualizando contrato: ${id}`);
    return this.contractsService.updateContract({
      ...contractData,
      cabecalho: {
        ...contractData.cabecalho,
        nCodCtr: id
      }
    });
  }

  @Delete(':contractId/itens/:itemId')
  @ApiOperation({ 
    summary: 'Excluir item do contrato',
    description: 'Remove um item específico de um contrato'
  })
  @ApiParam({ name: 'contractId', description: 'ID do contrato' })
  @ApiParam({ name: 'itemId', description: 'ID do item' })
  @ApiResponse({ status: 200, description: 'Item excluído com sucesso' })
  @ApiResponse({ status: 400, description: 'Erro na exclusão do item' })
  async deleteContractItem(
    @Param('contractId', ParseIntPipe) contractId: number,
    @Param('itemId', ParseIntPipe) itemId: number
  ) {
    this.logger.log(`Excluindo item ${itemId} do contrato ${contractId}`);
    return this.contractsService.deleteContractItem(
      { nCodCtr: contractId },
      [{ codItem: itemId }]
    );
  }
}