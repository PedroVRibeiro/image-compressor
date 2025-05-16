import { Controller, Get } from '@nestjs/common';
import { CompressorServiceService } from './compressor-service.service';

@Controller()
export class CompressorServiceController {
  constructor(private readonly compressorServiceService: CompressorServiceService) {}

  @Get()
  getHello(): string {
    return this.compressorServiceService.getHello();
  }
}
