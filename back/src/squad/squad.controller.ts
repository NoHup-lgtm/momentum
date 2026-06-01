import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../core/guards/auth.guard.js';
import { AuthUser } from '../core/decorators/auth-user.decorator.js';
import type { AuthUserDto } from '../core/dto/auth-user.dto.js';
import { SquadService } from './squad.service.js';

@Controller('squads')
@UseGuards(AuthGuard)
export class SquadController {
  constructor(private readonly squad: SquadService) {}

  @Post()
  create(
    @AuthUser() user: AuthUserDto,
    @Body() body: { name?: string; description?: string },
  ) {
    return this.squad.createSquad(user.id, body.name ?? '', body.description);
  }

  @Post('join')
  join(@AuthUser() user: AuthUserDto, @Body() body: { code?: string }) {
    return this.squad.joinByCode(user.id, body.code ?? '');
  }

  @Get('me')
  me(@AuthUser() user: AuthUserDto) {
    return this.squad.getMySquad(user.id);
  }

  @Get('me/leaderboard')
  leaderboard(@AuthUser() user: AuthUserDto) {
    return this.squad.getLeaderboard(user.id);
  }

  @Post('me/invite')
  invite(@AuthUser() user: AuthUserDto) {
    return this.squad.createInvite(user.id);
  }

  @Post('me/leave')
  leave(@AuthUser() user: AuthUserDto) {
    return this.squad.leaveSquad(user.id);
  }
}
