import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { ResponseInterceptor } from './interceptors/response.interceptor';

@Module({
  imports: [HttpModule],
  providers: [
    LoggingInterceptor,
    ResponseInterceptor,
  ],
  exports: [
    HttpModule,
    LoggingInterceptor,
    ResponseInterceptor,
  ],
})
export class SharedModule {}