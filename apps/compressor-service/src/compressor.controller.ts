import { Controller, Get } from '@nestjs/common';
import { CompressorService } from './compressor.service';

@Controller()
export class CompressorController {
  constructor(private readonly compressorService: CompressorService) {}

  @Get()
  getHello(): string {
    return this.compressorService.getHello();
  }
}
