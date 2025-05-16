import { Module } from '@nestjs/common';
import { CompressorController } from './compressor.controller';
import { CompressorService } from './compressor.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CompressionTask, CompressionTaskSchema } from './database/compression-task.schema';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/image-db'),
    MongooseModule.forFeature([{ name: CompressionTask.name, schema: CompressionTaskSchema }]),
  ],
  controllers: [CompressorController],
  providers: [CompressorService],
})
export class CompressorModule {}
