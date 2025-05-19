import * as fs from 'fs';

import { Logger } from '@nestjs/common';
import sharp from 'sharp';

import { CompressorService } from '../compressor.service';
import { saveCompressionTask } from '../database/mongo-helpers';

jest.mock('fs');
jest.mock('sharp');
jest.mock('../database/mongo-helpers');

const mockedSharp = sharp as jest.MockedFunction<typeof sharp>;
const fakeMetadata = { width: 100, height: 100 };

describe('CompressorService', () => {
  let service: CompressorService;
  const mockTaskModel = {
    findOne: jest.fn(),
  };

  const taskId = 'task123';
  const fileName = 'example.jpg';
  const buffer = [255, 216, 255];

  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});

    service = new CompressorService(mockTaskModel as any);

    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (fs.mkdirSync as jest.Mock).mockImplementation(() => {});
    (fs.statSync as jest.Mock).mockReturnValue({ size: 1024 });
  });

  describe('compress', () => {
    it('should compress the image and save metadata', async () => {
      const toFileMock = jest.fn().mockResolvedValue(undefined);
      const jpegMock = jest.fn().mockReturnValue({ toFile: toFileMock });
      const resizeMock = jest.fn().mockReturnValue({ jpeg: jpegMock });
      const cloneMock = jest.fn().mockReturnValue({ resize: resizeMock });

      const bufferSharpInstance = {
        metadata: jest.fn().mockResolvedValue(fakeMetadata),
        clone: cloneMock,
      };

      const fileSharpInstance = {
        metadata: jest.fn().mockResolvedValue(fakeMetadata),
      };

      (sharp as unknown as jest.Mock).mockImplementation((input: any) => {
        if (Buffer.isBuffer(input)) {
          return bufferSharpInstance;
        }
        return fileSharpInstance;
      });

      const result = await service.compress(fileName, taskId, buffer);

      expect(fs.mkdirSync).toHaveBeenCalledWith(
        expect.stringContaining('compressed'),
        { recursive: true },
      );

      expect(result).toHaveLength(3);
      expect(saveCompressionTask).toHaveBeenCalledWith(expect.anything(), {
        taskId,
        fileName,
        metadata: fakeMetadata,
        status: 'COMPLETED',
        versions: expect.arrayContaining([
          expect.objectContaining({
            label: 'low',
            size: 1024,
            width: 100,
            height: 100,
          }),
        ]),
      });
    });

    it('should handle and log errors during compression', async () => {
      const cloneMock = jest.fn().mockImplementation(() => {
        throw new Error('clone is not a function');
      });

      mockedSharp.mockReturnValue({
        metadata: jest.fn().mockResolvedValue(fakeMetadata),
        clone: cloneMock,
      } as any);

      const result = await service.compress(fileName, taskId, buffer);

      expect(result).toHaveLength(0);
      expect(saveCompressionTask).toHaveBeenCalledWith(expect.anything(), {
        taskId,
        fileName,
        metadata: fakeMetadata,
        status: 'FAILED',
        versions: [],
        errorMessage: 'clone is not a function',
      });
    });
  });

  describe('getTaskStatus', () => {
    it('should call findOne with the correct taskId', async () => {
      mockTaskModel.findOne.mockReturnValueOnce({ lean: () => 'mock-task' });

      const result = await service.getTaskStatus('abc123');
      expect(mockTaskModel.findOne).toHaveBeenCalledWith({
        task_id: 'abc123',
      });
      expect(result).toEqual('mock-task');
    });
  });
});
