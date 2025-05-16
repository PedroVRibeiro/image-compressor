import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ImageVersion, ImageVersionSchema } from "./image-version.schema";

export type CompressionTaskDocument = CompressionTask & Document;

@Schema()
export class CompressionTask {

    @Prop({ required: true })
    task_id: string;

    @Prop({ required: true })
    original_filename: string;

    @Prop({ required: true })
    status: 'PENDING' | 'COMPLETED' | 'FAILED';

    @Prop({
    type: {
      width: Number,
      height: Number,
      mimetype: String,
      exif: Object,
    },
  })
    original_metadata: {
        width: number;
        heigth: number;
        mimetype: string;
        exif: Record<string, any>
    };

    @Prop({ type: Date })
    processed_at: Date;

    @Prop()
    error_message?: string;

    @Prop({ type: [ImageVersionSchema] })
  versions: ImageVersion[];
}

export const CompressionTaskSchema = SchemaFactory.createForClass(CompressionTask);