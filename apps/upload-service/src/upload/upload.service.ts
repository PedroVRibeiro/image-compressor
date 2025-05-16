import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  constructor(@Inject('IMAGE_QUEUE') private readonly client: ClientProxy) {}

  public async upload(file: Express.Multer.File): Promise<string> {
    const taskId = uuidv4();

    const payload = {
      taskId,
      originalName: file.originalname,
      filename: file.filename,
      mimetype: file.mimetype,
      path: file.path,
      status: 'PENDING',
    };

    await lastValueFrom(this.client.emit('image.uploaded', payload));

    return taskId;
  }
}
