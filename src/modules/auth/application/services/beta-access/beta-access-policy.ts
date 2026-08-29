import { Inject, Injectable } from '@nestjs/common';
import {
  BETA_INVITATIONS_REPOSITORY,
  type BetaInvitationsRepository,
} from '../../ports/beta-invitations.repository';
import { normalizeEmail } from '../email/normalize-email';

@Injectable()
class BetaAccessPolicy {
  constructor(
    @Inject(BETA_INVITATIONS_REPOSITORY)
    private readonly betaInvitationsRepository: BetaInvitationsRepository,
  ) {}

  isEligible(email: string): Promise<boolean> {
    return this.betaInvitationsRepository.isActiveByNormalizedEmail(
      normalizeEmail(email),
    );
  }
}

export { BetaAccessPolicy };
