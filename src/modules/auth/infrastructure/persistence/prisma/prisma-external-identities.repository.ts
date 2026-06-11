import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../infra/prisma/prisma.service';
import { AppError } from '../../../../../shared/errors/app-error';
import { Prisma } from '../../../../../generated/prisma/client';
import type { AuthProvider } from '../../../domain/auth-provider';
import type {
  AccountProviderLookup,
  CreateExternalIdentityData,
  ExternalIdentitiesRepository,
  ExternalIdentityRecord,
  ProviderSubjectLookup,
} from '../../../application/ports/external-identities.repository';

type PrismaExternalIdentityRecord = {
  id: string;
  accountId: string;
  provider: 'GOOGLE';
  providerSubject: string;
  createdAt: Date;
};

@Injectable()
class PrismaExternalIdentitiesRepository implements ExternalIdentitiesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: CreateExternalIdentityData,
  ): Promise<ExternalIdentityRecord> {
    try {
      const identity = await this.prisma.externalIdentity.create({
        data: {
          accountId: data.accountId,
          provider: this.mapProviderToPrisma(data.provider),
          providerSubject: data.providerSubject,
        },
      });

      return this.mapIdentity(identity);
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw new AppError('conflict', 'External identity is already linked', {
          cause: error,
          details: {
            accountId: data.accountId,
            provider: data.provider,
          },
        });
      }

      throw error;
    }
  }

  async findByAccountAndProvider(
    lookup: AccountProviderLookup,
  ): Promise<ExternalIdentityRecord | null> {
    const identity = await this.prisma.externalIdentity.findUnique({
      where: {
        accountId_provider: {
          accountId: lookup.accountId,
          provider: this.mapProviderToPrisma(lookup.provider),
        },
      },
    });

    return identity ? this.mapIdentity(identity) : null;
  }

  async findByProviderAndSubject(
    lookup: ProviderSubjectLookup,
  ): Promise<ExternalIdentityRecord | null> {
    const identity = await this.prisma.externalIdentity.findUnique({
      where: {
        provider_providerSubject: {
          provider: this.mapProviderToPrisma(lookup.provider),
          providerSubject: lookup.providerSubject,
        },
      },
    });

    return identity ? this.mapIdentity(identity) : null;
  }

  private mapIdentity(
    identity: PrismaExternalIdentityRecord,
  ): ExternalIdentityRecord {
    return {
      id: identity.id,
      accountId: identity.accountId,
      provider: identity.provider.toLowerCase() as AuthProvider,
      providerSubject: identity.providerSubject,
      createdAt: identity.createdAt,
    };
  }

  private mapProviderToPrisma(
    provider: AuthProvider,
  ): PrismaExternalIdentityRecord['provider'] {
    return provider.toUpperCase() as PrismaExternalIdentityRecord['provider'];
  }
}

function isUniqueConstraintError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

export { PrismaExternalIdentitiesRepository };
