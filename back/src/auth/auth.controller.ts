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
import { AuthService } from './auth.service.js';
import type { LoginWithGithubDto } from './dto/login.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    );
    this.authService.issueAuthCookies(res, user.id, user.githubId);

    return user;
  }

  @Get('check')
  async check(@Req() req: Request) {
    const token = req.cookies?.access_token as string | undefined;
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
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies?.refresh_token as string | undefined;
    if (!token) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const user = await this.authService.refreshTokens(token);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    this.authService.issueAuthCookies(res, user.id, user.githubId);
    return user;
  }
}
