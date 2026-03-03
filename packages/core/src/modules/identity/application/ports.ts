import type { UserIdentity } from "../domain/index.js";

export interface UserIdentityRepository {
  findById(userId: string): Promise<UserIdentity | null>;
}
