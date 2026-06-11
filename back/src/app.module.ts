import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UserModule } from './user/user.module.js';
import { GithubModule } from './github/github.module.js';
import { SquadModule } from './squad/squad.module.js';
import { ChallengeModule } from './challenge/challenge.module.js';
import { LeaderboardModule } from './leaderboard/leaderboard.module.js';
import { AchievementModule } from './achievement/achievement.module.js';
import { ShopModule } from './shop/shop.module.js';
import { LigaModule } from './liga/liga.module.js';
import { FeedModule } from './feed/feed.module.js';
import { FriendModule } from './friend/friend.module.js';
import { PushModule } from './push/push.module.js';
import { ModerationModule } from './moderation/moderation.module.js';

@Module({
  imports: [
    // Rate limit global: 120 req/min por IP (generoso p/ uso legítimo — a Home
    // dispara ~5 no load — mas corta brute-force/spam/abuso). Em prod atrás de
    // proxy, habilitar trust proxy p/ o IP real.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    // DISABLE_CRON=1 desliga os jobs agendados (liga/streak/push) — útil para
    // rodar uma instância de teste/efêmera sem disparar escritas em segundo plano.
    ...(process.env.DISABLE_CRON === '1' ? [] : [ScheduleModule.forRoot()]),
    PrismaModule, AuthModule, UserModule, GithubModule, SquadModule, ChallengeModule, LeaderboardModule, AchievementModule, ShopModule, LigaModule, FeedModule, FriendModule, PushModule, ModerationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
