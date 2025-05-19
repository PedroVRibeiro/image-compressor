import { Model } from 'mongoose';

import { CompressionTaskDocument } from './compression-task.schema';
import { CompressionTaskInterface } from '../interfaces/compression-task.interface';

export async function saveCompressionTask(
  model: Model<CompressionTaskDocument>,
  options: CompressionTaskInterface,
) {
  const { taskId, fileName, status, metadata, versions, errorMessage } =
    options;

  await model.create({
    task_id: taskId,
    original_filename: fileName,
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
