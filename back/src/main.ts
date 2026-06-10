import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module.js';

// Origens conhecidas do app — fallback SEGURO quando CORS_ORIGIN não está
// setada em produção (fail-closed; antes caía em refletir qualquer origem,
// o que com credentials habilita requisições autenticadas de qualquer site).
const PROD_ORIGINS = ['https://app.momentu.me', 'https://momentu.me'];

async function bootstrap() {
  const isProd = process.env.NODE_ENV === 'production';

  // Fail-fast: sem segredo forte de JWT o serviço não pode subir — assinar
  // tokens com segredo fraco/ausente comprometeria toda a autenticação.
  const jwtSecret = process.env.JWT_SECRET;
  if (isProd && (!jwtSecret || jwtSecret.length < 32)) {
    throw new Error('JWT_SECRET ausente ou curto demais (mínimo 32 chars) — abortando boot.');
  }

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
  // por CORS. CORS_ORIGIN (lista por vírgula) manda; sem ela, produção cai nas
  // origens conhecidas (fail-closed) e dev libera tudo.
  const corsOrigins = process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()).filter(Boolean);
  app.enableCors({
    origin: corsOrigins?.length ? corsOrigins : isProd ? PROD_ORIGINS : true,
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
