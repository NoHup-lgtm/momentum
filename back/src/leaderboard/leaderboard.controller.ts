import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../core/guards/auth.guard.js';
import { AuthUser } from '../core/decorators/auth-user.decorator.js';
import type { AuthUserDto } from '../core/dto/auth-user.dto.js';
import { LeaderboardService } from './leaderboard.service.js';

@Controller('leaderboard')
@UseGuards(AuthGuard)
export class LeaderboardController {
  constructor(private readonly leaderboard: LeaderboardService) {}

  @Get('users')
  users(@AuthUser() user: AuthUserDto) {
    return this.leaderboard.topUsers(user.id, 50);
  }

  @Get('squads')
  squads() {
    return this.leaderboard.topSquads(20);
  }
}
