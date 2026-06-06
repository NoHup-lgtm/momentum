import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../core/guards/auth.guard.js';
import { AuthUser } from '../core/decorators/auth-user.decorator.js';
import type { AuthUserDto } from '../core/dto/auth-user.dto.js';
import { FriendService } from './friend.service.js';
import { FriendRequestDto } from './dto/friend.dto.js';

@Controller('me/friends')
@UseGuards(AuthGuard)
export class FriendController {
  constructor(private readonly friends: FriendService) {}

  @Get()
  list(@AuthUser() user: AuthUserDto) {
    return this.friends.getFriends(user.id);
  }

  @Post('request')
  request(@AuthUser() user: AuthUserDto, @Body() body: FriendRequestDto) {
    return this.friends.addByUsername(user.id, body.username);
  }

  @Post(':id/accept')
  accept(@AuthUser() user: AuthUserDto, @Param('id') id: string) {
    return this.friends.accept(user.id, id);
  }

  @Delete(':id')
  remove(@AuthUser() user: AuthUserDto, @Param('id') id: string) {
    return this.friends.remove(user.id, id);
  }
}
