import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from '../guards/auth.guard.js';
import { CookieService } from '../services/cookie.service.js';

@Global()
@Module({
  imports: [JwtModule.register({ secret: process.env.JWT_SECRET })],
  providers: [CookieService, AuthGuard],
  exports: [CookieService, AuthGuard],
})
export class CoreModule {}
