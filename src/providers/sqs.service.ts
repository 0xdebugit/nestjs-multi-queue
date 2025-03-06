import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
  CreateQueueCommand,
} from '@aws-sdk/client-sqs';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { QueueConfig, QueueService } from '../models/queue.service.interface';

@Injectable()
export class SqsQueueService
  extends QueueService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly client: SQSClient;
  private queueUrl: undefined | string;
  private readonly queueName: string;
  private pollInterval: NodeJS.Timeout | null = null;

  constructor(private readonly config: QueueConfig) {
    super();
    const { host, port, queueName } = this.config;
    this.client = new SQSClient({
      endpoint: `http://${host}:${port}`,
    });
    this.queueName = queueName;
  }

  async onModuleInit() {
    const createQueueCommand = new CreateQueueCommand({
      QueueName: this.queueName,
    });
    try {
      const response = await this.client.send(createQueueCommand);
      this.queueUrl = response.QueueUrl;
      console.log(`SQS Queue is Ready: ${this.queueUrl}`);
    } catch (error) {
      console.error('Error creating queue:', error);
      throw error;
    }
  }

  onModuleDestroy() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  async publish(message: string): Promise<any> {
    const command = await new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: message,
    });
    const response = await this.client.send(command);
    return response.MessageId;
  }

  async consume(callback: (message: string) => void): Promise<void> {
    const poll = async () => {
      const command = new ReceiveMessageCommand({
        QueueUrl: this.queueUrl,
        WaitTimeSeconds: 10,
        MaxNumberOfMessages: 10,
      });
      try {
        const data = await this.client.send(command);
        if (data.Messages) {
          for (const msg of data.Messages) {
            if (msg.Body) {
              callback(msg.Body);
            }
            if (msg.ReceiptHandle) {
              const deleteCommand = new DeleteMessageCommand({
                QueueUrl: this.queueUrl,
                ReceiptHandle: msg.ReceiptHandle,
              });
              await this.client.send(deleteCommand);
            }
          }
        }
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    };

    // Poll immediately and then every 15 seconds.
    poll();
    this.pollInterval = setInterval(poll, 15000);
  }
}
