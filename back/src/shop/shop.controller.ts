import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../core/guards/auth.guard.js';
import { AuthUser } from '../core/decorators/auth-user.decorator.js';
import type { AuthUserDto } from '../core/dto/auth-user.dto.js';
import { ShopService } from './shop.service.js';

@Controller('me/shop')
@UseGuards(AuthGuard)
export class ShopController {
  constructor(private readonly shop: ShopService) {}

  @Get()
  list(@AuthUser() user: AuthUserDto) {
    return this.shop.getShop(user.id);
  }

  @Post(':id/buy')
  buy(@AuthUser() user: AuthUserDto, @Param('id') id: string) {
    return this.shop.buy(user.id, id);
  }

  @Post(':id/equip')
  equip(@AuthUser() user: AuthUserDto, @Param('id') id: string) {
    return this.shop.equip(user.id, id);
  }
}
