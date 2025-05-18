import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
import { ImageTaskPayload } from 'libs/shared/interfaces/image-task-payload.interface';

@Injectable()
export class UploadService {
  constructor(private readonly rabbitMQService: RabbitMQService) {}

  public upload(file: Express.Multer.File): string {
    const taskId = uuidv4();

    const payload: ImageTaskPayload = {
      taskId,
      fileName: file.originalname,
      mimetype: file.mimetype,
      buffer: Array.from(file.buffer),
      status: 'PENDING',
    };

    this.rabbitMQService.publishToQueue(payload);

    return taskId;
  }
}
