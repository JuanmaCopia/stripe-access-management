import type { UserIdentityRepository } from "../../identity/application/index";
import type { BillingGateway } from "./ports";

export interface OpenBillingPortalInput {
  returnUrl: string;
  userId: string;
}

export type OpenBillingPortalResult =
  | {
      billingPortalUrl: string;
      status: "ready";
    }
  | {
      status: "billing_portal_unavailable";
    }
  | {
      status: "user_not_found";
    };

export interface OpenBillingPortalDependencies {
  billingGateway: BillingGateway;
  userIdentityRepository: UserIdentityRepository;
}

export class OpenBillingPortalUseCase {
  private readonly billingGateway: BillingGateway;

  private readonly userIdentityRepository: UserIdentityRepository;

  constructor(dependencies: OpenBillingPortalDependencies) {
    this.billingGateway = dependencies.billingGateway;
    this.userIdentityRepository = dependencies.userIdentityRepository;
  }

  async execute(
    input: OpenBillingPortalInput
  ): Promise<OpenBillingPortalResult> {
    const user = await this.userIdentityRepository.findById(input.userId);

    if (!user) {
      return {
        status: "user_not_found"
      };
    }

    if (!user.stripeCustomerId) {
      return {
        status: "billing_portal_unavailable"
      };
    }

    const session = await this.billingGateway.createBillingPortalSession({
      returnUrl: input.returnUrl,
      user
    });

    return {
      billingPortalUrl: session.billingPortalUrl,
      status: "ready"
    };
  }
}
