import type { DatabaseClient } from "@stripe-access-management/database";

const authUserSelect = {
  email: true,
  emailVerified: true,
  id: true,
  image: true,
  name: true
} as const;

export interface AuthProviderAccountReference {
  provider: string;
  providerAccountId: string;
  type: string;
}

export interface AuthProviderProfile {
  email: string | null;
  imageUrl: string | null;
  name: string | null;
}

export interface AuthUserRecord {
  email: string | null;
  emailVerifiedAt: Date | null;
  id: string;
  imageUrl: string | null;
  name: string | null;
}

export interface SyncAuthUserFromProviderInput {
  account: AuthProviderAccountReference;
  profile: AuthProviderProfile;
}

export interface PrismaAuthScaffoldingStoreOptions {
  database: DatabaseClient;
}

export class PrismaAuthScaffoldingStore {
  private readonly database: DatabaseClient;

  constructor(options: PrismaAuthScaffoldingStoreOptions) {
    this.database = options.database;
  }

  async findUserByEmail(email: string): Promise<AuthUserRecord | null> {
    const user = await this.database.user.findUnique({
      select: authUserSelect,
      where: {
        email
      }
    });

    return user ? mapAuthUserRecord(user) : null;
  }

  async findUserByProviderAccount(
    account: AuthProviderAccountReference
  ): Promise<AuthUserRecord | null> {
    const linkedAccount = await this.database.account.findUnique({
      select: {
        user: {
          select: authUserSelect
        }
      },
      where: {
        provider_providerAccountId: {
          provider: account.provider,
          providerAccountId: account.providerAccountId
        }
      }
    });

    return linkedAccount?.user ? mapAuthUserRecord(linkedAccount.user) : null;
  }

  async syncUserFromProvider(
    input: SyncAuthUserFromProviderInput
  ): Promise<AuthUserRecord> {
    return this.database.$transaction(async (transaction) => {
      const existingLinkedAccount = await transaction.account.findUnique({
        select: {
          user: {
            select: authUserSelect
          }
        },
        where: {
          provider_providerAccountId: {
            provider: input.account.provider,
            providerAccountId: input.account.providerAccountId
          }
        }
      });

      if (existingLinkedAccount?.user) {
        const updatedUser = await transaction.user.update({
          data: buildAuthUserProfileUpdate(input.profile),
          select: authUserSelect,
          where: {
            id: existingLinkedAccount.user.id
          }
        });

        return mapAuthUserRecord(updatedUser);
      }

      const existingByEmail =
        input.profile.email === null
          ? null
          : await transaction.user.findUnique({
              select: authUserSelect,
              where: {
                email: input.profile.email
              }
            });
      const user = existingByEmail
        ? await transaction.user.update({
            data: buildAuthUserProfileUpdate(input.profile),
            select: authUserSelect,
            where: {
              id: existingByEmail.id
            }
          })
        : await transaction.user.create({
            data: {
              email: input.profile.email,
              image: input.profile.imageUrl,
              name: input.profile.name
            },
            select: authUserSelect
          });

      await transaction.account.upsert({
        create: {
          provider: input.account.provider,
          providerAccountId: input.account.providerAccountId,
          type: input.account.type,
          userId: user.id
        },
        update: {
          type: input.account.type,
          userId: user.id
        },
        where: {
          provider_providerAccountId: {
            provider: input.account.provider,
            providerAccountId: input.account.providerAccountId
          }
        }
      });

      return mapAuthUserRecord(user);
    });
  }
}

function mapAuthUserRecord(record: {
  email: string | null;
  emailVerified: Date | null;
  id: string;
  image: string | null;
  name: string | null;
}): AuthUserRecord {
  return {
    email: record.email,
    emailVerifiedAt: record.emailVerified,
    id: record.id,
    imageUrl: record.image,
    name: record.name
  };
}

function buildAuthUserProfileUpdate(profile: AuthProviderProfile) {
  return {
    email: profile.email,
    image: profile.imageUrl,
    name: profile.name
  };
}
