import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Health check da aplicação',
    description: 'Endpoint para verificar se a aplicação está funcionando'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Aplicação funcionando corretamente'
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ 
    summary: 'Status detalhado da aplicação',
    description: 'Endpoint com informações detalhadas sobre o status da aplicação'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Status da aplicação com detalhes'
  })
  getHealth() {
    return this.appService.getHealth();
  }
}