import { NestFactory } from '@nestjs/core';
import { UploadModule } from './upload/upload.module';

async function bootstrap() {
  const app = await NestFactory.create(UploadModule);
  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
