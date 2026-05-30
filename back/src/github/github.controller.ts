import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../core/guards/auth.guard.js';
import { AuthUser } from '../core/decorators/auth-user.decorator.js';
import type { AuthUserDto } from '../core/dto/auth-user.dto.js';
import { GithubService } from './github.service.js';
import { UserService } from '../user/user.service.js';

@Controller('me/github')
@UseGuards(AuthGuard)
export class GithubController {
  constructor(
    private readonly github: GithubService,
    private readonly userService: UserService,
  ) {}

  // Roda a sincronização e devolve o /me já atualizado (1 round-trip pro mobile).
  @Post('sync')
  async sync(@AuthUser() user: AuthUserDto) {
    await this.github.syncUser(user.id);
    return this.userService.getMe(user.id);
  }

  // Commits de hoje por repositório (lista "hoje no github" da Home).
  @Get('today')
  today(@AuthUser() user: AuthUserDto) {
    return this.github.getTodayByRepo(user.id);
  }

  // Contagem diária das 13 semanas (heatmap do Perfil).
  @Get('heatmap')
  heatmap(@AuthUser() user: AuthUserDto) {
    return this.github.getHeatmap(user.id);
  }
}
