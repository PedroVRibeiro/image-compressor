import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqplib from 'amqplib';
import pRetry from 'p-retry';

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

    await this.connectWithRetry();
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
    this.logger.log('RabbitMQ connection closed gracefully');
  }

  private async connectWithRetry() {
    await pRetry(
      async () => {
        this.logger.log('Trying to connect to RabbitMQ...');
        this.connection = await amqplib.connect(this.RABBITMQ_URL);
        this.channel = await this.connection.createChannel();

        await this.channel.assertQueue(this.QUEUE_NAME, {
          durable: true,
        });
        this.logger.log('Connected to RabbitMQ successfully');
      },
      {
        retries: 5,
        factor: 2,
        minTimeout: 2000,
      },
    );
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
