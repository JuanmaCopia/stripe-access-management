import {
  ConsoleAppLogger,
  PrismaAuthScaffoldingStore,
  createPrismaAuthAdapter,
  loadAuthRuntimeConfig,
  requireGoogleOAuthRuntimeConfig,
  type AppLogger,
  type AuthProviderProfile
} from "@stripe-access-management/infrastructure";
import {
  getDatabaseClient,
  type DatabaseClient
} from "@stripe-access-management/database";
import type { Account, NextAuthOptions, Profile, User } from "next-auth";
import type { AdapterUser } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";

export type GoogleAccountLike = Account & {
  provider: "google";
  providerAccountId: string;
  type: "oauth";
};

export interface WebAuthDependencies {
  authStore: Pick<PrismaAuthScaffoldingStore, "syncUserFromProvider">;
  database: DatabaseClient;
  logger?: AppLogger | null;
  runtimeConfig: {
    authSecret: string;
    googleClientId: string;
    googleClientSecret: string;
  };
}

export function createWebAuthOptions(
  dependencies: WebAuthDependencies
): NextAuthOptions {
  return {
    adapter: createPrismaAuthAdapter({
      database: dependencies.database
    }),
    callbacks: {
      async session({ session, user }) {
        if (!session.user) {
          return session;
        }

        return {
          ...session,
          user: {
            email: user.email,
            id: user.id,
            image: user.image,
            name: user.name
          }
        };
      },
      signIn: createGoogleSignInCallback({
        authStore: dependencies.authStore,
        logger: dependencies.logger
      })
    },
    pages: {
      signIn: "/signin"
    },
    providers: [
      GoogleProvider({
        clientId: dependencies.runtimeConfig.googleClientId,
        clientSecret: dependencies.runtimeConfig.googleClientSecret
      })
    ],
    secret: dependencies.runtimeConfig.authSecret,
    session: {
      strategy: "database"
    }
  };
}

export function createWebAuthOptionsFromEnv(): NextAuthOptions {
  const authRuntimeConfig = loadAuthRuntimeConfig();
  const googleRuntimeConfig =
    requireGoogleOAuthRuntimeConfig(authRuntimeConfig);
  const logger = new ConsoleAppLogger({
    level: process.env.NODE_ENV === "development" ? "debug" : "info"
  });
  const database = getDatabaseClient();

  return createWebAuthOptions({
    authStore: new PrismaAuthScaffoldingStore({
      database
    }),
    database,
    logger,
    runtimeConfig: {
      authSecret: authRuntimeConfig.authSecret,
      googleClientId: googleRuntimeConfig.clientId,
      googleClientSecret: googleRuntimeConfig.clientSecret
    }
  });
}

export function createGoogleSignInCallback(input: {
  authStore: Pick<PrismaAuthScaffoldingStore, "syncUserFromProvider">;
  logger?: AppLogger | null;
}) {
  return async ({
    account,
    profile,
    user
  }: {
    account: Account | null;
    profile?: Profile;
    user: AdapterUser | User;
  }): Promise<boolean> => {
    if (!isGoogleOAuthAccount(account)) {
      return false;
    }

    const normalizedProfile = normalizeGoogleProfile({
      profile,
      user
    });

    if (!normalizedProfile.email) {
      input.logger?.warn("Rejected Google sign-in without an email address", {
        providerAccountId: account.providerAccountId
      });
      return false;
    }

    await input.authStore.syncUserFromProvider({
      account: {
        accessToken: account.access_token ?? null,
        expiresAt: account.expires_at ?? null,
        idToken: account.id_token ?? null,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        refreshToken: account.refresh_token ?? null,
        scope: account.scope ?? null,
        sessionState: account.session_state ?? null,
        tokenType: account.token_type ?? null,
        type: account.type
      },
      profile: normalizedProfile
    });
    input.logger?.info("Linked Google sign-in to a local user", {
      email: normalizedProfile.email,
      providerAccountId: account.providerAccountId
    });

    return true;
  };
}

export function normalizeGoogleProfile(input: {
  profile?: Profile | null;
  user: Pick<AdapterUser, "email" | "image" | "name"> | Pick<User, "email" | "image" | "name">;
}): AuthProviderProfile {
  return {
    email: readProfileValue(input.profile, "email") ?? input.user.email ?? null,
    imageUrl:
      readProfileValue(input.profile, "picture") ?? input.user.image ?? null,
    name: readProfileValue(input.profile, "name") ?? input.user.name ?? null
  };
}

function isGoogleOAuthAccount(account: Account | null): account is GoogleAccountLike {
  return Boolean(
    account &&
      account.provider === "google" &&
      account.type === "oauth" &&
      typeof account.providerAccountId === "string" &&
      account.providerAccountId.length > 0
  );
}

function readProfileValue(
  profile: Profile | null | undefined,
  key: string
): string | null {
  const value = (profile as Record<string, unknown> | null | undefined)?.[key];

  return typeof value === "string" && value.length > 0 ? value : null;
}
