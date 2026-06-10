import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { databaseConfig, type DatabaseConfig } from '../../config';
import { PrismaClient } from '../../generated/prisma/client';

@Injectable()
class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    @Inject(databaseConfig.KEY)
    databaseSettings: DatabaseConfig,
  ) {
    super({
      adapter: new PrismaPg({
        connectionString: databaseSettings.url,
      }),
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

export { PrismaService };
