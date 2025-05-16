import { NestFactory } from '@nestjs/core';
import { CompressorModule } from './compressor.module';

async function bootstrap() {
  const app = await NestFactory.create(CompressorModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
