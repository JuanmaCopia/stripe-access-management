import {
  stripeSubscriptionStatuses,
  supportedStripeEventTypes,
  type BillingInterval,
  type JsonObject,
  type JsonValue,
  type NormalizedStripeEvent,
  type NormalizedSubscriptionSnapshot,
  type PlanSelection,
  type PlanTier,
  type StripeEventType,
  type StripeSubscriptionStatus
} from "@stripe-access-management/core";
import type Stripe from "stripe";
import {
  readStripePlanMetadata,
  resolveStripeCatalogPlanBinding,
  type StripeCatalogPlanBinding
} from "./stripe-catalog";

export interface NormalizeStripeEventInput {
  event: Stripe.Event;
  receivedAt?: Date;
}

export interface StripeEventNormalizerOptions {
  catalogPlanBindings: readonly StripeCatalogPlanBinding[];
}

export class StripeEventNormalizer {
  private readonly catalogPlanBindings: readonly StripeCatalogPlanBinding[];

  constructor(options: StripeEventNormalizerOptions) {
    this.catalogPlanBindings = options.catalogPlanBindings;
  }

  normalize(input: NormalizeStripeEventInput): NormalizedStripeEvent | null {
    if (!isSupportedStripeEventType(input.event.type)) {
      return null;
    }

    return {
      occurredAt: fromUnixTimestamp(input.event.created),
      payload: serializeStripePayload(input.event),
      receivedAt: input.receivedAt ?? new Date(),
      stripeEventId: input.event.id,
      subscription: normalizeSubscriptionSnapshot(
        input.event,
        this.catalogPlanBindings
      ),
      type: input.event.type
    };
  }
}

export function isSupportedStripeEventType(
  value: string
): value is StripeEventType {
  return (supportedStripeEventTypes as readonly string[]).includes(value);
}

function normalizeSubscriptionSnapshot(
  event: Stripe.Event,
  bindings: readonly StripeCatalogPlanBinding[]
): NormalizedSubscriptionSnapshot | null {
  switch (event.type) {
    case "checkout.session.completed":
      return normalizeCheckoutSessionSnapshot(
        event.data.object as Stripe.Checkout.Session,
        bindings
      );
    case "customer.subscription.created":
    case "customer.subscription.deleted":
    case "customer.subscription.updated":
      return normalizeStripeSubscriptionSnapshot(
        event.data.object as Stripe.Subscription,
        bindings
      );
    case "invoice.paid":
    case "invoice.payment_action_required":
    case "invoice.payment_failed":
      return normalizeInvoiceSnapshot(
        event.data.object as Stripe.Invoice,
        bindings,
        event.type
      );
    default:
      return null;
  }
}

function normalizeCheckoutSessionSnapshot(
  session: Stripe.Checkout.Session,
  bindings: readonly StripeCatalogPlanBinding[]
): NormalizedSubscriptionSnapshot | null {
  const metadata = readStripePlanMetadata(session.metadata ?? undefined);
  const stripeCustomerId = extractStripeId(session.customer);
  const stripeSubscriptionId = extractStripeId(session.subscription);
  const binding = resolveStripeCatalogPlanBinding({
    bindings,
    lookupKey: metadata.planLookupKey,
    selection: toPlanSelection(metadata.planTier, metadata.billingInterval),
    stripePriceId: metadata.stripePriceId,
    stripeProductId: metadata.stripeProductId
  });
  const localUserId =
    metadata.localUserId ?? session.client_reference_id ?? null;
  const stripePriceId = metadata.stripePriceId ?? binding?.stripePriceId ?? null;
  const stripeProductId =
    metadata.stripeProductId ?? binding?.stripeProductId ?? null;
  const planTier = metadata.planTier ?? binding?.tier ?? null;
  const billingInterval =
    metadata.billingInterval ?? binding?.billingInterval ?? null;

  if (
    !billingInterval ||
    !localUserId ||
    !planTier ||
    !stripeCustomerId ||
    !stripePriceId ||
    !stripeProductId ||
    !stripeSubscriptionId
  ) {
    return null;
  }

  return {
    accessPeriodEnd: null,
    billingInterval,
    cancelAtPeriodEnd: false,
    localUserId,
    planTier,
    stripeCustomerId,
    stripePriceId,
    stripeProductId,
    stripeStatus: mapCheckoutSessionStatus(session.payment_status),
    stripeSubscriptionId
  };
}

function normalizeStripeSubscriptionSnapshot(
  subscription: Stripe.Subscription,
  bindings: readonly StripeCatalogPlanBinding[]
): NormalizedSubscriptionSnapshot | null {
  const metadata = readStripePlanMetadata(subscription.metadata);
  const firstItem = subscription.items.data[0];
  const priceId = extractStripeId(firstItem?.price?.id ?? null);
  const productId = extractStripeId(firstItem?.price?.product ?? null);
  const binding = resolveStripeCatalogPlanBinding({
    bindings,
    lookupKey: metadata.planLookupKey,
    selection: toPlanSelection(metadata.planTier, metadata.billingInterval),
    stripePriceId: metadata.stripePriceId ?? priceId,
    stripeProductId: metadata.stripeProductId ?? productId
  });
  const localUserId = metadata.localUserId ?? null;
  const stripeCustomerId = extractStripeId(subscription.customer);
  const stripePriceId = metadata.stripePriceId ?? priceId ?? binding?.stripePriceId ?? null;
  const stripeProductId =
    metadata.stripeProductId ?? productId ?? binding?.stripeProductId ?? null;
  const planTier = metadata.planTier ?? binding?.tier ?? null;
  const billingInterval =
    metadata.billingInterval ?? binding?.billingInterval ?? null;
  const accessPeriodEnd = firstItem
    ? fromUnixTimestamp(firstItem.current_period_end)
    : null;

  if (
    !billingInterval ||
    !localUserId ||
    !planTier ||
    !stripeCustomerId ||
    !stripePriceId ||
    !stripeProductId
  ) {
    return null;
  }

  return {
    accessPeriodEnd,
    billingInterval,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    localUserId,
    planTier,
    stripeCustomerId,
    stripePriceId,
    stripeProductId,
    stripeStatus: mapStripeSubscriptionStatus(subscription.status),
    stripeSubscriptionId: subscription.id
  };
}

function normalizeInvoiceSnapshot(
  invoice: Stripe.Invoice,
  bindings: readonly StripeCatalogPlanBinding[],
  eventType: Extract<
    StripeEventType,
    "invoice.paid" | "invoice.payment_action_required" | "invoice.payment_failed"
  >
): NormalizedSubscriptionSnapshot | null {
  const metadata = readStripePlanMetadata(
    invoice.parent?.subscription_details?.metadata ?? invoice.metadata ?? undefined
  );
  const pricedLine = invoice.lines.data.find(
    (line) => line.pricing?.price_details !== undefined
  );
  const priceId = extractStripeId(pricedLine?.pricing?.price_details?.price ?? null);
  const productId = pricedLine?.pricing?.price_details?.product ?? null;
  const expandedSubscription = extractExpandedSubscription(
    invoice.parent?.subscription_details?.subscription ?? pricedLine?.subscription
  );
  const binding = resolveStripeCatalogPlanBinding({
    bindings,
    lookupKey: metadata.planLookupKey,
    selection: toPlanSelection(metadata.planTier, metadata.billingInterval),
    stripePriceId: metadata.stripePriceId ?? priceId,
    stripeProductId: metadata.stripeProductId ?? productId
  });
  const localUserId = metadata.localUserId ?? null;
  const stripeSubscriptionId =
    extractStripeId(pricedLine?.subscription ?? null) ??
    extractStripeId(invoice.parent?.subscription_details?.subscription ?? null);
  const stripeCustomerId = extractStripeId(invoice.customer);
  const stripePriceId = metadata.stripePriceId ?? priceId ?? binding?.stripePriceId ?? null;
  const stripeProductId =
    metadata.stripeProductId ?? productId ?? binding?.stripeProductId ?? null;
  const planTier = metadata.planTier ?? binding?.tier ?? null;
  const billingInterval =
    metadata.billingInterval ?? binding?.billingInterval ?? null;
  const accessPeriodEnd = pricedLine
    ? fromUnixTimestamp(pricedLine.period.end)
    : fromUnixTimestamp(invoice.period_end);

  if (
    !billingInterval ||
    !localUserId ||
    !planTier ||
    !stripeCustomerId ||
    !stripePriceId ||
    !stripeProductId ||
    !stripeSubscriptionId
  ) {
    return null;
  }

  return {
    accessPeriodEnd,
    billingInterval,
    cancelAtPeriodEnd: expandedSubscription?.cancel_at_period_end ?? false,
    localUserId,
    planTier,
    stripeCustomerId,
    stripePriceId,
    stripeProductId,
    stripeStatus:
      expandedSubscription?.status !== undefined
        ? mapStripeSubscriptionStatus(expandedSubscription.status)
        : mapInvoiceEventStatus(eventType),
    stripeSubscriptionId
  };
}

function extractExpandedSubscription(
  value: string | Stripe.Subscription | null | undefined
): Stripe.Subscription | null {
  if (!value || typeof value === "string") {
    return null;
  }

  return value;
}

function extractStripeId(
  value: { id: string } | string | null | undefined
): string | null {
  if (!value) {
    return null;
  }

  return typeof value === "string" ? value : value.id;
}

function serializeStripePayload(value: unknown): JsonObject {
  return mapJsonObject(JSON.parse(JSON.stringify(value)) as unknown);
}

function mapJsonObject(value: unknown): JsonObject {
  if (!isJsonObject(value)) {
    throw new Error("Stripe event payload must serialize to a JSON object.");
  }

  return value;
}

function isJsonValue(value: unknown): value is JsonValue {
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string"
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isJsonValue);
  }

  return isJsonObject(value);
}

function isJsonObject(value: unknown): value is JsonObject {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    return false;
  }

  return Object.values(value).every(isJsonValue);
}

function mapCheckoutSessionStatus(
  paymentStatus: Stripe.Checkout.Session.PaymentStatus
): StripeSubscriptionStatus {
  switch (paymentStatus) {
    case "no_payment_required":
    case "paid":
      return "ACTIVE";
    case "unpaid":
      return "INCOMPLETE";
    default:
      return "INCOMPLETE";
  }
}

function mapStripeSubscriptionStatus(value: string): StripeSubscriptionStatus {
  const candidate = value.toUpperCase();

  if ((stripeSubscriptionStatuses as readonly string[]).includes(candidate)) {
    return candidate as StripeSubscriptionStatus;
  }

  throw new Error(`Unsupported Stripe subscription status "${value}".`);
}

function mapInvoiceEventStatus(
  eventType: Extract<
    StripeEventType,
    "invoice.paid" | "invoice.payment_action_required" | "invoice.payment_failed"
  >
): StripeSubscriptionStatus {
  switch (eventType) {
    case "invoice.paid":
      return "ACTIVE";
    case "invoice.payment_action_required":
    case "invoice.payment_failed":
      return "PAST_DUE";
    default:
      return "PAST_DUE";
  }
}

function fromUnixTimestamp(value: number): Date {
  return new Date(value * 1000);
}

function toPlanSelection(
  tier: PlanTier | undefined,
  billingInterval: BillingInterval | undefined
): PlanSelection | null {
  if (!tier || !billingInterval) {
    return null;
  }

  return {
    billingInterval,
    tier
  };
}
