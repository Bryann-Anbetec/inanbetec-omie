import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './services/contracts.service';
import { VolumetriaService } from './services/volumetria.service';
import { OmieService } from './services/omie.service';
import { PropostasService } from './services/propostas.service';
import { ConsolidacaoService } from './services/consolidacao.service';
import { ConfiguracaoService } from './services/configuracao.service';
import { ConsolidacaoSchedulerService } from './services/consolidacao-scheduler.service';
import { VolumetriaConsolidada, VolumetriaConsolidadaSchema } from './schemas/volumetria-consolidada.schema';

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([{ name: VolumetriaConsolidada.name, schema: VolumetriaConsolidadaSchema }])
  ],
  controllers: [ContractsController],
  providers: [
    ContractsService,
    VolumetriaService,
    OmieService,
    PropostasService,
    ConsolidacaoService,
    ConfiguracaoService,
    ConsolidacaoSchedulerService,
  ],
  exports: [
    ContractsService,
    VolumetriaService,
    OmieService,
    PropostasService,
    ConsolidacaoService,
    ConfiguracaoService,
    ConsolidacaoSchedulerService,
  ],
})
export class ContractsModule {}