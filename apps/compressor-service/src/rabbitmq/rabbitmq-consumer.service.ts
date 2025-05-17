import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as amqplib from 'amqplib';
import { CompressorService } from '../compressor.service';
import { ImageTaskPayload } from '@shared/shared/interfaces/image-task-payload.interface';

@Injectable()
export class RabbitMQConsumer implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQConsumer.name);
  private readonly RABBITMQ_URL = 'amqp://localhost:5672';
  private readonly QUEUE_NAME = 'image-processing';

  constructor(private readonly compressorService: CompressorService) {}

  async onModuleInit() {
    try {
      const connection = await amqplib.connect(this.RABBITMQ_URL);
      const channel = await connection.createChannel();
      await channel.assertQueue(this.QUEUE_NAME, { durable: true });

      this.logger.log(`Listening to queue "${this.QUEUE_NAME}"...`);

      await channel.consume(this.QUEUE_NAME, async (msg) => {
        if (msg) {
          try {
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
