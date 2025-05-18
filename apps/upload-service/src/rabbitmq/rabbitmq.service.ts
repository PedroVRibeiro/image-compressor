import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqplib from 'amqplib';
import { connectWithRetry } from 'libs/shared/rabbitmq/rabbitmq-connector';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);

  constructor(private readonly configService: ConfigService) {}

  private RABBITMQ_URL: string;
  private QUEUE_NAME: string;

  private connection: amqplib.Connection;
  private channel: amqplib.Channel;

  async onModuleInit() {
    this.RABBITMQ_URL =
      this.configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672';
    this.QUEUE_NAME =
      this.configService.get<string>('QUEUE_NAME') || 'image-processing';

    const { connection, channel } = await connectWithRetry(
      this.RABBITMQ_URL,
      this.QUEUE_NAME,
      this.logger,
    );

    this.connection = connection;
    this.channel = channel;
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
    this.logger.log('RabbitMQ connection closed gracefully');
  }

  publishToQueue(data: any) {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    const success = this.channel.sendToQueue(
      this.QUEUE_NAME,
      Buffer.from(JSON.stringify(data)),
      { persistent: true },
    );

    if (!success) {
      this.logger.warn('Failed to enqueue message');
      throw new Error('Message was not queued');
    }

    this.logger.log('Message sent to queue');
  }
}
