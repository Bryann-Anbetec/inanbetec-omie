import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return health check', () => {
      expect(appController.getHello()).toEqual(
        expect.objectContaining({
          status: 'OK',
          timestamp: expect.any(String),
          service: 'Inanbetec-Omie Integration API',
        })
      );
    });
  });

  describe('health', () => {
    it('should return detailed health information', () => {
      const health = appController.getHealth();
      expect(health).toEqual(
        expect.objectContaining({
          status: 'OK',
          timestamp: expect.any(String),
          service: 'Inanbetec-Omie Integration API',
          version: expect.any(String),
          environment: expect.any(String),
          uptime: expect.any(Number),
        })
      );
    });
  });
});