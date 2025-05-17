export interface ImageTaskPayload {
  taskId: string;
  fileName: string;
  mimetype: string;
  buffer: number[];
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
}
