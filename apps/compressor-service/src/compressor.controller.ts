import { Controller } from '@nestjs/common';
import { CompressorService } from './compressor.service';
import { EventPattern, Payload } from '@nestjs/microservices';
import { ImageTaskPayload } from '@shared/shared/interfaces/image-task-payload.interface';

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
}
