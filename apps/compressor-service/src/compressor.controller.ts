import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ImageTaskPayload } from 'libs/shared/interfaces/image-task-payload.interface';

import { CompressorService } from './compressor.service';

@Controller()
export class CompressorController {
  constructor(private readonly compressorService: CompressorService) {}

  @EventPattern('image.uploaded')
  async handleImage(@Payload() data: ImageTaskPayload) {
    try {
      const outputPaths = await this.compressorService.compress(
        data.fileName,
        data.taskId,
        data.buffer,
      );

      console.log('The resulting images are saved at:');

      outputPaths.forEach((p) => console.log(' -', p));
    } catch (error) {
      console.error('Processing Error:', error);
    }
  }

  @Get('status/:taskId')
  async getStatus(@Param('taskId') taskId: string) {
    const task = await this.compressorService.getTaskStatus(taskId);

    if (!task) throw new NotFoundException(`Task ${taskId} not found`);

    return task;
  }
}
