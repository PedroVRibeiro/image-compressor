import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { ImageVersion, ImageVersionSchema } from './image-version.schema';

export type CompressionTaskDocument = CompressionTask & Document;

@Schema()
export class CompressionTask {
  @Prop({ required: true })
  task_id: string;

  @Prop({ required: true })
  original_filename: string;

  @Prop({ required: true, enum: ['PENDING', 'COMPLETED', 'FAILED'] })
  status: 'PENDING' | 'COMPLETED' | 'FAILED';

  @Prop({
    type: {
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      mimetype: { type: String, required: true },
      exif: { type: Object, default: {} },
    },
  })
  original_metadata: {
    width: number;
    height: number;
    mimetype: string;
    exif: Record<string, any>;
  };

  @Prop({ type: Date, required: true })
  processed_at: Date;

  @Prop()
  error_message?: string;

  @Prop({ type: [ImageVersionSchema] })
  versions: ImageVersion[];
}

export const CompressionTaskSchema =
  SchemaFactory.createForClass(CompressionTask);
