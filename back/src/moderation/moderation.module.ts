import { Global, Module } from '@nestjs/common';
import { ModerationService } from './moderation.service.js';
import { ModerationController } from './moderation.controller.js';

// @Global: feed, ranking, perfil e amizade consultam bloqueios sem reimportar.
@Global()
@Module({
  providers: [ModerationService],
  controllers: [ModerationController],
  exports: [ModerationService],
})
export class ModerationModule {}
