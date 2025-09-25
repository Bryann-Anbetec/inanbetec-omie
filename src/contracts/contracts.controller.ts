import { 
  Controller, 
  Post, 
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
// DTOs removidos após limpeza do código

@ApiTags('contratos')
@Controller('contratos')
export class ContractsController {
  private readonly logger = new Logger(ContractsController.name);

  constructor(private readonly contractsService: ContractsService) {}

  @Post('teste/:empresaId/:competencia')
  @ApiOperation({ 
    summary: 'TESTE: Criar contrato sem salvar no banco',
    description: 'Testa a criação de contrato agrupando volumetria por produto e separando por proposta, SEM PERSISTIR dados'
  })
  @ApiParam({ name: 'empresaId', description: 'ID da empresa' })
  @ApiParam({ name: 'competencia', description: 'Competência no formato YYYY-MM (ex: 2025-08)' })
  @ApiQuery({ name: 'enviarOmie', required: false, description: 'Se true, envia para Omie; se false, apenas simula' })
  @ApiResponse({ status: 200, description: 'Teste executado com sucesso' })
  async testarCriacaoContrato(
    @Param('empresaId', ParseIntPipe) empresaId: number,
    @Param('competencia') competencia: string,
    @Query('enviarOmie') enviarOmie?: string
  ) {
    this.logger.log(`🧪 Teste de criação de contrato - Empresa: ${empresaId}, Competência: ${competencia}`);
    
    const enviarParaOmie = enviarOmie === 'true';
    
    return this.contractsService.testarCriacaoContrato(
      empresaId,
      competencia,
      enviarParaOmie
    );
  }













  // ==========================================================
  // NOVOS ENDPOINTS - SISTEMA DE CONSOLIDAÇÃO MENSAL
  // ==========================================================

  @Post('consolidacao/processar')
  @ApiOperation({ 
    summary: 'Processar consolidação mensal por proposta comercial',
    description: 'Executa o processo de consolidação mensal agrupando por número de proposta comercial (FLUXO CORRETO)' 
  })
  @ApiResponse({ status: 201, description: 'Consolidação processada com sucesso' })
  @ApiResponse({ status: 400, description: 'Erro no processamento da consolidação' })
  async processarConsolidacaoMensal(
    @Body() dto: { 
      competencia: string; // YYYY-MM (ex: 2025-01)
      empresaIds?: string[]; // Se não informado, processa todas
    }
  ) {
    this.logger.log(`=== PROCESSAMENTO CONSOLIDAÇÃO MENSAL ===`);
    this.logger.log(`Competência: ${dto.competencia}`);
    this.logger.log(`Empresas: ${dto.empresaIds ? dto.empresaIds.join(',') : 'TODAS'}`);
    
    return this.contractsService.processarConsolidacaoMensal(
      dto.competencia, 
      dto.empresaIds
    );
  }

  @Post('consolidacao/manual/:empresaId')
  @ApiOperation({ 
    summary: 'Processar consolidação manual para uma empresa',
    description: 'Executa consolidação para uma empresa específica (modo manual)' 
  })
  @ApiParam({ name: 'empresaId', description: 'ID da empresa' })
  async processarConsolidacaoManual(
    @Param('empresaId') empresaId: string,
    @Body() dto: { 
      competencia: string; // YYYY-MM
    }
  ) {
    this.logger.log(`Consolidação manual - Empresa: ${empresaId}, Competência: ${dto.competencia}`);
    
    return this.contractsService.processarConsolidacaoMensal(
      dto.competencia, 
      [empresaId]
    );
  }
}