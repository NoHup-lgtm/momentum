import { Global, Module } from '@nestjs/common';
import { ShopController } from './shop.controller.js';
import { ShopService } from './shop.service.js';
import { ChestController } from '../chest/chest.controller.js';
import { ChestService } from '../chest/chest.service.js';

// Global: ShopService.equippedFor() é usado por ranking/amigos/feed/squad
// para mostrar os cosméticos equipados no avatar dos outros usuários.
@Global()
@Module({
  controllers: [ShopController, ChestController],
  providers: [ShopService, ChestService],
  exports: [ShopService],
})
export class ShopModule {}
