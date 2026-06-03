import { Global, Module } from '@nestjs/common';
import { FeedController } from './feed.controller.js';
import { FeedService } from './feed.service.js';

// Global: FeedService pode ser injetado em qualquer serviço pra emitir eventos.
@Global()
@Module({
  controllers: [FeedController],
  providers: [FeedService],
  exports: [FeedService],
})
export class FeedModule {}
