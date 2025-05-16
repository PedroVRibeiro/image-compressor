import { Model } from 'mongoose';
import { Metadata } from 'sharp';
import { CompressionTaskDocument } from './compression-task.schema';

interface CompressionTaskInterface {
  taskId: string;
  filename: string;
  status: 'COMPLETED' | 'FAILED';
  metadata: Metadata;
  versions: any[];
  errorMessage?: string;
}

export async function saveCompressionTask(
  model: Model<CompressionTaskDocument>,
  options: CompressionTaskInterface,
) {
  const { taskId, filename, status, metadata, versions, errorMessage } = options;

  await model.create({
    task_id: taskId,
    original_filename: filename,
    status,
    processed_at: new Date(),
    error_message: errorMessage,
    original_metadata: {
      width: metadata.width || 0,
      height: metadata.height || 0,
      mimetype: metadata.format || '',
      exif: metadata.exif || {},
    },
    versions,
  });
}
