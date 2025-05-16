import { Module } from '@nestjs/common';
import { CompressorServiceController } from './compressor-service.controller';
import { CompressorServiceService } from './compressor-service.service';

@Module({
  imports: [],
  controllers: [CompressorServiceController],
  providers: [CompressorServiceService],
})
export class CompressorServiceModule {}
