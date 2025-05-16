import {
  Controller,
  NotFoundException,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UploadService } from './upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import uploadConfig from '../../config/upload';
import { UploadResponse } from '../interfaces/upload';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', uploadConfig))
  public async upload(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponse> {
    if (!file) {
      throw new NotFoundException('File Not Found');
    }

    const result = await this.uploadService.upload(file);

    return {
      message: 'Request sent',
      taskId: result,
      status: 'PENDING',
    };
  }
}
