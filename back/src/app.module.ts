import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UserModule } from './user/user.module.js';
import { GithubModule } from './github/github.module.js';
import { SquadModule } from './squad/squad.module.js';
import { ChallengeModule } from './challenge/challenge.module.js';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, GithubModule, SquadModule, ChallengeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
