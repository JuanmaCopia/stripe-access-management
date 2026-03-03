import type {
  Adapter,
  AdapterAccount,
  AdapterSession,
  AdapterUser,
  VerificationToken
} from "next-auth/adapters";
import type { DatabaseClient } from "@stripe-access-management/database";

const userSelect = {
  email: true,
  emailVerified: true,
  id: true,
  image: true,
  name: true
} as const;

const sessionSelect = {
  expires: true,
  sessionToken: true,
  userId: true
} as const;

const sessionWithUserSelect = {
  ...sessionSelect,
  user: {
    select: userSelect
  }
} as const;

const accountWithUserSelect = {
  user: {
    select: userSelect
  }
} as const;

const verificationTokenSelect = {
  expires: true,
  identifier: true,
  token: true
} as const;

export interface PrismaAuthAdapterOptions {
  database: DatabaseClient;
}

export function createPrismaAuthAdapter(
  options: PrismaAuthAdapterOptions
): Adapter {
  const { database } = options;

  return {
    async createSession(session: AdapterSession) {
      const created = await database.session.create({
        data: {
          expires: session.expires,
          sessionToken: session.sessionToken,
          userId: session.userId
        },
        select: sessionSelect
      });

      return mapSession(created);
    },

    async createUser(user: Omit<AdapterUser, "id">) {
      const created = await database.user.create({
        data: {
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image ?? null,
          name: user.name ?? null
        },
        select: userSelect
      });

      return mapUser(created);
    },

    async createVerificationToken(verificationToken) {
      const created = await database.verificationToken.create({
        data: {
          expires: verificationToken.expires,
          identifier: verificationToken.identifier,
          token: verificationToken.token
        },
        select: verificationTokenSelect
      });

      return mapVerificationToken(created);
    },

    async deleteSession(sessionToken: string) {
      const existing = await database.session.findUnique({
        select: sessionSelect,
        where: {
          sessionToken
        }
      });

      if (!existing) {
        return null;
      }

      await database.session.delete({
        where: {
          sessionToken
        }
      });

      return mapSession(existing);
    },

    async getSessionAndUser(sessionToken: string) {
      const session = await database.session.findUnique({
        select: sessionWithUserSelect,
        where: {
          sessionToken
        }
      });

      if (!session) {
        return null;
      }

      return {
        session: mapSession(session),
        user: mapUser(session.user)
      };
    },

    async getUser(id: string) {
      const user = await database.user.findUnique({
        select: userSelect,
        where: {
          id
        }
      });

      return user ? mapUser(user) : null;
    },

    async getUserByAccount({
      provider,
      providerAccountId
    }: Pick<AdapterAccount, "provider" | "providerAccountId">) {
      const account = await database.account.findUnique({
        select: accountWithUserSelect,
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId
          }
        }
      });

      return account?.user ? mapUser(account.user) : null;
    },

    async getUserByEmail(email: string) {
      const user = await database.user.findUnique({
        select: userSelect,
        where: {
          email
        }
      });

      return user ? mapUser(user) : null;
    },

    async linkAccount(account: AdapterAccount) {
      await database.account.upsert({
        create: mapAccountData(account),
        update: mapAccountData(account),
        where: {
          provider_providerAccountId: {
            provider: account.provider,
            providerAccountId: account.providerAccountId
          }
        }
      });

      return account;
    },

    async updateSession(
      session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">
    ) {
      const existing = await database.session.findUnique({
        select: sessionSelect,
        where: {
          sessionToken: session.sessionToken
        }
      });

      if (!existing) {
        return null;
      }

      const updated = await database.session.update({
        data: {
          expires: session.expires ?? existing.expires,
          userId: session.userId ?? existing.userId
        },
        select: sessionSelect,
        where: {
          sessionToken: session.sessionToken
        }
      });

      return mapSession(updated);
    },

    async updateUser(user: Partial<AdapterUser> & Pick<AdapterUser, "id">) {
      const updated = await database.user.update({
        data: {
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image ?? null,
          name: user.name ?? null
        },
        select: userSelect,
        where: {
          id: user.id
        }
      });

      return mapUser(updated);
    },

    async useVerificationToken({
      identifier,
      token
    }: Pick<VerificationToken, "identifier" | "token">) {
      const existing = await database.verificationToken.findUnique({
        select: verificationTokenSelect,
        where: {
          identifier_token: {
            identifier,
            token
          }
        }
      });

      if (!existing) {
        return null;
      }

      await database.verificationToken.delete({
        where: {
          identifier_token: {
            identifier,
            token
          }
        }
      });

      return mapVerificationToken(existing);
    }
  };
}

function mapAccountData(account: AdapterAccount) {
  return {
    access_token: account.access_token ?? null,
    expires_at: account.expires_at ?? null,
    id_token: account.id_token ?? null,
    provider: account.provider,
    providerAccountId: account.providerAccountId,
    refresh_token: account.refresh_token ?? null,
    scope: account.scope ?? null,
    session_state:
      typeof account.session_state === "string" ? account.session_state : null,
    token_type: account.token_type ?? null,
    type: account.type,
    userId: account.userId
  };
}

function mapSession(record: {
  expires: Date;
  sessionToken: string;
  userId: string;
}): AdapterSession {
  return {
    expires: record.expires,
    sessionToken: record.sessionToken,
    userId: record.userId
  };
}

function mapUser(record: {
  email: string | null;
  emailVerified: Date | null;
  id: string;
  image: string | null;
  name: string | null;
}): AdapterUser {
  if (!record.email) {
    throw new Error(`Auth user ${record.id} is missing a required email.`);
  }

  return {
    email: record.email,
    emailVerified: record.emailVerified,
    id: record.id,
    image: record.image,
    name: record.name
  };
}

function mapVerificationToken(record: {
  expires: Date;
  identifier: string;
  token: string;
}): VerificationToken {
  return {
    expires: record.expires,
    identifier: record.identifier,
    token: record.token
  };
}
