export type AppEnvironment = "development" | "production" | "test";

export type LogLevel = "debug" | "error" | "info" | "warn";

export interface EnvironmentReader {
  [key: string]: string | undefined;
}

export interface StripeRuntimeConfig {
  apiKey: string;
  webhookSecret: string | null;
}

export interface StripeCatalogTierRuntimeConfig {
  monthlyPriceId: string;
  productId: string;
  yearlyPriceId: string;
}

export interface StripeCatalogRuntimeConfig {
  pro: StripeCatalogTierRuntimeConfig;
  starter: StripeCatalogTierRuntimeConfig;
  ultra: StripeCatalogTierRuntimeConfig;
}

export interface QueueRuntimeConfig {
  connectionString: string;
  schema: string;
  stripeWebhookQueueName: string;
}

export interface AuthRuntimeConfig {
  authSecret: string;
  googleClientId: string | null;
  googleClientSecret: string | null;
}

export interface GoogleOAuthRuntimeConfig {
  clientId: string;
  clientSecret: string;
}

export interface LoggingRuntimeConfig {
  level: LogLevel;
}

export interface InfrastructureRuntimeConfig {
  appEnvironment: AppEnvironment;
  auth: AuthRuntimeConfig;
  logging: LoggingRuntimeConfig;
  queue: QueueRuntimeConfig;
  stripeCatalog: StripeCatalogRuntimeConfig;
  stripe: StripeRuntimeConfig;
}

export class InfrastructureConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InfrastructureConfigurationError";
  }
}

const validAppEnvironments = new Set<AppEnvironment>([
  "development",
  "production",
  "test"
]);

const validLogLevels = new Set<LogLevel>(["debug", "error", "info", "warn"]);

export function loadAppEnvironment(
  reader: EnvironmentReader = process.env
): AppEnvironment {
  const raw = reader.NODE_ENV ?? "development";

  if (!validAppEnvironments.has(raw as AppEnvironment)) {
    throw new InfrastructureConfigurationError(
      `NODE_ENV must be one of development, production, or test. Received "${raw}".`
    );
  }

  return raw as AppEnvironment;
}

export function loadStripeRuntimeConfig(
  reader: EnvironmentReader = process.env
): StripeRuntimeConfig {
  return {
    apiKey: requireNonEmpty(
      reader,
      "STRIPE_SECRET_KEY",
      "Stripe billing sessions require STRIPE_SECRET_KEY."
    ),
    webhookSecret: readOptionalString(reader, "STRIPE_WEBHOOK_SECRET")
  };
}

export function loadStripeCatalogRuntimeConfig(
  reader: EnvironmentReader = process.env
): StripeCatalogRuntimeConfig {
  return {
    pro: loadStripeCatalogTierRuntimeConfig(reader, {
      monthlyPriceIdKey: "STRIPE_PRO_MONTHLY_PRICE_ID",
      productIdKey: "STRIPE_PRO_PRODUCT_ID",
      tierLabel: "Pro",
      yearlyPriceIdKey: "STRIPE_PRO_YEARLY_PRICE_ID"
    }),
    starter: loadStripeCatalogTierRuntimeConfig(reader, {
      monthlyPriceIdKey: "STRIPE_STARTER_MONTHLY_PRICE_ID",
      productIdKey: "STRIPE_STARTER_PRODUCT_ID",
      tierLabel: "Starter",
      yearlyPriceIdKey: "STRIPE_STARTER_YEARLY_PRICE_ID"
    }),
    ultra: loadStripeCatalogTierRuntimeConfig(reader, {
      monthlyPriceIdKey: "STRIPE_ULTRA_MONTHLY_PRICE_ID",
      productIdKey: "STRIPE_ULTRA_PRODUCT_ID",
      tierLabel: "Ultra",
      yearlyPriceIdKey: "STRIPE_ULTRA_YEARLY_PRICE_ID"
    })
  };
}

export function loadQueueRuntimeConfig(
  reader: EnvironmentReader = process.env
): QueueRuntimeConfig {
  return {
    connectionString: requireNonEmpty(
      reader,
      "DATABASE_URL",
      "The pg-boss queue shares the primary PostgreSQL connection and requires DATABASE_URL."
    ),
    schema: readOptionalString(reader, "PGBOSS_SCHEMA") ?? "pgboss",
    stripeWebhookQueueName:
      readOptionalString(reader, "STRIPE_WEBHOOK_QUEUE_NAME") ??
      "stripe-webhook-processing"
  };
}

export function loadAuthRuntimeConfig(
  reader: EnvironmentReader = process.env
): AuthRuntimeConfig {
  return {
    authSecret: requireNonEmpty(
      reader,
      "AUTH_SECRET",
      "Auth.js scaffolding requires AUTH_SECRET."
    ),
    googleClientId: readOptionalString(reader, "GOOGLE_CLIENT_ID"),
    googleClientSecret: readOptionalString(reader, "GOOGLE_CLIENT_SECRET")
  };
}

export function requireGoogleOAuthRuntimeConfig(
  config: AuthRuntimeConfig
): GoogleOAuthRuntimeConfig {
  if (!config.googleClientId || !config.googleClientSecret) {
    throw new InfrastructureConfigurationError(
      "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are required for Google sign-in."
    );
  }

  return {
    clientId: config.googleClientId,
    clientSecret: config.googleClientSecret
  };
}

export function loadLoggingRuntimeConfig(
  reader: EnvironmentReader = process.env
): LoggingRuntimeConfig {
  const rawLevel = reader.LOG_LEVEL ?? "info";

  if (!validLogLevels.has(rawLevel as LogLevel)) {
    throw new InfrastructureConfigurationError(
      `LOG_LEVEL must be one of debug, info, warn, or error. Received "${rawLevel}".`
    );
  }

  return {
    level: rawLevel as LogLevel
  };
}

export function loadInfrastructureRuntimeConfig(
  reader: EnvironmentReader = process.env
): InfrastructureRuntimeConfig {
  return {
    appEnvironment: loadAppEnvironment(reader),
    auth: loadAuthRuntimeConfig(reader),
    logging: loadLoggingRuntimeConfig(reader),
    queue: loadQueueRuntimeConfig(reader),
    stripeCatalog: loadStripeCatalogRuntimeConfig(reader),
    stripe: loadStripeRuntimeConfig(reader)
  };
}

function requireNonEmpty(
  reader: EnvironmentReader,
  key: string,
  detail: string
): string {
  const value = readOptionalString(reader, key);

  if (!value) {
    throw new InfrastructureConfigurationError(
      `${key} is not configured. ${detail}`
    );
  }

  return value;
}

function readOptionalString(
  reader: EnvironmentReader,
  key: string
): string | null {
  const value = reader[key]?.trim();

  return value ? value : null;
}

function loadStripeCatalogTierRuntimeConfig(
  reader: EnvironmentReader,
  input: {
    monthlyPriceIdKey: string;
    productIdKey: string;
    tierLabel: string;
    yearlyPriceIdKey: string;
  }
): StripeCatalogTierRuntimeConfig {
  return {
    monthlyPriceId: requireNonEmpty(
      reader,
      input.monthlyPriceIdKey,
      `${input.tierLabel} monthly checkout mapping requires ${input.monthlyPriceIdKey}.`
    ),
    productId: requireNonEmpty(
      reader,
      input.productIdKey,
      `${input.tierLabel} catalog mapping requires ${input.productIdKey}.`
    ),
    yearlyPriceId: requireNonEmpty(
      reader,
      input.yearlyPriceIdKey,
      `${input.tierLabel} yearly checkout mapping requires ${input.yearlyPriceIdKey}.`
    )
  };
}
