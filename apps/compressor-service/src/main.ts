import { NestFactory } from '@nestjs/core';
import { CompressorModule } from './compressor.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    CompressorModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'image-processing',
        queueOptions: {
          durable: true,
        }
      }
    }
  );
  
  await app.listen();
  console.log('image-compressor microservice is listening...');
}
bootstrap();
