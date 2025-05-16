import { Injectable } from '@nestjs/common';
import path from 'path';
import fs from 'fs'
import sharp from 'sharp';

@Injectable()
export class CompressorService {
  async compress(inputPath: string, filename: string): Promise<string[]> {
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

      for (const { label, quality } of qualities) {
      const outputFilename = `${baseName}-${label}${ext}`;
      const outputPath = path.resolve(outputDir, outputFilename);

      await sharp(inputPath)
        .resize({ width: 1280 })
        .jpeg({ quality })
        .toFile(outputPath);

      outputPaths.push(outputPath);
    }

    return outputPaths;
  }
}
