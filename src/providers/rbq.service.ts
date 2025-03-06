import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { connect, Channel } from 'amqplib';
import { QueueConfig, QueueService } from '../models/queue.service.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RbqQueueService
  extends QueueService
  implements OnModuleInit, OnModuleDestroy
{
  private channel: Channel;
  private queueName: string;

  constructor(private readonly config: QueueConfig) {
    super();
  }

  async onModuleInit() {
    await this.setupConnection();
  }

  async onModuleDestroy() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
    } catch (error) {
      console.error('Error during RabbitMQ cleanup:', error);
    }
  }

  async setupConnection() {
    try {
      const { username, password, host, port, vhost, queueName } = this.config;
      this.queueName = queueName;
      const connectionString = `amqp://${username}:${password}@${host}:${port}${vhost}`;

      const connection = await connect(connectionString);
      this.channel = await connection.createChannel();
      await this.channel.assertQueue(this.queueName, { durable: false });
    } catch (error) {
      throw new Error('Failed to connect with RabbitMQ', error);
    }
  }

  async publish(message: string): Promise<string> {
    // running e2e doesn't invoke onModuleInit so had to setup here
    if (!this.channel) {
      await this.setupConnection();
    }
    const id: string = uuidv4();
    this.channel.sendToQueue(this.queueName, Buffer.from(message), {
      messageId: id,
    });
    return id;
  }

  async consume(callback: (msg: string) => void) {
    if (!this.channel) {
      await this.setupConnection();
    }
    await this.channel.consume(this.queueName, (msg) => {
      if (msg) {
        callback(msg.content.toString());
        this.channel.ack(msg);
      }
    });
  }
}
