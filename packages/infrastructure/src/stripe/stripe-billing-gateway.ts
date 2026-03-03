import type {
  BillingGateway,
  CatalogPlan,
  SubscriptionRecord,
  UserIdentity
} from "@stripe-access-management/core";
import { InfrastructureConfigurationError } from "../config/index.js";
import type { AppLogger } from "../logging/index.js";
import { buildStripePlanMetadata, resolveStripeCatalogPlanBinding, type StripeCatalogPlanBinding } from "./stripe-catalog.js";
import type { StripeClientLike } from "./stripe-client.js";

export interface StripeBillingGatewayOptions {
  billingPortalConfigurationId?: string | null;
  catalogPlanBindings: readonly StripeCatalogPlanBinding[];
  logger?: AppLogger;
  stripeClient: StripeClientLike;
}

export class StripeBillingGateway implements BillingGateway {
  private readonly billingPortalConfigurationId: string | null;

  private readonly catalogPlanBindings: readonly StripeCatalogPlanBinding[];

  private readonly logger: AppLogger | null;

  private readonly stripeClient: StripeClientLike;

  constructor(options: StripeBillingGatewayOptions) {
    this.billingPortalConfigurationId =
      options.billingPortalConfigurationId ?? null;
    this.catalogPlanBindings = options.catalogPlanBindings;
    this.logger = options.logger ?? null;
    this.stripeClient = options.stripeClient;
  }

  async createBillingPortalSession(input: {
    returnUrl: string;
    user: UserIdentity;
  }) {
    if (!input.user.stripeCustomerId) {
      throw new InfrastructureConfigurationError(
        `User ${input.user.id} does not have a Stripe customer id.`
      );
    }

    const session = await this.stripeClient.billingPortal.sessions.create({
      configuration: this.billingPortalConfigurationId ?? undefined,
      customer: input.user.stripeCustomerId,
      return_url: input.returnUrl
    });

    if (!session.url) {
      throw new Error("Stripe billing portal session did not include a URL.");
    }

    this.logger?.info("Created Stripe billing portal session", {
      localUserId: input.user.id
    });

    return {
      billingPortalUrl: session.url
    };
  }

  async createCheckoutSession(input: {
    cancelUrl: string;
    existingSubscription: SubscriptionRecord | null;
    plan: CatalogPlan;
    successUrl: string;
    user: UserIdentity;
  }) {
    const binding = resolveStripeCatalogPlanBinding({
      bindings: this.catalogPlanBindings,
      lookupKey: input.plan.lookupKey,
      selection: {
        billingInterval: input.plan.billingInterval,
        tier: input.plan.tier
      }
    });

    if (!binding) {
      throw new InfrastructureConfigurationError(
        `No Stripe catalog binding is configured for plan ${input.plan.lookupKey}.`
      );
    }

    const metadata = buildStripePlanMetadata({
      binding,
      localUserId: input.user.id
    });
    const session = await this.stripeClient.checkout.sessions.create({
      cancel_url: input.cancelUrl,
      client_reference_id: input.user.id,
      customer: input.user.stripeCustomerId ?? undefined,
      customer_email: input.user.email ?? undefined,
      line_items: [
        {
          price: binding.stripePriceId,
          quantity: 1
        }
      ],
      metadata,
      mode: "subscription",
      success_url: input.successUrl,
      subscription_data: {
        metadata
      }
    });

    if (!session.url) {
      throw new Error("Stripe checkout session did not include a redirect URL.");
    }

    this.logger?.info("Created Stripe checkout session", {
      existingStripeSubscriptionId:
        input.existingSubscription?.stripeSubscriptionId ?? null,
      localUserId: input.user.id,
      stripePriceId: binding.stripePriceId
    });

    return {
      checkoutSessionId: session.id,
      checkoutSessionUrl: session.url
    };
  }
}
