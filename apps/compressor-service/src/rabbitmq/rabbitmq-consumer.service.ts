import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as amqplib from 'amqplib';
import { CompressorService } from '../compressor.service';
import { ImageTaskPayload } from '@shared/shared/interfaces/image-task-payload.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RabbitMQConsumer implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQConsumer.name);

  constructor(
    private readonly compressorService: CompressorService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    try {
      const RABBITMQ_URL =
        this.configService.get<string>('RABBITMQ_URL') ||
        'amqp://localhost:5672';
      const QUEUE_NAME =
        this.configService.get<string>('QUEUE_NAME') || 'image-processing';

      const connection = await amqplib.connect(RABBITMQ_URL);
      const channel = await connection.createChannel();
      await channel.assertQueue(QUEUE_NAME, { durable: true });

      this.logger.log(`Listening to queue "${QUEUE_NAME}"...`);

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      await channel.consume(QUEUE_NAME, async (msg) => {
        if (msg) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const payload: ImageTaskPayload = JSON.parse(
              msg.content.toString(),
            );
            this.logger.log(`Received task: ${payload.taskId}`);

            const { fileName, taskId, buffer } = payload;

            await this.compressorService.compress(fileName, taskId, buffer);

            channel.ack(msg);
          } catch (err) {
            this.logger.error('Failed to process message', err);
            channel.nack(msg, false, false);
          }
        }
      });
    } catch (err) {
      this.logger.error('Failed to connect to RabbitMQ', err);
    }
  }
}
