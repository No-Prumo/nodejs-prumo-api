import { Injectable } from '@nestjs/common';
import { authErrorReasons } from '@auth/application/errors/auth-error-reasons';
import { externalIdentityConflict } from '@auth/application/errors/auth-errors';
import { Prisma } from '@generated/prisma/client';
import { PrismaService } from '@infra/prisma/prisma.service';
import type { AuthProvider } from '../../../domain/auth-provider';
import type {
  AccountProviderLookup,
  CreateExternalIdentityData,
  ExternalIdentitiesRepository,
  ExternalIdentityRecord,
  ProviderSubjectLookup,
} from '../../../application/ports/external-identities.repository';
import type { PrismaExternalIdentityRecord } from './prisma-external-identities.repository.types';

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
        throw externalIdentityConflict({
          accountId: data.accountId,
          cause: error,
          action: 'create_external_identity',
          provider: data.provider,
          reason: authErrorReasons.uniqueConstraintViolation,
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
