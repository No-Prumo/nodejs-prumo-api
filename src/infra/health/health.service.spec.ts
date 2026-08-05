import type { PrismaService } from '../prisma/prisma.service';
import { HealthService } from './health.service';

describe('HealthService', () => {
  it('reports ready when PostgreSQL accepts a query', async () => {
    const prisma = {
      $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
    } as unknown as PrismaService;
    const service = new HealthService(prisma);

    await expect(service.isReady()).resolves.toBe(true);
  });

  it('reports unavailable when PostgreSQL rejects a query', async () => {
    const prisma = {
      $queryRaw: vi.fn().mockRejectedValue(new Error('database unavailable')),
    } as unknown as PrismaService;
    const service = new HealthService(prisma);

    await expect(service.isReady()).resolves.toBe(false);
  });
});
