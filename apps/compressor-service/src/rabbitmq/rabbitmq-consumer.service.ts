import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Channel, Connection, ConsumeMessage } from 'amqplib';
import { ImageTaskPayload } from 'libs/shared/interfaces/image-task-payload.interface';
import { connectWithRetry } from 'libs/shared/rabbitmq/rabbitmq-connector'; // adjust path accordingly

import { CompressorService } from '../compressor.service';

@Injectable()
export class RabbitMQConsumer implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQConsumer.name);

  private connection: Connection;
  private channel: Channel;

  constructor(
    private readonly compressorService: CompressorService,
    private readonly configService: ConfigService,
  ) {
    this.logger.log('📦 RabbitMQConsumer constructed');
  }

  async onModuleInit() {
    const RABBITMQ_URL =
      this.configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672';
    const QUEUE_NAME =
      this.configService.get<string>('QUEUE_NAME') || 'image-processing';

    const { connection, channel } = await connectWithRetry(
      RABBITMQ_URL,
      QUEUE_NAME,
      this.logger,
    );

    this.connection = connection;
    this.channel = channel;

    this.logger.log(`Listening to queue "${QUEUE_NAME}"...`);

    void this.channel.consume(QUEUE_NAME, (msg: ConsumeMessage | null) => {
      if (msg) {
        void (async () => {
          try {
            const payload = JSON.parse(
              msg.content.toString(),
            ) as ImageTaskPayload;
            this.logger.log(`Received task: ${payload.taskId}`);

            const { fileName, taskId, buffer } = payload;
            await this.compressorService.compress(fileName, taskId, buffer);

            this.channel.ack(msg);
          } catch (err) {
            this.logger.error('❌ Failed to process message', err);
            this.channel.nack(msg, false, false);
          }
        })();
      }
    });
  }
}
