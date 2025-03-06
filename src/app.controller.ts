import { Body, Controller, Get, Inject, Optional, Post } from '@nestjs/common';
import {
  MessageId,
  InputQueueMessage,
  QueueService,
} from './models/queue.service.interface';

@Controller()
export class AppController {
  constructor(
    @Optional() @Inject('RBQ_SERVICE') private rbqService: QueueService,
    @Optional() @Inject('SQS_SERVICE') private sqsService: QueueService,
  ) {}

  @Post('/publish')
  async publish(@Body() message: InputQueueMessage) {
    const messageId: MessageId = {};
    if (this.rbqService) {
      messageId.rbq = await this.rbqService.publish(message.value);
    }
    if (this.sqsService) {
      messageId.sqs = await this.sqsService.publish(message.value);
    }

    return { response: messageId };
  }

  @Get('/consume')
  async consume() {
    if (this.rbqService) {
      await this.rbqService.consume((msg) =>
        console.log('[RBQ] RECEIVED: ', msg),
      );
    }

    if (this.sqsService) {
      await this.sqsService.consume((msg) =>
        console.log('[SQS] RECEIVED: ', msg),
      );
    }

    return {
      status: '[LOGS] Consumer is listening now....',
    };
  }
}
