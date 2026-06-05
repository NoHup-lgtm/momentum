import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../core/guards/auth.guard.js';
import { AuthUser } from '../core/decorators/auth-user.decorator.js';
import type { AuthUserDto } from '../core/dto/auth-user.dto.js';
import { UserService } from './user.service.js';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  async me(@AuthUser() user: AuthUserDto) {
    return this.userService.getMe(user.id);
  }

  // Perfil público de outro usuário (toque no avatar em amigos/feed/ranking/squad).
  @Get('users/:id')
  @UseGuards(AuthGuard)
  async publicProfile(@AuthUser() user: AuthUserDto, @Param('id') id: string) {
    return this.userService.getPublicProfile(user.id, id);
  }
}
