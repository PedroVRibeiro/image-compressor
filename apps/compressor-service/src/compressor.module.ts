import { Module } from '@nestjs/common';
import { CompressorController } from './compressor.controller';
import { CompressorService } from './compressor.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CompressionTask,
  CompressionTaskSchema,
} from './database/compression-task.schema';
import { RabbitMQConsumer } from './rabbitmq/rabbitmq-consumer.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri:
          config.get<string>('MONGO_URL') ||
          'mongodb://localhost:27017/image-db',
      }),
    }),
    MongooseModule.forFeature([
      { name: CompressionTask.name, schema: CompressionTaskSchema },
    ]),
  ],
  controllers: [CompressorController],
  providers: [CompressorService, RabbitMQConsumer],
})
export class CompressorModule {}
