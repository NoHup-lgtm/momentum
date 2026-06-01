import { Module } from '@nestjs/common';
import { ShopController } from './shop.controller.js';
import { ShopService } from './shop.service.js';
import { ChestController } from '../chest/chest.controller.js';
import { ChestService } from '../chest/chest.service.js';

@Module({
  controllers: [ShopController, ChestController],
  providers: [ShopService, ChestService],
})
export class ShopModule {}
