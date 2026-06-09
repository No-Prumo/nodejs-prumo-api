import { Module } from '@nestjs/common';
import { ACCOUNTS_REPOSITORY } from './application/ports/accounts.repository';
import { AUTH_SESSIONS_REPOSITORY } from './application/ports/auth-sessions.repository';
import { RefreshTokenHasher } from './application/services/refresh-token-hasher';
import { TokenService } from './application/services/token.service';
import { CreateAuthSessionUseCase } from './application/use-cases/create-auth-session.use-case';
import { PrismaAccountsRepository } from './infrastructure/persistence/prisma/prisma-accounts.repository';
import { PrismaAuthSessionsRepository } from './infrastructure/persistence/prisma/prisma-auth-sessions.repository';

@Module({
  providers: [
    CreateAuthSessionUseCase,
    RefreshTokenHasher,
    TokenService,
    {
      provide: ACCOUNTS_REPOSITORY,
      useClass: PrismaAccountsRepository,
    },
    {
      provide: AUTH_SESSIONS_REPOSITORY,
      useClass: PrismaAuthSessionsRepository,
    },
  ],
  exports: [CreateAuthSessionUseCase],
})
class AuthModule {}

export { AuthModule };
