import { createInfrastructureCompositionFromEnv } from "@stripe-access-management/infrastructure";

async function bootstrap() {
  const composition = createInfrastructureCompositionFromEnv(process.env);
  const logger = composition.logger;

  logger.info("Starting worker...");

  const workerId = await composition.queue.adapter.consumeStripeWebhookProcessing(
    async (job) => {
      logger.info("Processing webhook job", { stripeEventId: job.stripeEventId });

      const existing = await composition.repositories.webhookInboxRepository.findByStripeEventId(
        job.stripeEventId
      );

      if (!existing) {
        logger.warn("Webhook event not found in inbox", {
          stripeEventId: job.stripeEventId
        });
        throw new Error(`Webhook event ${job.stripeEventId} not found in inbox.`);
      }

      const normalized = composition.stripe.eventNormalizer.normalize({
        event: existing.payload as any,
        receivedAt: existing.receivedAt
      });

      if (!normalized) {
        logger.info("Webhook event type not supported for sync", {
          stripeEventId: job.stripeEventId,
          type: existing.type
        });
        return;
      }

      const result = await composition.useCases.syncStripeSubscription.execute({
        event: normalized
      });

      logger.info("Processed webhook job", {
        resultStatus: result.status,
        stripeEventId: job.stripeEventId
      });
    }
  );

  logger.info("Worker consumer started", { workerId });

  async function shutdown(signal: NodeJS.Signals) {
    logger.info(`Received ${signal}. Shutting down worker...`);
    try {
      // Assuming PgBossQueueAdapter has a stop() or we just let boss disconnect via database disconnect.
      if (typeof (composition.queue.adapter as any).stop === "function") {
        await (composition.queue.adapter as any).stop();
      }
      await composition.database.$disconnect();
      logger.info("Worker disconnected from database.");
    } catch (error) {
      logger.error("Error during shutdown", { error });
    } finally {
      process.exit(0);
    }
  }

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

bootstrap().catch((error) => {
  console.error("Worker failed to start:", error);
  process.exit(1);
});
