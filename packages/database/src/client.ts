import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

function requireDatabaseUrl() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not configured. Load the root .env before using the database client."
    );
  }

  return connectionString;
}

declare global {
  var __stripeAccessManagementPrisma__: PrismaClient | undefined;
}

function createPrismaClientInstance() {
  const adapter = new PrismaPg({
    connectionString: requireDatabaseUrl()
  });

  return new PrismaClient({ adapter });
}

export function createDatabaseClient() {
  return createPrismaClientInstance();
}

export type DatabaseClient = PrismaClient;

export const databaseClient =
  globalThis.__stripeAccessManagementPrisma__ ?? createPrismaClientInstance();

if (process.env.NODE_ENV !== "production") {
  globalThis.__stripeAccessManagementPrisma__ = databaseClient;
}

export async function disconnectDatabaseClient() {
  await databaseClient.$disconnect();
}
