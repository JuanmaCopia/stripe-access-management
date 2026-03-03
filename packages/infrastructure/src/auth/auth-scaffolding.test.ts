import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import { PrismaAuthScaffoldingStore } from "./auth-scaffolding.js";
import {
  createIntegrationDatabaseClient,
  hasDatabaseUrl,
  resetInfrastructureTestDatabase
} from "../testing/test-helpers.js";

const databaseAvailable = hasDatabaseUrl();
const database = databaseAvailable ? createIntegrationDatabaseClient() : null;

before(async () => {
  if (!database) {
    return;
  }

  await resetInfrastructureTestDatabase(database);
});

beforeEach(async () => {
  if (!database) {
    return;
  }

  await resetInfrastructureTestDatabase(database);
});

after(async () => {
  if (!database) {
    return;
  }

  await database.$disconnect();
});

test(
  "Auth scaffolding can create and look up a linked user without Auth.js-specific types",
  { concurrency: false, skip: !databaseAvailable },
  async () => {
    assert.ok(database);

    const store = new PrismaAuthScaffoldingStore({
      database
    });
    const synced = await store.syncUserFromProvider({
      account: {
        provider: "google",
        providerAccountId: "google-account-1",
        type: "oauth"
      },
      profile: {
        email: "owner@example.com",
        imageUrl: "https://example.com/avatar.png",
        name: "Owner"
      }
    });
    const byEmail = await store.findUserByEmail("owner@example.com");
    const byProvider = await store.findUserByProviderAccount({
      provider: "google",
      providerAccountId: "google-account-1",
      type: "oauth"
    });

    assert.equal(synced.email, "owner@example.com");
    assert.equal(byEmail?.id, synced.id);
    assert.equal(byProvider?.imageUrl, "https://example.com/avatar.png");
  }
);
