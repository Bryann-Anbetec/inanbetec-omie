import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './services/contracts.service';
import { VolumetriaService } from './services/volumetria.service';
import { OmieService } from './services/omie.service';

@Module({
  imports: [HttpModule],
  controllers: [ContractsController],
  providers: [
    ContractsService,
    VolumetriaService,
    OmieService,
  ],
  exports: [
    ContractsService,
    VolumetriaService,
    OmieService,
  ],
})
export class ContractsModule {}