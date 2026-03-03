import { createDatabaseClient, type DatabaseClient } from "@stripe-access-management/database";
import type { StripeCatalogPlanBinding } from "../stripe/index";

export function createTestCatalogPlanBindings(): readonly StripeCatalogPlanBinding[] {
  return [
    {
      billingInterval: "MONTHLY",
      displayName: "Starter Monthly",
      lookupKey: "starter-monthly",
      stripePriceId: "price_starter_monthly",
      stripeProductId: "prod_starter_monthly",
      tier: "STARTER"
    },
    {
      billingInterval: "YEARLY",
      displayName: "Starter Yearly",
      lookupKey: "starter-yearly",
      stripePriceId: "price_starter_yearly",
      stripeProductId: "prod_starter_yearly",
      tier: "STARTER"
    },
    {
      billingInterval: "MONTHLY",
      displayName: "Pro Monthly",
      lookupKey: "pro-monthly",
      stripePriceId: "price_pro_monthly",
      stripeProductId: "prod_pro_monthly",
      tier: "PRO"
    },
    {
      billingInterval: "YEARLY",
      displayName: "Pro Yearly",
      lookupKey: "pro-yearly",
      stripePriceId: "price_pro_yearly",
      stripeProductId: "prod_pro_yearly",
      tier: "PRO"
    },
    {
      billingInterval: "MONTHLY",
      displayName: "Ultra Monthly",
      lookupKey: "ultra-monthly",
      stripePriceId: "price_ultra_monthly",
      stripeProductId: "prod_ultra_monthly",
      tier: "ULTRA"
    },
    {
      billingInterval: "YEARLY",
      displayName: "Ultra Yearly",
      lookupKey: "ultra-yearly",
      stripePriceId: "price_ultra_yearly",
      stripeProductId: "prod_ultra_yearly",
      tier: "ULTRA"
    }
  ] as const;
}

export function createIntegrationDatabaseClient(): DatabaseClient {
  return createDatabaseClient();
}

export async function resetInfrastructureTestDatabase(
  database: DatabaseClient
): Promise<void> {
  await database.$transaction([
    database.stripeWebhookInboxEvent.deleteMany(),
    database.subscription.deleteMany(),
    database.account.deleteMany(),
    database.session.deleteMany(),
    database.verificationToken.deleteMany(),
    database.user.deleteMany(),
    database.article.deleteMany()
  ]);
}

export function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function uniqueTestName(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
