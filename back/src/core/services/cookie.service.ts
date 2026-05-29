import { Injectable } from '@nestjs/common';
import type { Response } from 'express';

@Injectable()
export class CookieService {
  issueAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
    accessTtl: string,
    refreshTtl: string,
  ) {
    const baseCookieOptions = {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      domain: process.env.COOKIE_DOMAIN || undefined,
    };

    res.cookie('access_token', accessToken, {
      ...baseCookieOptions,
      maxAge: this.parseDurationToMs(accessTtl),
    });
    res.cookie('refresh_token', refreshToken, {
      ...baseCookieOptions,
      maxAge: this.parseDurationToMs(refreshTtl),
    });
  }

  clearAuthCookies(res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
  }

  private parseDurationToMs(duration: string) {
    const trimmed = duration.trim();
    const match = /^([0-9]+)\s*([smhd])$/.exec(trimmed);
    if (!match) {
      const parsed = Number(trimmed);
      return Number.isFinite(parsed) ? parsed * 1000 : undefined;
    }

    const value = Number(match[1]);
    const unit = match[2];
    const multiplier =
      unit === 's'
        ? 1000
        : unit === 'm'
          ? 60000
          : unit === 'h'
            ? 3600000
            : 86400000;
    return value * multiplier;
  }
}
