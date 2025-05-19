import * as amqplib from 'amqplib';
import pRetry from 'p-retry';

import { connectWithRetry, RabbitMQConnection } from './rabbitmq-connector';

jest.mock('amqplib');

export function connectWithRetryQuick(
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
      retries: 2,
      minTimeout: 10,
      factor: 1,
    },
  );
}

describe('connectWithRetry', () => {
  const mockLogger = { log: jest.fn() };

  const mockChannel = {
    assertQueue: jest.fn(),
  };

  const mockConnection = {
    createChannel: jest.fn().mockResolvedValue(mockChannel),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should connect and assert the queue successfully', async () => {
    (amqplib.connect as jest.Mock).mockResolvedValue(mockConnection);

    const result = await connectWithRetry(
      'amqp://localhost',
      'my-queue',
      mockLogger,
    );

    expect(amqplib.connect).toHaveBeenCalledWith('amqp://localhost');
    expect(mockConnection.createChannel).toHaveBeenCalled();
    expect(mockChannel.assertQueue).toHaveBeenCalledWith('my-queue', {
      durable: true,
    });
    expect(result).toEqual({
      connection: mockConnection,
      channel: mockChannel,
    });
    expect(mockLogger.log).toHaveBeenCalledWith(
      expect.stringContaining('Connected'),
    );
  });

  it('should retry on failure', async () => {
    const connectMock = amqplib.connect as jest.Mock;

    connectMock
      .mockRejectedValueOnce(new Error('fail 1'))
      .mockResolvedValueOnce(mockConnection);

    const result = await connectWithRetryQuick(
      'amqp://localhost',
      'my-queue',
      mockLogger,
    );

    expect(connectMock).toHaveBeenCalledTimes(2);
    expect(result.connection).toBe(mockConnection);
  });
});
