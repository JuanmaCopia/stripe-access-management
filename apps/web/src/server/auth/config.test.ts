import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import { PrismaAuthScaffoldingStore, createPrismaAuthAdapter } from "@stripe-access-management/infrastructure";
import {
  createGoogleSignInCallback,
  createWebAuthOptions,
  normalizeGoogleProfile
} from "./config";
import {
  createIntegrationDatabaseClient,
  hasDatabaseUrl,
  resetWebAppTestDatabase
} from "../../test/database-test-helpers";

const databaseAvailable = hasDatabaseUrl();
const database = databaseAvailable ? createIntegrationDatabaseClient() : null;

before(async () => {
  if (!database) {
    return;
  }

  await resetWebAppTestDatabase(database);
});

beforeEach(async () => {
  if (!database) {
    return;
  }

  await resetWebAppTestDatabase(database);
});

after(async () => {
  if (!database) {
    return;
  }

  await database.$disconnect();
});

test("normalizeGoogleProfile prefers provider data and falls back to user fields", () => {
  const normalized = normalizeGoogleProfile({
    profile: {
      email: "author@example.com",
      picture: "https://example.com/google.png",
      sub: "google-subject",
      name: "Author"
    } as never,
    user: {
      email: "fallback@example.com",
      image: "https://example.com/fallback.png",
      name: "Fallback"
    }
  });

  assert.deepEqual(normalized, {
    email: "author@example.com",
    imageUrl: "https://example.com/google.png",
    name: "Author"
  });
});

test(
  "Google sign-in callback creates and reuses a single local user and account link",
  { concurrency: false, skip: !databaseAvailable },
  async () => {
    assert.ok(database);

    const authStore = new PrismaAuthScaffoldingStore({
      database
    });
    const signIn = createGoogleSignInCallback({
      authStore
    });

    const account = {
      access_token: "access-token",
      expires_at: 1_772_503_200,
      id_token: "id-token",
      provider: "google",
      providerAccountId: "google-account-1",
      refresh_token: "refresh-token",
      scope: "openid email profile",
      session_state: "session-state",
      token_type: "Bearer",
      type: "oauth"
    } as const;
    const profile = {
      email: "member@example.com",
      picture: "https://example.com/member.png",
      sub: "google-subject",
      name: "Member"
    } as never;

    const firstResult = await signIn({
      account,
      profile,
      user: {
        email: "member@example.com",
        id: "next-auth-user",
        image: "https://example.com/member.png",
        name: "Member"
      }
    });
    const secondResult = await signIn({
      account,
      profile,
      user: {
        email: "member@example.com",
        id: "next-auth-user",
        image: "https://example.com/member.png",
        name: "Member"
      }
    });
    const users = await database.user.findMany();
    const accounts = await database.account.findMany();

    assert.equal(firstResult, true);
    assert.equal(secondResult, true);
    assert.equal(users.length, 1);
    assert.equal(accounts.length, 1);
    assert.equal(accounts[0]?.providerAccountId, "google-account-1");
  }
);

test(
  "createWebAuthOptions exposes database sessions and a custom sign-in page",
  { skip: !databaseAvailable },
  () => {
    assert.ok(database);

    const options = createWebAuthOptions({
      authStore: new PrismaAuthScaffoldingStore({
        database
      }),
      database,
      runtimeConfig: {
        authSecret: "test-secret",
        googleClientId: "google-client-id",
        googleClientSecret: "google-client-secret"
      }
    });

    assert.equal(options.session?.strategy, "database");
    assert.equal(options.pages?.signIn, "/signin");
    assert.equal(options.providers.length, 1);
    assert.ok(options.adapter);
    assert.ok(createPrismaAuthAdapter);
  }
);
