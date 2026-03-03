import Stripe from "stripe";
import type { StripeRuntimeConfig } from "../config/index.js";

export interface StripeCheckoutSessionsClient {
  create(input: {
    cancel_url: string;
    client_reference_id?: string;
    customer?: string;
    customer_email?: string;
    line_items: Array<{
      price: string;
      quantity: number;
    }>;
    metadata: Record<string, string>;
    mode: "subscription";
    success_url: string;
    subscription_data: {
      metadata: Record<string, string>;
    };
  }): Promise<{
    id: string;
    url: string | null;
  }>;
}

export interface StripeBillingPortalSessionsClient {
  create(input: {
    configuration?: string;
    customer: string;
    return_url: string;
  }): Promise<{
    url: string | null;
  }>;
}

export interface StripeClientLike {
  billingPortal: {
    sessions: StripeBillingPortalSessionsClient;
  };
  checkout: {
    sessions: StripeCheckoutSessionsClient;
  };
}

export function createStripeClient(
  config: StripeRuntimeConfig
): StripeClientLike {
  return new Stripe(config.apiKey);
}
