import type { UserIdentity } from "../domain/index";

export interface UserIdentityRepository {
  findById(userId: string): Promise<UserIdentity | null>;
}
