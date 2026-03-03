import {
  billingIntervals,
  planTiers,
  stripeSubscriptionStatuses,
  supportedStripeEventTypes,
  type Article,
  type BillingInterval,
  type JsonObject,
  type JsonValue,
  type PlanTier,
  type RecordedStripeWebhookEvent,
  type StripeEventType,
  type StripeSubscriptionStatus,
  type SubscriptionRecord,
  type UserIdentity
} from "@stripe-access-management/core";

interface ArticleRecordLike {
  bodyMarkdown: string;
  excerpt: string;
  id: string;
  published: boolean;
  publishedAt: Date | null;
  requiredTier: string;
  slug: string;
  title: string;
}

interface SubscriptionUserRecordLike {
  stripeCustomerId: string | null;
}

interface SubscriptionRecordLike {
  accessExpiresAt: Date | null;
  billingInterval: string;
  cancelAtPeriodEnd: boolean;
  id: string;
  lastSyncedAt: Date | null;
  planTier: string;
  stripePriceId: string;
  stripeProductId: string;
  stripeStatus: string;
  stripeSubscriptionId: string;
  user: SubscriptionUserRecordLike | null;
  userId: string;
}

interface UserIdentityRecordLike {
  email: string | null;
  id: string;
  name: string | null;
  stripeCustomerId: string | null;
}

interface WebhookInboxRecordLike {
  eventType: string;
  id: string;
  payload: unknown;
  receivedAt: Date;
  stripeEventId: string;
}

export function mapArticleRecordToArticle(record: ArticleRecordLike): Article {
  return {
    bodyMarkdown: record.bodyMarkdown,
    excerpt: record.excerpt,
    id: record.id,
    published: record.published,
    publishedAt: record.publishedAt,
    requiredTier: mapPlanTier(record.requiredTier),
    slug: record.slug,
    title: record.title
  };
}

export function mapUserRecordToIdentity(
  record: UserIdentityRecordLike
): UserIdentity {
  return {
    email: record.email,
    id: record.id,
    name: record.name,
    stripeCustomerId: record.stripeCustomerId
  };
}

export function mapSubscriptionRecord(
  record: SubscriptionRecordLike
): SubscriptionRecord {
  if (!record.user?.stripeCustomerId) {
    throw new Error(
      `Subscription ${record.id} is missing a related Stripe customer id on the user record.`
    );
  }

  return {
    accessExpiresAt: record.accessExpiresAt,
    billingInterval: mapBillingInterval(record.billingInterval),
    cancelAtPeriodEnd: record.cancelAtPeriodEnd,
    id: record.id,
    lastSyncedAt: record.lastSyncedAt,
    planTier: mapPlanTier(record.planTier),
    stripeCustomerId: record.user.stripeCustomerId,
    stripePriceId: record.stripePriceId,
    stripeProductId: record.stripeProductId,
    stripeStatus: mapStripeSubscriptionStatus(record.stripeStatus),
    stripeSubscriptionId: record.stripeSubscriptionId,
    userId: record.userId
  };
}

export function mapWebhookInboxRecord(
  record: WebhookInboxRecordLike
): RecordedStripeWebhookEvent {
  return {
    id: record.id,
    payload: mapJsonObject(record.payload, "webhook inbox payload"),
    receivedAt: record.receivedAt,
    stripeEventId: record.stripeEventId,
    type: mapStripeEventType(record.eventType)
  };
}

export function mapBillingInterval(value: string): BillingInterval {
  return mapStringEnum(value, billingIntervals, "billing interval");
}

export function mapPlanTier(value: string): PlanTier {
  return mapStringEnum(value, planTiers, "plan tier");
}

export function mapStripeSubscriptionStatus(
  value: string
): StripeSubscriptionStatus {
  return mapStringEnum(
    value,
    stripeSubscriptionStatuses,
    "Stripe subscription status"
  );
}

export function mapStripeEventType(value: string): StripeEventType {
  return mapStringEnum(value, supportedStripeEventTypes, "Stripe event type");
}

export function mapJsonObject(value: unknown, label: string): JsonObject {
  if (!isJsonObject(value)) {
    throw new Error(`${label} must be a JSON object.`);
  }

  return value;
}

function mapStringEnum<T extends string>(
  value: string,
  allowedValues: readonly T[],
  label: string
): T {
  if ((allowedValues as readonly string[]).includes(value)) {
    return value as T;
  }

  throw new Error(`Unsupported ${label}: "${value}".`);
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
