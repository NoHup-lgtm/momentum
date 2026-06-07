import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../core/guards/auth.guard.js';
import { AuthUser } from '../core/decorators/auth-user.decorator.js';
import type { AuthUserDto } from '../core/dto/auth-user.dto.js';
import { PushService } from './push.service.js';
import { PushSubscribeDto, PushUnsubscribeDto } from './dto/push.dto.js';

@Controller('me/push')
@UseGuards(AuthGuard)
export class PushController {
  constructor(private readonly push: PushService) {}

  @Post('subscribe')
  subscribe(@AuthUser() user: AuthUserDto, @Body() body: PushSubscribeDto) {
    return this.push.subscribe(user.id, body);
  }

  @Post('unsubscribe')
  unsubscribe(@AuthUser() _user: AuthUserDto, @Body() body: PushUnsubscribeDto) {
    return this.push.unsubscribe(body.endpoint);
  }
}
