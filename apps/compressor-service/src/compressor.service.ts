import { Injectable } from '@nestjs/common';

@Injectable()
export class CompressorService {
  getHello(): string {
    return 'Hello World!';
  }
}
