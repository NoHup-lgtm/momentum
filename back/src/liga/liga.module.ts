import { Module } from '@nestjs/common';
import { LigaController } from './liga.controller.js';
import { LigaService } from './liga.service.js';

@Module({
  controllers: [LigaController],
  providers: [LigaService],
})
export class LigaModule {}
