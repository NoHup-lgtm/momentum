import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Atrás do proxy do host (Railway/Render/Fly): confia no X-Forwarded-* para
  // pegar o IP real (rate-limit) e o protocolo https (cookies Secure).
  app.set('trust proxy', 1);

  // Cabeçalhos de segurança. É uma API JSON: desliga a CSP padrão (sem HTML
  // próprio) e o COEP (não bloquear recursos cross-origin do cliente).
  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

  app.use(cookieParser());

  // Validação global: rejeita payload malformado, remove props não declaradas
  // (whitelist) e impõe os caps de tamanho dos DTOs. transform converte tipos.
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: false }),
  );

  // CORS: libera o front web (cookies via credentials). Mobile (RN) não passa
  // por CORS. Em PROD defina CORS_ORIGIN (lista por vírgula) — sem ela cai em
  // reflexão de origin, que com credentials é inseguro publicamente.
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? true,
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
