import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from '../guards/auth.guard.js';
import { CookieService } from '../services/cookie.service.js';

@Global()
@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET })],
  providers: [CookieService, AuthGuard],
  // Exporta JwtModule também: assim o AuthGuard pode ser instanciado via
  // @UseGuards(AuthGuard) em qualquer módulo (ex: UserModule) sem reimportar.
  exports: [CookieService, AuthGuard, JwtModule],
})
export class CoreModule {}
