const BETA_INVITATIONS_REPOSITORY = Symbol('BETA_INVITATIONS_REPOSITORY');

type BetaInvitationsRepository = {
  isActiveByNormalizedEmail(normalizedEmail: string): Promise<boolean>;
};

export { BETA_INVITATIONS_REPOSITORY };
export type { BetaInvitationsRepository };
