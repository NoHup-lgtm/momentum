import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service.js';
import { CookieService } from '../core/services/cookie.service.js';
import type { AuthUserDto } from './dto/auth-user.dto.js';
import type {
  GithubEmailsResponseDto,
  GithubUserResponseDto,
} from './dto/github.dto.js';
import type { JwtPayloadDto } from './dto/jwt-payload.dto.js';

const DEFAULT_ACCESS_TTL = '15m';
const DEFAULT_REFRESH_TTL = '30d';

type JwtPayload = JwtPayloadDto;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly cookieService: CookieService,
  ) {}

  async loginWithGithub(code: string, redirectUri?: string) {
    const accessToken = await this.exchangeCodeForToken(code, redirectUri);
    const githubUser = await this.fetchGithubUser(accessToken);
    const email = await this.fetchPrimaryEmail(
      accessToken,
      githubUser.email ?? null,
    );

    const user = await this.prisma.user.upsert({
      where: { githubId: String(githubUser.id) },
      create: {
        githubId: String(githubUser.id),
        githubLogin: githubUser.login,
        accessToken,
        avatarUrl: githubUser.avatar_url ?? null,
        email,
      },
      update: {
        githubLogin: githubUser.login,
        accessToken,
        avatarUrl: githubUser.avatar_url ?? null,
        email,
      },
      select: {
        id: true,
        githubId: true,
        githubLogin: true,
        avatarUrl: true,
        email: true,
      },
    });

    return user;
  }

  async verifyAccessToken(token: string): Promise<AuthUserDto | null> {
    const payload = await this.verifyToken(token, 'access');
    return await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        githubId: true,
        githubLogin: true,
        avatarUrl: true,
        email: true,
      },
    });
  }

  async refreshTokens(refreshToken: string): Promise<AuthUserDto | null> {
    const payload = await this.verifyToken(refreshToken, 'refresh');
    return await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        githubId: true,
        githubLogin: true,
        avatarUrl: true,
        email: true,
      },
    });
  }

  issueAuthCookies(res: Response, userId: string, githubId: string) {
    const accessTtl = process.env.JWT_EXPIRES_IN ?? DEFAULT_ACCESS_TTL;
    const refreshTtl =
      process.env.JWT_REFRESH_EXPIRES_IN ?? DEFAULT_REFRESH_TTL;
    const fallbackAccessSeconds = 15 * 60;
    const fallbackRefreshSeconds = 30 * 24 * 60 * 60;
    const accessTtlSeconds =
      this.parseDurationToSeconds(accessTtl) ?? fallbackAccessSeconds;
    const refreshTtlSeconds =
      this.parseDurationToSeconds(refreshTtl) ?? fallbackRefreshSeconds;

    const accessToken = this.jwtService.sign(
      { sub: userId, githubId, tokenType: 'access' } satisfies JwtPayload,
      { expiresIn: accessTtlSeconds },
    );
    const refreshToken = this.jwtService.sign(
      { sub: userId, githubId, tokenType: 'refresh' } satisfies JwtPayload,
      { expiresIn: refreshTtlSeconds },
    );

    this.cookieService.issueAuthCookies(
      res,
      accessToken,
      refreshToken,
      accessTtl,
      refreshTtl,
    );
  }

  clearAuthCookies(res: Response) {
    this.cookieService.clearAuthCookies(res);
  }

  private async exchangeCodeForToken(code: string, redirectUri?: string) {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new UnauthorizedException('GitHub OAuth not configured');
    }

    const response = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
        }),
      },
    );

    if (!response.ok) {
      throw new UnauthorizedException('GitHub token exchange failed');
    }

    const payload = (await response.json()) as {
      access_token?: string;
      error?: string;
      error_description?: string;
    };

    if (!payload.access_token) {
      throw new UnauthorizedException(
        payload.error_description ?? 'Invalid GitHub code',
      );
    }

    return payload.access_token;
  }

  private async fetchGithubUser(accessToken: string) {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'momentum-backend',
        Accept: 'application/vnd.github+json',
      },
    });

    if (!response.ok) {
      throw new UnauthorizedException('Failed to fetch GitHub profile');
    }

    return (await response.json()) as GithubUserResponseDto;
  }

  private async fetchPrimaryEmail(
    accessToken: string,
    fallbackEmail: string | null,
  ) {
    const response = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'momentum-backend',
        Accept: 'application/vnd.github+json',
      },
    });

    if (!response.ok) {
      return fallbackEmail;
    }

    const emails = (await response.json()) as GithubEmailsResponseDto;
    const primary = emails.find((email) => email.primary && email.verified);
    return primary?.email ?? fallbackEmail;
  }

  private async verifyToken(
    token: string,
    tokenType: JwtPayload['tokenType'],
  ): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      if (payload.tokenType !== tokenType) {
        throw new UnauthorizedException('Invalid token type');
      }
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private parseDurationToSeconds(duration: string): number | undefined {
    const trimmed = duration.trim();
    const match = /^([0-9]+)\s*([smhd])$/.exec(trimmed);
    if (!match) {
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? parsed : undefined;
    }

    const value = Number(match[1]);
    const unit = match[2];
    const multiplier =
      unit === 's' ? 1 : unit === 'm' ? 60 : unit === 'h' ? 3600 : 86400;
    return value * multiplier;
  }
}
