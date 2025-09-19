import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ClientsController } from './clients.controller';
import { ClientSyncService } from './services/client-sync.service';
import { InanbetecService } from './services/inanbetec.service';
import { ContractsModule } from '../contracts/contracts.module';

@Module({
  imports: [
    HttpModule,
    ContractsModule, // Para usar o OmieService
  ],
  controllers: [ClientsController],
  providers: [
    ClientSyncService,
    InanbetecService,
  ],
  exports: [
    ClientSyncService,
    InanbetecService,
  ],
})
export class ClientsModule {}