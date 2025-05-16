import { NestFactory } from '@nestjs/core';
import { CompressorServiceModule } from './compressor-service.module';

async function bootstrap() {
  const app = await NestFactory.create(CompressorServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
