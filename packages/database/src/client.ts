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

let cachedDatabaseClient: PrismaClient | undefined;

function resolveDatabaseClient(): PrismaClient {
  if (process.env.NODE_ENV === "production") {
    return createPrismaClientInstance();
  }

  if (!globalThis.__stripeAccessManagementPrisma__) {
    globalThis.__stripeAccessManagementPrisma__ = createPrismaClientInstance();
  }

  return globalThis.__stripeAccessManagementPrisma__;
}

export function getDatabaseClient(): DatabaseClient {
  cachedDatabaseClient ??= resolveDatabaseClient();

  return cachedDatabaseClient;
}

export const databaseClient = new Proxy({} as DatabaseClient, {
  get(_target, property) {
    const client = getDatabaseClient();
    const value = Reflect.get(client, property, client);

    return typeof value === "function" ? value.bind(client) : value;
  },
  set(_target, property, value) {
    const client = getDatabaseClient();

    return Reflect.set(client, property, value, client);
  }
}) as DatabaseClient;

export async function disconnectDatabaseClient() {
  const client =
    cachedDatabaseClient ?? globalThis.__stripeAccessManagementPrisma__;

  if (!client) {
    return;
  }

  await client.$disconnect();
  cachedDatabaseClient = undefined;

  if (process.env.NODE_ENV !== "production") {
    globalThis.__stripeAccessManagementPrisma__ = undefined;
  }
}
