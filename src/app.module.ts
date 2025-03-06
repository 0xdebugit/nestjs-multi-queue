import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { QueueModule } from './queue.module';

@Module({
  imports: [QueueModule.register()],
  controllers: [AppController],
})
export class AppModule {}
