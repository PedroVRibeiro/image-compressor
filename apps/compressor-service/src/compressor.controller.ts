import { Controller, Get } from '@nestjs/common';
import { CompressorService } from './compressor.service';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class CompressorController {
  constructor(private readonly compressorService: CompressorService) {}

  @EventPattern('image.uploaded')
   async handleImage(@Payload() data: any) {

    console.log('Image received:', data);
    
    try {
      const outputPaths = await this.compressorService.compress(data.path, data.filename)
      console.log('The resulting images are saved at:')
       outputPaths.forEach((p) => console.log(' -', p));
    } catch (error) {
      console.error('Processing Error:', error);
    }
  }
}
