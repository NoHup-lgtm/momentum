import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { UserModule } from './user/user.module.js';
import { GithubModule } from './github/github.module.js';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, GithubModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
