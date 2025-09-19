import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Inanbetec-Omie Integration API v1.0 - Sistema funcionando! 🚀';
  }

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'inanbetec-omie-integration',
      version: '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
      features: [
        'contract-management',
        'client-synchronization',
        'volumetria-reports',
        'omie-integration'
      ]
    };
  }
}