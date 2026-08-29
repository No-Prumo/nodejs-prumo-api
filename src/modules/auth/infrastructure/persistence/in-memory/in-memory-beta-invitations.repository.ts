import type { BetaInvitationsRepository } from '../../../application/ports/beta-invitations.repository';

type InMemoryBetaInvitation = {
  normalizedEmail: string;
  revokedAt: Date | null;
};

class InMemoryBetaInvitationsRepository implements BetaInvitationsRepository {
  readonly betaInvitations: InMemoryBetaInvitation[] = [];

  isActiveByNormalizedEmail(normalizedEmail: string): Promise<boolean> {
    return Promise.resolve(
      this.betaInvitations.some(
        (invitation) =>
          invitation.normalizedEmail === normalizedEmail &&
          invitation.revokedAt === null,
      ),
    );
  }

  invite(normalizedEmail: string): void {
    const existingInvitation = this.betaInvitations.find(
      (invitation) => invitation.normalizedEmail === normalizedEmail,
    );

    if (existingInvitation) {
      existingInvitation.revokedAt = null;
      return;
    }

    this.betaInvitations.push({ normalizedEmail, revokedAt: null });
  }

  revoke(normalizedEmail: string, revokedAt = new Date()): void {
    const invitation = this.betaInvitations.find(
      (candidate) => candidate.normalizedEmail === normalizedEmail,
    );

    if (invitation) {
      invitation.revokedAt = revokedAt;
    }
  }
}

export { InMemoryBetaInvitationsRepository };
