import { Global, Module } from '@nestjs/common';
import { PushController } from './push.controller.js';
import { PushService } from './push.service.js';

// @Global: o PushService é injetável em qualquer módulo (feed/liga/squad)
// pra disparar notificação nos eventos.
@Global()
@Module({
  controllers: [PushController],
  providers: [PushService],
  exports: [PushService],
})
export class PushModule {}
