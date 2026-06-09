import { Body, Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../core/guards/auth.guard.js';
import { AuthUser } from '../core/decorators/auth-user.decorator.js';
import type { AuthUserDto } from '../core/dto/auth-user.dto.js';
import { ModerationService } from './moderation.service.js';
import { ReportDto } from './dto/report.dto.js';

@Controller('users/:id')
@UseGuards(AuthGuard)
export class ModerationController {
  constructor(private readonly mod: ModerationService) {}

  @Post('block')
  block(@AuthUser() user: AuthUserDto, @Param('id') id: string) {
    return this.mod.block(user.id, id);
  }

  @Delete('block')
  unblock(@AuthUser() user: AuthUserDto, @Param('id') id: string) {
    return this.mod.unblock(user.id, id);
  }

  @Post('report')
  report(@AuthUser() user: AuthUserDto, @Param('id') id: string, @Body() body: ReportDto) {
    return this.mod.report(user.id, id, body.reason);
  }
}
