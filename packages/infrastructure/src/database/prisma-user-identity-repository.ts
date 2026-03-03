import type { UserIdentityRepository } from "@stripe-access-management/core";
import type { DatabaseClient } from "@stripe-access-management/database";
import { mapUserRecordToIdentity } from "./mappers";

const userIdentitySelect = {
  email: true,
  id: true,
  name: true,
  stripeCustomerId: true
} as const;

export interface PrismaUserIdentityRepositoryOptions {
  database: DatabaseClient;
}

export class PrismaUserIdentityRepository implements UserIdentityRepository {
  private readonly database: DatabaseClient;

  constructor(options: PrismaUserIdentityRepositoryOptions) {
    this.database = options.database;
  }

  async findById(userId: string) {
    const user = await this.database.user.findUnique({
      select: userIdentitySelect,
      where: {
        id: userId
      }
    });

    return user ? mapUserRecordToIdentity(user) : null;
  }
}
