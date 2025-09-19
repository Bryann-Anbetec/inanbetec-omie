import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsController } from './clients.controller';
import { ClientSyncService } from './services/client-sync.service';
import { InanbetecService } from './services/inanbetec-mongo.service';
import { ContractsModule } from '../contracts/contracts.module';
import { EmpresaInanbetec, EmpresaInanbetecSchema } from './schemas/empresa-inanbetec.schema';

@Module({
  imports: [
    HttpModule,
    ContractsModule, // Para usar o OmieService
    MongooseModule.forFeature([
      { name: EmpresaInanbetec.name, schema: EmpresaInanbetecSchema }
    ]),
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