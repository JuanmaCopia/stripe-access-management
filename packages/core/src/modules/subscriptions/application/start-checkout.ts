import type { CatalogPlanResolver } from "../../catalog/application/index";
import type { PlanSelection } from "../../catalog/domain/index";
import type { UserIdentityRepository } from "../../identity/application/index";
import type { Clock } from "../../../shared/kernel/index";
import { systemClock } from "../../../shared/kernel/index";
import {
  hasActivePaidAccess,
  matchesPlanSelection,
  type SubscriptionRecord
} from "../domain/index";
import type { BillingGateway, SubscriptionRepository } from "./ports";

export interface StartCheckoutInput {
  cancelUrl: string;
  selectedPlan: PlanSelection;
  successUrl: string;
  userId: string;
}

export type StartCheckoutResult =
  | {
      existingSubscription: SubscriptionRecord;
      status: "duplicate_subscription";
    }
  | {
      status: "unsupported_plan";
    }
  | {
      checkoutSessionId: string;
      checkoutSessionUrl: string;
      status: "ready";
    }
  | {
      status: "user_not_found";
    };

export interface StartCheckoutDependencies {
  billingGateway: BillingGateway;
  catalogPlanResolver: CatalogPlanResolver;
  clock?: Clock;
  subscriptionRepository: SubscriptionRepository;
  userIdentityRepository: UserIdentityRepository;
}

export class StartCheckoutUseCase {
  private readonly billingGateway: BillingGateway;

  private readonly catalogPlanResolver: CatalogPlanResolver;

  private readonly clock: Clock;

  private readonly subscriptionRepository: SubscriptionRepository;

  private readonly userIdentityRepository: UserIdentityRepository;

  constructor(dependencies: StartCheckoutDependencies) {
    this.billingGateway = dependencies.billingGateway;
    this.catalogPlanResolver = dependencies.catalogPlanResolver;
    this.clock = dependencies.clock ?? systemClock;
    this.subscriptionRepository = dependencies.subscriptionRepository;
    this.userIdentityRepository = dependencies.userIdentityRepository;
  }

  async execute(input: StartCheckoutInput): Promise<StartCheckoutResult> {
    const user = await this.userIdentityRepository.findById(input.userId);

    if (!user) {
      return {
        status: "user_not_found"
      };
    }

    const plan = await this.catalogPlanResolver.resolvePlanSelection(
      input.selectedPlan
    );

    if (!plan) {
      return {
        status: "unsupported_plan"
      };
    }

    const existingSubscription = await this.subscriptionRepository.findByUserId(
      input.userId
    );

    if (
      existingSubscription &&
      matchesPlanSelection(existingSubscription, plan) &&
      hasActivePaidAccess(existingSubscription, this.clock.now())
    ) {
      return {
        existingSubscription,
        status: "duplicate_subscription"
      };
    }

    const session = await this.billingGateway.createCheckoutSession({
      cancelUrl: input.cancelUrl,
      existingSubscription,
      plan,
      successUrl: input.successUrl,
      user
    });

    return {
      checkoutSessionId: session.checkoutSessionId,
      checkoutSessionUrl: session.checkoutSessionUrl,
      status: "ready"
    };
  }
}
