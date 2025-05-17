import { Injectable } from '@nestjs/common';
import path from 'path';
import fs from 'fs';
import sharp, { Metadata } from 'sharp';
import { InjectModel } from '@nestjs/mongoose';
import {
  CompressionTask,
  CompressionTaskDocument,
} from './database/compression-task.schema';
import { Model } from 'mongoose';
import { saveCompressionTask } from './database/mongo-helpers';

@Injectable()
export class CompressorService {
  constructor(
    @InjectModel(CompressionTask.name)
    private readonly taskModel: Model<CompressionTaskDocument>,
  ) {}

  async compress(
    fileName: string,
    taskId: string,
    buffer: number[],
  ): Promise<string[]> {
    const payloadBuffer = Buffer.from(buffer);
    const image = sharp(payloadBuffer);
    const metadata: Metadata = await image.metadata();

    const baseName = path.parse(fileName).name;
    const ext = path.extname(fileName).toLowerCase();
    const outputDir = path.resolve(process.cwd(), `compressed/${taskId}`);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const qualities = [
      { label: 'low', quality: 30 },
      { label: 'medium', quality: 60 },
      { label: 'high', quality: 85 },
    ];

    const outputPaths: string[] = [];

    try {
      const versions = await Promise.all(
        qualities.map(async ({ label, quality }) => {
          const outputFilename = `${baseName}-${label}${ext}`;
          const outputPath = path.resolve(outputDir, outputFilename);

          await image
            .clone()
            .resize({ width: 1280 })
            .jpeg({ quality })
            .toFile(outputPath);

          const { size } = fs.statSync(outputPath);
          const dimensions: Metadata = await sharp(outputPath).metadata();

          outputPaths.push(outputPath);

          return {
            label,
            path: outputPath,
            width: dimensions.width || 0,
            height: dimensions.height || 0,
            size,
          };
        }),
      );

      await saveCompressionTask(this.taskModel, {
        taskId,
        fileName,
        metadata,
        status: 'COMPLETED',
        versions,
      });
    } catch (error) {
      await saveCompressionTask(this.taskModel, {
        taskId,
        fileName,
        status: 'FAILED',
        metadata,
        versions: [],
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        errorMessage: error.message,
      });
    }

    return outputPaths;
  }
}
