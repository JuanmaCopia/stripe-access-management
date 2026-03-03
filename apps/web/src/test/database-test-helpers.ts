import { createDatabaseClient, type DatabaseClient } from "@stripe-access-management/database";

export function createIntegrationDatabaseClient(): DatabaseClient {
  return createDatabaseClient();
}

export function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export async function resetWebAppTestDatabase(
  database: DatabaseClient
): Promise<void> {
  await database.$transaction([
    database.session.deleteMany(),
    database.account.deleteMany(),
    database.subscription.deleteMany(),
    database.article.deleteMany(),
    database.user.deleteMany()
  ]);
}
