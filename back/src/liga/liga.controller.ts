import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../core/guards/auth.guard.js';
import { AuthUser } from '../core/decorators/auth-user.decorator.js';
import type { AuthUserDto } from '../core/dto/auth-user.dto.js';
import { LigaService } from './liga.service.js';

@Controller('me/liga')
@UseGuards(AuthGuard)
export class LigaController {
  constructor(private readonly liga: LigaService) {}

  @Get()
  myLiga(@AuthUser() user: AuthUserDto) {
    return this.liga.getMyLiga(user.id);
  }
}
