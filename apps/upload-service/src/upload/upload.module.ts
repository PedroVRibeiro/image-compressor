import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { RabbitMQModule } from '../rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RabbitMQModule,
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
