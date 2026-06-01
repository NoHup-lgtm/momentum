import { Module } from '@nestjs/common';
import { ChallengeController } from './challenge.controller.js';
import { ChallengeService } from './challenge.service.js';

@Module({
  controllers: [ChallengeController],
  providers: [ChallengeService],
})
export class ChallengeModule {}
