import { Test, TestingModule } from '@nestjs/testing';
import { CompressorServiceController } from './compressor-service.controller';
import { CompressorServiceService } from './compressor-service.service';

describe('CompressorServiceController', () => {
  let compressorServiceController: CompressorServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CompressorServiceController],
      providers: [CompressorServiceService],
    }).compile();

    compressorServiceController = app.get<CompressorServiceController>(CompressorServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(compressorServiceController.getHello()).toBe('Hello World!');
    });
  });
});
