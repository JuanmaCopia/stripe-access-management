import {
  ListDashboardArticlesUseCase,
  OpenBillingPortalUseCase,
  ReadArticleUseCase,
  RecordStripeWebhookUseCase,
  StartCheckoutUseCase,
  SyncStripeSubscriptionUseCase,
  type Clock
} from "@stripe-access-management/core";
import {
  getDatabaseClient,
  type DatabaseClient
} from "@stripe-access-management/database";
import { PrismaAuthScaffoldingStore } from "../auth/index";
import {
  PrismaArticleRepository,
  PrismaSubscriptionRepository,
  PrismaUserIdentityRepository,
  PrismaWebhookInboxRepository
} from "../database/index";
import {
  InfrastructureConfigurationError,
  loadInfrastructureRuntimeConfig,
  type InfrastructureRuntimeConfig
} from "../config/index";
import { ConsoleAppLogger, type AppLogger } from "../logging/index";
import { createPgBossQueueAdapter, type PgBossQueueAdapter } from "../queue/index";
import {
  StaticStripeCatalogPlanResolver,
  StripeBillingGateway,
  StripeEventNormalizer,
  createStripeClient,
  type StripeCatalogPlanBinding,
  type StripeClientLike
} from "../stripe/index";

export interface InfrastructureRepositories {
  articleRepository: PrismaArticleRepository;
  subscriptionRepository: PrismaSubscriptionRepository;
  userIdentityRepository: PrismaUserIdentityRepository;
  webhookInboxRepository: PrismaWebhookInboxRepository;
}

export interface InfrastructureUseCases {
  listDashboardArticles: ListDashboardArticlesUseCase;
  openBillingPortal: OpenBillingPortalUseCase;
  readArticle: ReadArticleUseCase;
  recordStripeWebhook: RecordStripeWebhookUseCase;
  startCheckout: StartCheckoutUseCase;
  syncStripeSubscription: SyncStripeSubscriptionUseCase;
}

export interface InfrastructureComposition {
  auth: {
    scaffolding: PrismaAuthScaffoldingStore;
  };
  catalog: {
    bindings: readonly StripeCatalogPlanBinding[];
    planResolver: StaticStripeCatalogPlanResolver;
  };
  config: InfrastructureRuntimeConfig | null;
  database: DatabaseClient;
  logger: AppLogger;
  queue: {
    adapter: PgBossQueueAdapter;
  };
  repositories: InfrastructureRepositories;
  stripe: {
    billingGateway: StripeBillingGateway;
    client: StripeClientLike;
    eventNormalizer: StripeEventNormalizer;
  };
  useCases: InfrastructureUseCases;
}

export interface CreateInfrastructureCompositionOptions {
  billingPortalConfigurationId?: string | null;
  catalogPlanBindings: readonly StripeCatalogPlanBinding[];
  clock?: Clock;
  config?: InfrastructureRuntimeConfig;
  database?: DatabaseClient;
  logger?: AppLogger;
  queueAdapter?: PgBossQueueAdapter;
  stripeClient?: StripeClientLike;
}

export function createInfrastructureComposition(
  options: CreateInfrastructureCompositionOptions
): InfrastructureComposition {
  const config = options.config ?? null;
  const database = options.database ?? getDatabaseClient();
  const logger =
    options.logger ??
    new ConsoleAppLogger({
      level: config?.logging.level ?? "info"
    });
  const stripeClient = resolveStripeClient(options.stripeClient, config);
  const queueAdapter =
    options.queueAdapter ??
    createPgBossQueueAdapter({
      config: config?.queue,
      logger
    });
  const articleRepository = new PrismaArticleRepository({
    database
  });
  const subscriptionRepository = new PrismaSubscriptionRepository({
    database
  });
  const userIdentityRepository = new PrismaUserIdentityRepository({
    database
  });
  const webhookInboxRepository = new PrismaWebhookInboxRepository({
    database
  });
  const authScaffolding = new PrismaAuthScaffoldingStore({
    database
  });
  const planResolver = new StaticStripeCatalogPlanResolver(
    options.catalogPlanBindings
  );
  const billingGateway = new StripeBillingGateway({
    billingPortalConfigurationId: options.billingPortalConfigurationId,
    catalogPlanBindings: options.catalogPlanBindings,
    logger,
    stripeClient
  });
  const eventNormalizer = new StripeEventNormalizer({
    catalogPlanBindings: options.catalogPlanBindings
  });
  const repositories: InfrastructureRepositories = {
    articleRepository,
    subscriptionRepository,
    userIdentityRepository,
    webhookInboxRepository
  };

  return {
    auth: {
      scaffolding: authScaffolding
    },
    catalog: {
      bindings: options.catalogPlanBindings,
      planResolver
    },
    config,
    database,
    logger,
    queue: {
      adapter: queueAdapter
    },
    repositories,
    stripe: {
      billingGateway,
      client: stripeClient,
      eventNormalizer
    },
    useCases: {
      listDashboardArticles: new ListDashboardArticlesUseCase({
        articleRepository,
        clock: options.clock,
        viewerSubscriptionRepository: subscriptionRepository
      }),
      openBillingPortal: new OpenBillingPortalUseCase({
        billingGateway,
        userIdentityRepository
      }),
      readArticle: new ReadArticleUseCase({
        articleRepository,
        clock: options.clock,
        viewerSubscriptionRepository: subscriptionRepository
      }),
      recordStripeWebhook: new RecordStripeWebhookUseCase({
        queuePublisher: queueAdapter,
        webhookInboxRepository
      }),
      startCheckout: new StartCheckoutUseCase({
        billingGateway,
        catalogPlanResolver: planResolver,
        clock: options.clock,
        subscriptionRepository,
        userIdentityRepository
      }),
      syncStripeSubscription: new SyncStripeSubscriptionUseCase({
        clock: options.clock,
        subscriptionRepository
      })
    }
  };
}

export function createInfrastructureCompositionFromEnv(
  options: Omit<CreateInfrastructureCompositionOptions, "config">
): InfrastructureComposition {
  return createInfrastructureComposition({
    ...options,
    config: loadInfrastructureRuntimeConfig()
  });
}

function resolveStripeClient(
  stripeClient: StripeClientLike | undefined,
  config: InfrastructureRuntimeConfig | null
): StripeClientLike {
  if (stripeClient) {
    return stripeClient;
  }

  if (!config) {
    throw new InfrastructureConfigurationError(
      "A Stripe client or runtime config must be provided when composing infrastructure services."
    );
  }

  return createStripeClient(config.stripe);
}
