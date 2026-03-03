import { createDatabaseClient, type DatabaseClient } from "@stripe-access-management/database";
import type { StripeCatalogRuntimeConfig } from "../config/index";
import {
  buildStripeCatalogPlanBindings,
  type StripeCatalogPlanBinding
} from "../stripe/index";

export function createTestCatalogPlanBindings(): readonly StripeCatalogPlanBinding[] {
  return buildStripeCatalogPlanBindings(createTestStripeCatalogRuntimeConfig());
}

export function createTestStripeCatalogRuntimeConfig(): StripeCatalogRuntimeConfig {
  return {
    pro: {
      monthlyPriceId: "price_pro_monthly",
      productId: "prod_pro",
      yearlyPriceId: "price_pro_yearly"
    },
    starter: {
      monthlyPriceId: "price_starter_monthly",
      productId: "prod_starter",
      yearlyPriceId: "price_starter_yearly"
    },
    ultra: {
      monthlyPriceId: "price_ultra_monthly",
      productId: "prod_ultra",
      yearlyPriceId: "price_ultra_yearly"
    }
  };
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
