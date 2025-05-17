import { Metadata } from 'sharp';

export interface CompressionTaskInterface {
  taskId: string;
  fileName: string;
  status: 'COMPLETED' | 'FAILED';
  metadata: Metadata;
  versions: any[];
  errorMessage?: string;
}
