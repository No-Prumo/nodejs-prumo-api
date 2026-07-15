import { Module } from '@nestjs/common';
import { emailConfig, type EmailConfig } from '@config';
import { ACCOUNTS_REPOSITORY } from './application/ports/accounts.repository';
import { AUTH_SESSIONS_REPOSITORY } from './application/ports/auth-sessions.repository';
import { EMAIL_GATEWAY } from './application/ports/email-gateway';
import { EXTERNAL_IDENTITIES_REPOSITORY } from './application/ports/external-identities.repository';
import { GOOGLE_ID_TOKEN_VERIFIER } from './application/ports/google-id-token-verifier';
import { MAGIC_LINK_CHALLENGES_REPOSITORY } from './application/ports/magic-link-challenges.repository';
import { MagicLinkUrlBuilder } from './application/services/email/magic-link-url.builder';
import { MagicLinkTokenService } from './application/services/tokens/magic-link-token.service';
import { RefreshTokenHasher } from './application/services/tokens/refresh-token-hasher';
import { TokenService } from './application/services/tokens/token.service';
import { ConsumeMagicLinkUseCase } from './application/use-cases/consume-magic-link/consume-magic-link.use-case';
import { CreateAuthSessionUseCase } from './application/use-cases/create-auth-session/create-auth-session.use-case';
import { GetCurrentAuthSessionUseCase } from './application/use-cases/get-current-auth-session/get-current-auth-session.use-case';
import { GoogleSignInUseCase } from './application/use-cases/google-sign-in/google-sign-in.use-case';
import { RefreshAuthSessionUseCase } from './application/use-cases/refresh-auth-session/refresh-auth-session.use-case';
import { RequestMagicLinkUseCase } from './application/use-cases/request-magic-link/request-magic-link.use-case';
import { SignOutAllUseCase } from './application/use-cases/sign-out-all/sign-out-all.use-case';
import { SignOutUseCase } from './application/use-cases/sign-out/sign-out.use-case';
import { createEmailGateway } from './infrastructure/gateways/email/email-gateway.factory';
import { GoogleIdTokenVerifierGateway } from './infrastructure/gateways/google/google-id-token-verifier.gateway';
import { PrismaAccountsRepository } from './infrastructure/persistence/prisma/prisma-accounts.repository';
import { PrismaAuthSessionsRepository } from './infrastructure/persistence/prisma/prisma-auth-sessions.repository';
import { PrismaExternalIdentitiesRepository } from './infrastructure/persistence/prisma/prisma-external-identities.repository';
import { PrismaMagicLinkChallengesRepository } from './infrastructure/persistence/prisma/prisma-magic-link-challenges.repository';
import { ConsumeMagicLinkController } from './presentation/http/consume-magic-link/consume-magic-link.controller';
import { GetCurrentAuthSessionController } from './presentation/http/get-current-auth-session/get-current-auth-session.controller';
import { GoogleSignInController } from './presentation/http/google-sign-in/google-sign-in.controller';
import { RefreshAuthSessionController } from './presentation/http/refresh-auth-session/refresh-auth-session.controller';
import { RequestMagicLinkController } from './presentation/http/request-magic-link/request-magic-link.controller';
import { SignOutAllController } from './presentation/http/sign-out-all/sign-out-all.controller';
import { SignOutController } from './presentation/http/sign-out/sign-out.controller';

@Module({
  controllers: [
    RequestMagicLinkController,
    ConsumeMagicLinkController,
    GoogleSignInController,
    RefreshAuthSessionController,
    SignOutController,
    SignOutAllController,
    GetCurrentAuthSessionController,
  ],
  providers: [
    ConsumeMagicLinkUseCase,
    CreateAuthSessionUseCase,
    GetCurrentAuthSessionUseCase,
    GoogleSignInUseCase,
    MagicLinkUrlBuilder,
    MagicLinkTokenService,
    RefreshAuthSessionUseCase,
    RequestMagicLinkUseCase,
    RefreshTokenHasher,
    SignOutAllUseCase,
    SignOutUseCase,
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
      inject: [emailConfig.KEY],
      useFactory: (settings: EmailConfig) => createEmailGateway(settings),
    },
  ],
  exports: [CreateAuthSessionUseCase, GetCurrentAuthSessionUseCase],
})
class AuthModule {}

export { AuthModule };
