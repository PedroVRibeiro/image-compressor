import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

import { CompressionTask } from './compression-task.schema';

export type CompressionTaskDocument = CompressionTask & Document;

@Schema({ _id: false })
export class ImageVersion {
  @Prop({ required: true })
  label: string;

  @Prop({ required: true })
  path: string;

  @Prop({ required: true })
  width: number;

  @Prop({ required: true })
  height: number;

  @Prop({ required: true })
  size: number;
}
export const ImageVersionSchema = SchemaFactory.createForClass(ImageVersion);
