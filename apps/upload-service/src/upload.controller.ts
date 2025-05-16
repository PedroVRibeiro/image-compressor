import { Controller, Get } from '@nestjs/common';
import { UploadService } from './upload.service';

@Controller()
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Get()
  getHello(): string {
    return this.uploadService.getHello();
  }
}
