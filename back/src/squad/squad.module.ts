import { Module } from '@nestjs/common';
import { SquadController } from './squad.controller.js';
import { SquadService } from './squad.service.js';

@Module({
  controllers: [SquadController],
  providers: [SquadService],
})
export class SquadModule {}
