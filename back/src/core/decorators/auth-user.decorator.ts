import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { AuthUserDto } from '../dto/auth-user.dto.js';

export const AuthUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthUserDto => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = (request as Request & { user?: AuthUserDto }).user;

    if (!user) {
      throw new UnauthorizedException('User not found on request');
    }

    return user;
  },
);
