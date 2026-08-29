import { config as loadEnv } from 'dotenv';
import { expand } from 'dotenv-expand';
import { PrismaPg } from '@prisma/adapter-pg';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { z } from 'zod';
import { PrismaClient } from '@generated/prisma/client';
import { normalizeEmail } from '@auth/application/services/email/normalize-email';

const supportedActions = ['invite', 'revoke', 'locate', 'delete-data'] as const;
const testerEmailSchema = z.string().email();
type BetaTesterAction = (typeof supportedActions)[number];

expand(loadEnv());

async function main() {
  const action = parseAction(process.argv[2]);
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  const prompt = createInterface({ input: stdin, output: stdout });
  const normalizedEmail = normalizeEmail(
    await prompt.question('Tester email: '),
  );

  if (!testerEmailSchema.safeParse(normalizedEmail).success) {
    prompt.close();
    throw new Error('Tester email is required');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });

  try {
    switch (action) {
      case 'invite':
        await inviteTester(prisma, normalizedEmail);
        break;
      case 'revoke':
        await revokeTester(prisma, normalizedEmail);
        break;
      case 'locate':
        await locateTesterData(prisma, normalizedEmail);
        break;
      case 'delete-data': {
        const confirmation = await prompt.question(
          'Type DELETE to confirm permanent removal: ',
        );

        if (confirmation !== 'DELETE') {
          stdout.write('Operation canceled.\n');
          break;
        }

        await deleteTesterData(prisma, normalizedEmail);
        break;
      }
    }
  } finally {
    prompt.close();
    await prisma.$disconnect();
  }
}

function parseAction(value: string | undefined): BetaTesterAction {
  if (supportedActions.includes(value as BetaTesterAction)) {
    return value as BetaTesterAction;
  }

  throw new Error(`Expected one action: ${supportedActions.join(', ')}`);
}

async function inviteTester(prisma: PrismaClient, normalizedEmail: string) {
  await prisma.betaInvitation.upsert({
    where: { normalizedEmail },
    create: { normalizedEmail },
    update: { revokedAt: null },
  });

  stdout.write('Beta invitation is active.\n');
}

async function revokeTester(prisma: PrismaClient, normalizedEmail: string) {
  const revokedAt = new Date();
  const result = await prisma.$transaction(async (transaction) => {
    const invitation = await transaction.betaInvitation.updateMany({
      where: { normalizedEmail, revokedAt: null },
      data: { revokedAt },
    });
    const challenges = await transaction.magicLinkChallenge.updateMany({
      where: { email: normalizedEmail, usedAt: null, revokedAt: null },
      data: { revokedAt },
    });
    const account = await transaction.account.findUnique({
      where: { normalizedEmail },
      select: { id: true },
    });

    if (!account) {
      return {
        invitations: invitation.count,
        challenges: challenges.count,
        sessions: 0,
      };
    }

    const sessions = await transaction.authSession.findMany({
      where: { accountId: account.id, status: 'ACTIVE', revokedAt: null },
      select: { id: true },
    });
    const sessionIds = sessions.map((session) => session.id);

    if (sessionIds.length > 0) {
      await transaction.authSession.updateMany({
        where: { id: { in: sessionIds } },
        data: { status: 'REVOKED', revokedAt },
      });
      await transaction.authRefreshToken.updateMany({
        where: { sessionId: { in: sessionIds }, revokedAt: null },
        data: { status: 'REVOKED', revokedAt },
      });
    }

    return {
      invitations: invitation.count,
      challenges: challenges.count,
      sessions: sessionIds.length,
    };
  });

  stdout.write(
    `Access revoked: ${result.invitations} invitation(s), ${result.challenges} challenge(s), ${result.sessions} session(s).\n`,
  );
}

async function locateTesterData(prisma: PrismaClient, normalizedEmail: string) {
  const [invitation, challenges, account] = await Promise.all([
    prisma.betaInvitation.count({ where: { normalizedEmail } }),
    prisma.magicLinkChallenge.count({ where: { email: normalizedEmail } }),
    prisma.account.findUnique({
      where: { normalizedEmail },
      select: {
        _count: { select: { authSessions: true, externalIdentities: true } },
        playerProfile: { select: { id: true } },
      },
    }),
  ]);

  stdout.write(
    `Data found: ${invitation} invitation(s), ${challenges} challenge(s), ${account ? 1 : 0} account(s), ${account?._count.authSessions ?? 0} session(s), ${account?._count.externalIdentities ?? 0} external identity record(s), ${account?.playerProfile ? 1 : 0} player profile(s).\n`,
  );
}

async function deleteTesterData(prisma: PrismaClient, normalizedEmail: string) {
  const result = await prisma.$transaction(async (transaction) => {
    const challenges = await transaction.magicLinkChallenge.deleteMany({
      where: { email: normalizedEmail },
    });
    const invitations = await transaction.betaInvitation.deleteMany({
      where: { normalizedEmail },
    });
    const accounts = await transaction.account.deleteMany({
      where: { normalizedEmail },
    });

    return {
      challenges: challenges.count,
      invitations: invitations.count,
      accounts: accounts.count,
    };
  });

  stdout.write(
    `Data deleted: ${result.invitations} invitation(s), ${result.challenges} challenge(s), ${result.accounts} account(s); related account records were removed by database cascades.\n`,
  );
}

void main().catch(() => {
  process.stderr.write('Beta tester operation failed.\n');
  process.exitCode = 1;
});
