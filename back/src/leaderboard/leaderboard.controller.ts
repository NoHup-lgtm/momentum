import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../core/guards/auth.guard.js';
import { LeaderboardService } from './leaderboard.service.js';

@Controller('leaderboard')
@UseGuards(AuthGuard)
export class LeaderboardController {
  constructor(private readonly leaderboard: LeaderboardService) {}

  @Get('users')
  users() {
    return this.leaderboard.topUsers(50);
  }

  @Get('squads')
  squads() {
    return this.leaderboard.topSquads(20);
  }
}
