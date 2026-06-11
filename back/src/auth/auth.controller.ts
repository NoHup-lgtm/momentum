import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service.js';
import { LoginWithGithubDto, RefreshTokenDto } from './dto/login.dto.js';

// Extrai o token do header `Authorization: Bearer <token>` (clientes mobile)
// caindo de volta para o cookie httpOnly (clientes web).
function bearerToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.slice(7).trim();
  }
  return undefined;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('login/github')
  async loginWithGithub(
    @Body() body: LoginWithGithubDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (!body.code) {
      throw new UnauthorizedException('Missing OAuth code');
    }

    const user = await this.authService.loginWithGithub(
      body.code,
      body.redirectUri,
      body.codeVerifier,
    );
    const tokens = await this.authService.issueAuthCookies(
      res,
      user.id,
      user.githubId,
    );

    // user + tokens: web usa os cookies, mobile usa os tokens do corpo.
    return { user, ...tokens };
  }

  @Get('check')
  async check(@Req() req: Request) {
    const token =
      (req.cookies?.access_token as string | undefined) ?? bearerToken(req);
    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    const user = await this.authService.verifyAccessToken(token);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  @Post('refresh')
  @Post('refreshtoken')
  async refresh(
    @Body() body: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token =
      (req.cookies?.refresh_token as string | undefined) ??
      bearerToken(req) ??
      body?.refreshToken;
    if (!token) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const user = await this.authService.refreshTokens(token);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokens = await this.authService.issueAuthCookies(
      res,
      user.id,
      user.githubId,
    );
    return { user, ...tokens };
  }

  // Logout: revoga o refresh token apresentado (server-side) e limpa cookies.
  @Post('logout')
  async logout(
    @Body() body: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token =
      (req.cookies?.refresh_token as string | undefined) ??
      bearerToken(req) ??
      body?.refreshToken;
    await this.authService.logout(token);
    this.authService.clearAuthCookies(res);
    return { ok: true };
  }
}
