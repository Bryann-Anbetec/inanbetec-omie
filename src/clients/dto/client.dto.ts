import { IsString, IsOptional, IsEmail, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({
    description: 'CNPJ/CPF do cliente',
    example: '12.345.678/0001-90'
  })
  @IsString()
  @Length(11, 18)
  documento: string;

  @ApiProperty({
    description: 'Nome/Razão social do cliente',
    example: 'Empresa Exemplo Ltda'
  })
  @IsString()
  nome: string;

  @ApiPropertyOptional({
    description: 'Nome fantasia',
    example: 'Empresa Exemplo'
  })
  @IsOptional()
  @IsString()
  nomeFantasia?: string;

  @ApiPropertyOptional({
    description: 'Email do cliente',
    example: 'contato@empresa.com'
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Telefone do cliente',
    example: '(11) 99999-9999'
  })
  @IsOptional()
  @IsString()
  telefone?: string;

  @ApiPropertyOptional({
    description: 'Endereço completo'
  })
  @IsOptional()
  endereco?: {
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
  };
}

export class SyncClientDto {
  @ApiProperty({
    description: 'CNPJ/CPF do cliente para sincronização',
    example: '12.345.678/0001-90'
  })
  @IsString()
  documento: string;

  @ApiPropertyOptional({
    description: 'Plataforma de origem (inanbetec ou omie)',
    example: 'inanbetec'
  })
  @IsOptional()
  @IsString()
  origem?: 'inanbetec' | 'omie';
}

export class ClientWebhookDto {
  @ApiProperty({
    description: 'Tipo de evento (created, updated, deleted)',
    example: 'created'
  })
  @IsString()
  evento: 'created' | 'updated' | 'deleted';

  @ApiProperty({
    description: 'Dados do cliente'
  })
  cliente: any;

  @ApiProperty({
    description: 'Plataforma de origem',
    example: 'inanbetec'
  })
  @IsString()
  origem: 'inanbetec' | 'omie';

  @ApiPropertyOptional({
    description: 'Timestamp do evento'
  })
  @IsOptional()
  timestamp?: string;
}