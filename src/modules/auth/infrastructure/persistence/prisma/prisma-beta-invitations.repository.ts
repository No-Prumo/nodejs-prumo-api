import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infra/prisma/prisma.service';
import type { BetaInvitationsRepository } from '../../../application/ports/beta-invitations.repository';

@Injectable()
class PrismaBetaInvitationsRepository implements BetaInvitationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async isActiveByNormalizedEmail(normalizedEmail: string): Promise<boolean> {
    const invitation = await this.prisma.betaInvitation.findUnique({
      where: { normalizedEmail },
      select: { revokedAt: true },
    });

    return invitation !== null && invitation.revokedAt === null;
  }
}

export { PrismaBetaInvitationsRepository };
