import { Module, DynamicModule, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QueueConfig } from './models/queue.service.interface';
import { SqsQueueService } from './providers/sqs.service';
import { RbqQueueService } from './providers/rbq.service';

@Module({})
export class QueueModule {
  static register(): DynamicModule {
    const providers: Provider[] = [];
    const configService = new ConfigService();
    const queueProvidersEnv = configService.get<string>('QUEUE_TYPE') || 'RBQ';
    const queueProviders = queueProvidersEnv.split(',').map((p) => p.trim());

    // Ideally we can create another module to export all configs
    const baseConfig = {
      queueName: configService.get<string>('QUEUE_NAME') || 'main-queue',
    };

    queueProviders.forEach((queue) => {
      if (queue === 'SQS') {
        const config: QueueConfig = {
          ...baseConfig,
          host: configService.get<string>('AWS_SQS_HOST') || 'localstack',
          port: configService.get<string>('AWS_SQS_PORT') || 4566,
        };

        providers.push({
          provide: `${queue}_SERVICE`,
          useFactory: () => new SqsQueueService(config),
        });
      } else if (queue === 'RBQ') {
        const config: QueueConfig = {
          ...baseConfig,
          host:
            configService.get<string>('RABBITMQ_HOST') ||
            'test-nest-app-rabbitmq-1', //default is the rabbitmq image name
          port: configService.get<string>('RABBITMQ_PORT') || 5672,
          username: configService.get<string>('RABBITMQ_USERNAME') || 'guest',
          password: configService.get<string>('RABBITMQ_PASSWORD') || 'guest',
          vhost: configService.get<string>('RABBITMQ_VHOST') || '/',
        };

        providers.push({
          provide: `${queue}_SERVICE`,
          useFactory: () => new RbqQueueService(config),
        });
      }
    });

    if (providers.length === 0) {
      throw new Error(`No Queue Registered`);
    }

    return {
      module: QueueModule,
      providers: providers,
      exports: providers,
    };
  }
}
