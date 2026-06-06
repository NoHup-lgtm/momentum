import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { AuthUserDto } from '../dto/auth-user.dto.js';

type JwtPayload = {
  sub: string;
  githubId: string;
  tokenType: 'access' | 'refresh';
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const header = request.headers.authorization;
    const bearer = header?.startsWith('Bearer ')
      ? header.slice(7).trim()
      : undefined;
    // cookie (web) ou Authorization: Bearer (mobile)
    const token = (request.cookies?.access_token as string | undefined) ?? bearer;

    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    let payload: JwtPayload;
    try {
      payload = (await this.jwtService.verifyAsync(token)) as JwtPayload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    if (payload.tokenType !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Identidade vem do próprio JWT (assinado) — sem ida ao banco por request.
    // Access token é curto, então um user removido com token válido expira logo.
    const user: AuthUserDto = { id: payload.sub, githubId: payload.githubId };
    (request as Request & { user: AuthUserDto }).user = user;
    return true;
  }
}
