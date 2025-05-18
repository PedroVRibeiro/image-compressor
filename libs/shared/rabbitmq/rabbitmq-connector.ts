import * as amqplib from 'amqplib';
import pRetry from 'p-retry';

export interface RabbitMQConnection {
  connection: amqplib.Connection;
  channel: amqplib.Channel;
}

export async function connectWithRetry(
  rabbitUrl: string,
  queueName: string,
  logger: { log: (msg: string) => void },
): Promise<RabbitMQConnection> {
  return pRetry(
    async () => {
      logger.log(`Trying to connect to RabbitMQ at ${rabbitUrl}...`);

      const connection = await amqplib.connect(rabbitUrl);
      const channel = await connection.createChannel();

      await channel.assertQueue(queueName, { durable: true });

      logger.log('✅ Connected to RabbitMQ successfully');

      return { connection, channel };
    },
    {
      retries: 5,
      factor: 2,
      minTimeout: 5000,
    },
  );
}
