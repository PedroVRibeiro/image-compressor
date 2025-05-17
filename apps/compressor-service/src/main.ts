import { NestFactory } from '@nestjs/core';
import { CompressorModule } from './compressor.module';

async function bootstrap() {
  const app = await NestFactory.create(CompressorModule);

  await app.listen(3002);
  console.log('image-compressor microservice is listening...');
}
bootstrap();
