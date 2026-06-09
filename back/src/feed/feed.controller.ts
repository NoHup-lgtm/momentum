import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../core/guards/auth.guard.js';
import { AuthUser } from '../core/decorators/auth-user.decorator.js';
import type { AuthUserDto } from '../core/dto/auth-user.dto.js';
import { FeedService, type FeedScope } from './feed.service.js';

const SCOPES: FeedScope[] = ['friends', 'global', 'liga'];

@Controller('feed')
@UseGuards(AuthGuard)
export class FeedController {
  constructor(private readonly feed: FeedService) {}

  @Get()
  list(@AuthUser() user: AuthUserDto, @Query('scope') scope?: string) {
    const s: FeedScope = SCOPES.includes(scope as FeedScope) ? (scope as FeedScope) : 'friends';
    return this.feed.getFeed(user.id, s);
  }
}
