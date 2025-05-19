import fs from 'fs';
import path from 'path';

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import sharp, { Metadata } from 'sharp';

import {
  CompressionTask,
  CompressionTaskDocument,
} from './database/compression-task.schema';
import { saveCompressionTask } from './database/mongo-helpers';

@Injectable()
export class CompressorService {
  private readonly logger = new Logger(CompressorService.name);

  constructor(
    @InjectModel(CompressionTask.name)
    private readonly taskModel: Model<CompressionTaskDocument>,
  ) {}

  async compress(
    fileName: string,
    taskId: string,
    buffer: number[],
  ): Promise<string[]> {
    this.logger.log(
      `[CompressorService] START: ${fileName} for task ${taskId}`,
    );

    const payloadBuffer = Buffer.from(buffer);
    const image = sharp(payloadBuffer);
    const metadata: Metadata = await image.metadata();

    const baseName = path.parse(fileName).name;
    const ext = path.extname(fileName).toLowerCase();
    const outputDir = path.resolve(process.cwd(), 'compressed', taskId);

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

          this.logger.log(`[CompressorService] Writing: ${outputPath}`);

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

      this.logger.log(
        `[CompressorService] DONE: ${outputPaths.length} images saved`,
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      await saveCompressionTask(this.taskModel, {
        taskId,
        fileName,
        status: 'FAILED',
        metadata,
        versions: [],
        errorMessage: message,
      });
    }

    return outputPaths;
  }

  async getTaskStatus(taskId: string): Promise<CompressionTask | null> {
    return this.taskModel.findOne({ task_id: taskId }).lean();
  }
}
