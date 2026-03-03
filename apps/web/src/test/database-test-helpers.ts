import { createDatabaseClient, type DatabaseClient } from "@stripe-access-management/database";

export function createIntegrationDatabaseClient(): DatabaseClient {
  return createDatabaseClient();
}

export function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export async function resetWebAuthTestDatabase(
  database: DatabaseClient
): Promise<void> {
  await database.$transaction([
    database.session.deleteMany(),
    database.account.deleteMany(),
    database.user.deleteMany()
  ]);
}
