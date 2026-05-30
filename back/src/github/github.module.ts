import { Module } from '@nestjs/common';
import { GithubController } from './github.controller.js';
import { GithubService } from './github.service.js';
import { UserModule } from '../user/user.module.js';

@Module({
  imports: [UserModule], // usa UserService para devolver o /me no sync
  controllers: [GithubController],
  providers: [GithubService],
})
export class GithubModule {}
