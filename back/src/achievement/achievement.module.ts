import { Module } from '@nestjs/common';
import { AchievementController } from './achievement.controller.js';
import { AchievementService } from './achievement.service.js';

@Module({
  controllers: [AchievementController],
  providers: [AchievementService],
})
export class AchievementModule {}
