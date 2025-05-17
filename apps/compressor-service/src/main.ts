import { NestFactory } from '@nestjs/core';
import { CompressorModule } from './compressor.module';

async function bootstrap() {
  const app = await NestFactory.create(CompressorModule);

  const port = process.env.PORT || 3002;
  await app.listen(port);
  console.log(`image-compressor microservice is listening on port ${port}`);
}
bootstrap();
