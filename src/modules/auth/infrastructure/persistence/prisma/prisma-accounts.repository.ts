import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../infra/prisma/prisma.service';
import type {
  AccountRecord,
  AccountsRepository,
  CreateAccountData,
} from '../../../application/ports/accounts.repository';

type PrismaAccountRecord = {
  id: string;
  email: string;
  normalizedEmail: string;
  displayName: string | null;
  status: 'ACTIVE' | 'BLOCKED' | 'DISABLED';
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
class PrismaAccountsRepository implements AccountsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAccountData): Promise<AccountRecord> {
    const account = await this.prisma.account.create({
      data: {
        email: data.email,
        normalizedEmail: data.normalizedEmail,
        displayName: data.displayName,
      },
    });

    return this.mapAccount(account);
  }

  async findById(id: string): Promise<AccountRecord | null> {
    const account = await this.prisma.account.findUnique({
      where: { id },
    });

    return account ? this.mapAccount(account) : null;
  }

  async findByNormalizedEmail(
    normalizedEmail: string,
  ): Promise<AccountRecord | null> {
    const account = await this.prisma.account.findUnique({
      where: { normalizedEmail },
    });

    return account ? this.mapAccount(account) : null;
  }

  private mapAccount(account: PrismaAccountRecord): AccountRecord {
    return {
      id: account.id,
      email: account.email,
      normalizedEmail: account.normalizedEmail,
      displayName: account.displayName,
      status: account.status.toLowerCase() as AccountRecord['status'],
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }
}

export { PrismaAccountsRepository };
