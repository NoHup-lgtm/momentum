import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../core/guards/auth.guard.js';
import { AuthUser } from '../core/decorators/auth-user.decorator.js';
import type { AuthUserDto } from '../core/dto/auth-user.dto.js';
import { ChestService } from './chest.service.js';

@Controller('me/chests')
@UseGuards(AuthGuard)
export class ChestController {
  constructor(private readonly chests: ChestService) {}

  @Get()
  pending(@AuthUser() user: AuthUserDto) {
    return this.chests.getPending(user.id);
  }

  @Post(':id/open')
  open(@AuthUser() user: AuthUserDto, @Param('id') id: string) {
    return this.chests.open(user.id, id);
  }
}
