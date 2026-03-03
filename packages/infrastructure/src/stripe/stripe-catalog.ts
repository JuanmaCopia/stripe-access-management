import type {
  BillingInterval,
  CatalogPlan,
  CatalogPlanResolver,
  PlanSelection,
  PlanTier
} from "@stripe-access-management/core";
import { billingIntervals, planTiers } from "@stripe-access-management/core";
import { InfrastructureConfigurationError } from "../config/index";

export interface StripeCatalogPlanBinding extends CatalogPlan {
  stripePriceId: string;
  stripeProductId: string;
}

export interface StripeCatalogTierBindingInput {
  monthlyPriceId: string;
  productId: string;
  yearlyPriceId: string;
}

export interface StripeCatalogBindingsInput {
  pro: StripeCatalogTierBindingInput;
  starter: StripeCatalogTierBindingInput;
  ultra: StripeCatalogTierBindingInput;
}

export interface StripePlanMetadata {
  billingInterval: BillingInterval;
  localUserId: string;
  planLookupKey: string;
  planTier: PlanTier;
  stripePriceId: string;
  stripeProductId: string;
}

export interface ResolveStripeCatalogPlanBindingInput {
  bindings: readonly StripeCatalogPlanBinding[];
  lookupKey?: string | null;
  selection?: PlanSelection | null;
  stripePriceId?: string | null;
  stripeProductId?: string | null;
}

export class StaticStripeCatalogPlanResolver implements CatalogPlanResolver {
  private readonly bindings: readonly StripeCatalogPlanBinding[];

  constructor(bindings: readonly StripeCatalogPlanBinding[]) {
    validateStripeCatalogPlanBindings(bindings);
    this.bindings = bindings;
  }

  async resolvePlanSelection(selection: PlanSelection): Promise<CatalogPlan | null> {
    const binding = resolveStripeCatalogPlanBinding({
      bindings: this.bindings,
      selection
    });

    return binding ? mapStripeBindingToCatalogPlan(binding) : null;
  }
}

export function buildStripeCatalogPlanBindings(
  input: StripeCatalogBindingsInput
): readonly StripeCatalogPlanBinding[] {
  const bindings = [
    createStripeCatalogPlanBinding({
      billingInterval: "MONTHLY",
      displayName: "Starter Monthly",
      lookupKey: "starter-monthly",
      stripePriceId: input.starter.monthlyPriceId,
      stripeProductId: input.starter.productId,
      tier: "STARTER"
    }),
    createStripeCatalogPlanBinding({
      billingInterval: "YEARLY",
      displayName: "Starter Yearly",
      lookupKey: "starter-yearly",
      stripePriceId: input.starter.yearlyPriceId,
      stripeProductId: input.starter.productId,
      tier: "STARTER"
    }),
    createStripeCatalogPlanBinding({
      billingInterval: "MONTHLY",
      displayName: "Pro Monthly",
      lookupKey: "pro-monthly",
      stripePriceId: input.pro.monthlyPriceId,
      stripeProductId: input.pro.productId,
      tier: "PRO"
    }),
    createStripeCatalogPlanBinding({
      billingInterval: "YEARLY",
      displayName: "Pro Yearly",
      lookupKey: "pro-yearly",
      stripePriceId: input.pro.yearlyPriceId,
      stripeProductId: input.pro.productId,
      tier: "PRO"
    }),
    createStripeCatalogPlanBinding({
      billingInterval: "MONTHLY",
      displayName: "Ultra Monthly",
      lookupKey: "ultra-monthly",
      stripePriceId: input.ultra.monthlyPriceId,
      stripeProductId: input.ultra.productId,
      tier: "ULTRA"
    }),
    createStripeCatalogPlanBinding({
      billingInterval: "YEARLY",
      displayName: "Ultra Yearly",
      lookupKey: "ultra-yearly",
      stripePriceId: input.ultra.yearlyPriceId,
      stripeProductId: input.ultra.productId,
      tier: "ULTRA"
    })
  ] as const;

  validateStripeCatalogPlanBindings(bindings);

  return bindings;
}

export function resolveStripeCatalogPlanBinding(
  input: ResolveStripeCatalogPlanBindingInput
): StripeCatalogPlanBinding | null {
  const byLookupKey =
    input.lookupKey === undefined || input.lookupKey === null
      ? null
      : input.bindings.find((binding) => binding.lookupKey === input.lookupKey) ??
        null;

  if (byLookupKey) {
    return byLookupKey;
  }

  const byPriceId =
    input.stripePriceId === undefined || input.stripePriceId === null
      ? null
      : input.bindings.find(
          (binding) => binding.stripePriceId === input.stripePriceId
        ) ?? null;

  if (byPriceId) {
    return byPriceId;
  }

  const bySelection =
    input.selection === undefined || input.selection === null
      ? null
      : input.bindings.find(
          (binding) =>
            binding.billingInterval === input.selection?.billingInterval &&
            binding.tier === input.selection?.tier
        ) ?? null;

  if (bySelection) {
    return bySelection;
  }

  if (!input.stripeProductId) {
    return null;
  }

  const matchingByProduct = input.bindings.filter(
    (binding) => binding.stripeProductId === input.stripeProductId
  );

  return matchingByProduct.length === 1 ? matchingByProduct[0] ?? null : null;
}

export function mapStripeBindingToCatalogPlan(
  binding: StripeCatalogPlanBinding
): CatalogPlan {
  return {
    billingInterval: binding.billingInterval,
    displayName: binding.displayName,
    lookupKey: binding.lookupKey,
    tier: binding.tier
  };
}

export function buildStripePlanMetadata(input: {
  binding: StripeCatalogPlanBinding;
  localUserId: string;
}): Record<string, string> {
  return {
    billingInterval: input.binding.billingInterval,
    localUserId: input.localUserId,
    planLookupKey: input.binding.lookupKey,
    planTier: input.binding.tier,
    stripePriceId: input.binding.stripePriceId,
    stripeProductId: input.binding.stripeProductId
  };
}

export function readStripePlanMetadata(
  metadata: Record<string, string | undefined> | null | undefined
): Partial<StripePlanMetadata> {
  if (!metadata) {
    return {};
  }

  return {
    billingInterval: parseBillingInterval(metadata.billingInterval),
    localUserId: readString(metadata.localUserId),
    planLookupKey: readString(metadata.planLookupKey),
    planTier: parsePlanTier(metadata.planTier),
    stripePriceId: readString(metadata.stripePriceId),
    stripeProductId: readString(metadata.stripeProductId)
  };
}

export function validateStripeCatalogPlanBindings(
  bindings: readonly StripeCatalogPlanBinding[]
): void {
  const seenLookupKeys = new Set<string>();
  const seenPriceIds = new Set<string>();
  const seenSelections = new Set<string>();

  for (const binding of bindings) {
    if (seenLookupKeys.has(binding.lookupKey)) {
      throw new InfrastructureConfigurationError(
        `Duplicate Stripe catalog binding lookup key "${binding.lookupKey}".`
      );
    }

    seenLookupKeys.add(binding.lookupKey);

    if (seenPriceIds.has(binding.stripePriceId)) {
      throw new InfrastructureConfigurationError(
        `Duplicate Stripe catalog binding price id "${binding.stripePriceId}".`
      );
    }

    seenPriceIds.add(binding.stripePriceId);

    const selectionKey = `${binding.tier}:${binding.billingInterval}`;

    if (seenSelections.has(selectionKey)) {
      throw new InfrastructureConfigurationError(
        `Duplicate Stripe catalog binding selection "${selectionKey}".`
      );
    }

    seenSelections.add(selectionKey);
  }
}

function parseBillingInterval(value: string | undefined): BillingInterval | undefined {
  return parseStringEnum(value, billingIntervals);
}

function parsePlanTier(value: string | undefined): PlanTier | undefined {
  return parseStringEnum(value, planTiers);
}

function parseStringEnum<T extends string>(
  value: string | undefined,
  allowedValues: readonly T[]
): T | undefined {
  if (!value || !(allowedValues as readonly string[]).includes(value)) {
    return undefined;
  }

  return value as T;
}

function readString(value: string | undefined): string | undefined {
  return value && value.length > 0 ? value : undefined;
}

function createStripeCatalogPlanBinding(
  binding: StripeCatalogPlanBinding
): StripeCatalogPlanBinding {
  return binding;
}
