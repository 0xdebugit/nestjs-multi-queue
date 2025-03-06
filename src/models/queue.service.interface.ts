export interface MessageId {
  sqs?: string;
  rbq?: string;
}

export interface InputQueueMessage {
  value: string;
  fastQueue?: boolean;
}
export interface QueueConfig {
  queueName: string;
  host: string;
  port: string | number;
  username?: string;
  password?: string;
  vhost?: string;
}

export interface IQueueService {
  publish(message: string): string | Promise<string>;
  consume(callback: (message: string) => void): Promise<void>;
}

export abstract class QueueService implements IQueueService {
  abstract publish(message: string): string | Promise<string>;
  abstract consume(callback: (message: string) => void): Promise<void>;
}
