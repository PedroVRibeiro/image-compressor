import { Injectable } from '@nestjs/common';
import path from 'path';
import fs from 'fs'
import sharp from 'sharp';
import { InjectModel } from '@nestjs/mongoose';
import { CompressionTask, CompressionTaskDocument } from './database/compression-task.schema';
import { Model } from 'mongoose';
import { saveCompressionTask } from './database/mongo-helpers';

@Injectable()
export class CompressorService {
  constructor(
    @InjectModel(CompressionTask.name)
    private readonly taskModel: Model<CompressionTaskDocument>
  ) { }

  async compress(inputPath: string, filename: string, taskId: string): Promise<string[]> {
    const image = sharp(inputPath);
    const metadata = await image.metadata();

    const baseName = path.parse(filename).name;
    const ext = path.extname(filename).toLowerCase();
    const outputDir = path.resolve(process.cwd(), 'compressed')

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

          await image.clone().resize({ width: 1280 }).jpeg({ quality }).toFile(outputPath);

          const { size } = fs.statSync(outputPath);
          const dimensions = await sharp(outputPath).metadata();

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
        filename,
        metadata,
        status: 'COMPLETED',
        versions,
      });
    } catch (error) {
      await saveCompressionTask(this.taskModel, {
        taskId,
        filename,
        status: 'FAILED',
        metadata,
        versions: [],
        errorMessage: error.message,
      });
    }

    return outputPaths;
  }
}
