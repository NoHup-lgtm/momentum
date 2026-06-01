import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../core/guards/auth.guard.js';
import { AuthUser } from '../core/decorators/auth-user.decorator.js';
import type { AuthUserDto } from '../core/dto/auth-user.dto.js';
import { ChallengeService } from './challenge.service.js';

@Controller('me/challenges')
@UseGuards(AuthGuard)
export class ChallengeController {
  constructor(private readonly challenges: ChallengeService) {}

  @Get()
  today(@AuthUser() user: AuthUserDto) {
    return this.challenges.getToday(user.id);
  }

  @Post(':id/claim')
  claim(@AuthUser() user: AuthUserDto, @Param('id') id: string) {
    return this.challenges.claim(user.id, id);
  }
}
