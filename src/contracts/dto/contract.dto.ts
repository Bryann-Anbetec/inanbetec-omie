import { IsString, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContractFromVolumetriaDto {
  @ApiProperty({
    description: 'ID da empresa',
    example: '123456'
  })
  @IsString()
  empresaId: string;

  @ApiProperty({
    description: 'Data inicial para consulta',
    example: '2025-01-01'
  })
  @IsDateString()
  dataInicial: string;

  @ApiProperty({
    description: 'Data final para consulta',
    example: '2025-12-31'
  })
  @IsDateString()
  dataFinal: string;

  @ApiPropertyOptional({
    description: 'Dados adicionais da empresa'
  })
  @IsOptional()
  dadosEmpresa?: {
    diaFaturamento?: number;
    cidade?: string;
    categoria?: string;
    centroCusto?: number;
    projeto?: number;
    vendedor?: number;
    diasVencimento?: number;
  };
}

export class CreateContractFromReportsDto {
  @ApiProperty({
    description: 'ID da empresa',
    example: '123456'
  })
  @IsString()
  empresaId: string;

  @ApiProperty({
    description: 'Data inicial para consulta',
    example: '2025-01-01'
  })
  @IsDateString()
  dataInicial: string;

  @ApiProperty({
    description: 'Data final para consulta',
    example: '2025-12-31'
  })
  @IsDateString()
  dataFinal: string;

  @ApiPropertyOptional({
    description: 'Dados adicionais da empresa'
  })
  @IsOptional()
  dadosEmpresa?: {
    diaFaturamento?: number;
    cidade?: string;
    categoria?: string;
    centroCusto?: number;
    projeto?: number;
    vendedor?: number;
    diasVencimento?: number;
  };
}

export class ListContractsDto {
  @ApiPropertyOptional({
    description: 'Número da página',
    example: 1,
    default: 1
  })
  @IsOptional()
  pagina?: number = 1;

  @ApiPropertyOptional({
    description: 'Registros por página',
    example: 50,
    default: 50
  })
  @IsOptional()
  registros_por_pagina?: number = 50;

  @ApiPropertyOptional({
    description: 'Apenas contratos importados via API',
    example: 'N',
    default: 'N'
  })
  @IsOptional()
  apenas_importado_api?: string = 'N';
}