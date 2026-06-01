import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../core/guards/auth.guard.js';
import { AuthUser } from '../core/decorators/auth-user.decorator.js';
import type { AuthUserDto } from '../core/dto/auth-user.dto.js';
import { AchievementService } from './achievement.service.js';

@Controller('me/achievements')
@UseGuards(AuthGuard)
export class AchievementController {
  constructor(private readonly achievements: AchievementService) {}

  @Get()
  all(@AuthUser() user: AuthUserDto) {
    return this.achievements.getAll(user.id);
  }
}
