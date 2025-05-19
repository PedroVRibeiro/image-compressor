import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { UploadService } from './upload.service';
import { uploadConfig } from '../config/upload';
import { UploadResponse } from '../interfaces/upload';
import { validateImageFile } from '../utils/validateImageFile';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', uploadConfig))
  public async upload(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponse> {
    await validateImageFile(file);

    const result = this.uploadService.upload(file);

    return {
      message: 'Request sent',
      taskId: result,
      status: 'PENDING',
    };
  }
}
