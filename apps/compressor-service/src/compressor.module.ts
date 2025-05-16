import { Module } from '@nestjs/common';
import { CompressorController } from './compressor.controller';
import { CompressorService } from './compressor.service';

@Module({
  imports: [],
  controllers: [CompressorController],
  providers: [CompressorService],
})
export class CompressorModule {}
