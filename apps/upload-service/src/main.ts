import { NestFactory } from '@nestjs/core';
import { UploadModule } from './upload/upload.module';

async function bootstrap() {
  const app = await NestFactory.create(UploadModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
