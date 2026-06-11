import { Module } from '@nestjs/common';
import { ACCOUNTS_REPOSITORY } from './application/ports/accounts.repository';
import { AUTH_SESSIONS_REPOSITORY } from './application/ports/auth-sessions.repository';
import { EMAIL_GATEWAY } from './application/ports/email-gateway';
import { EXTERNAL_IDENTITIES_REPOSITORY } from './application/ports/external-identities.repository';
import { GOOGLE_ID_TOKEN_VERIFIER } from './application/ports/google-id-token-verifier';
import { MAGIC_LINK_CHALLENGES_REPOSITORY } from './application/ports/magic-link-challenges.repository';
import { MagicLinkTokenService } from './application/services/tokens/magic-link-token.service';
import { RefreshTokenHasher } from './application/services/tokens/refresh-token-hasher';
import { TokenService } from './application/services/tokens/token.service';
import { ConsumeMagicLinkUseCase } from './application/use-cases/consume-magic-link/consume-magic-link.use-case';
import { CreateAuthSessionUseCase } from './application/use-cases/create-auth-session/create-auth-session.use-case';
import { GoogleSignInUseCase } from './application/use-cases/google-sign-in/google-sign-in.use-case';
import { RequestMagicLinkUseCase } from './application/use-cases/request-magic-link/request-magic-link.use-case';
import { DevelopmentEmailGateway } from './infrastructure/gateways/email/development-email.gateway';
import { GoogleIdTokenVerifierGateway } from './infrastructure/gateways/google/google-id-token-verifier.gateway';
import { PrismaAccountsRepository } from './infrastructure/persistence/prisma/prisma-accounts.repository';
import { PrismaAuthSessionsRepository } from './infrastructure/persistence/prisma/prisma-auth-sessions.repository';
import { PrismaExternalIdentitiesRepository } from './infrastructure/persistence/prisma/prisma-external-identities.repository';
import { PrismaMagicLinkChallengesRepository } from './infrastructure/persistence/prisma/prisma-magic-link-challenges.repository';
import { ConsumeMagicLinkController } from './presentation/http/consume-magic-link/consume-magic-link.controller';
import { GoogleSignInController } from './presentation/http/google-sign-in/google-sign-in.controller';
import { RequestMagicLinkController } from './presentation/http/request-magic-link/request-magic-link.controller';

@Module({
  controllers: [
    RequestMagicLinkController,
    ConsumeMagicLinkController,
    GoogleSignInController,
  ],
  providers: [
    ConsumeMagicLinkUseCase,
    CreateAuthSessionUseCase,
    GoogleSignInUseCase,
    MagicLinkTokenService,
    RequestMagicLinkUseCase,
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
    {
      provide: EXTERNAL_IDENTITIES_REPOSITORY,
      useClass: PrismaExternalIdentitiesRepository,
    },
    {
      provide: GOOGLE_ID_TOKEN_VERIFIER,
      useClass: GoogleIdTokenVerifierGateway,
    },
    {
      provide: MAGIC_LINK_CHALLENGES_REPOSITORY,
      useClass: PrismaMagicLinkChallengesRepository,
    },
    {
      provide: EMAIL_GATEWAY,
      useClass: DevelopmentEmailGateway,
    },
  ],
  exports: [CreateAuthSessionUseCase],
})
class AuthModule {}

export { AuthModule };
