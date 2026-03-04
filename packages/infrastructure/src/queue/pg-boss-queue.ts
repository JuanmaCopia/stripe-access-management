import type { QueuePublisher, StripeWebhookQueueIntent } from "@stripe-access-management/core";
import { PgBoss, type WorkOptions } from "pg-boss";
import type { QueueRuntimeConfig } from "../config/index";
import type { AppLogger } from "../logging/index";
import {
  defaultStripeWebhookQueueName,
  mapStripeWebhookIntentToJob,
  type StripeWebhookProcessingJob
} from "./job-contracts";

export interface PgBossQueueAdapterOptions {
  boss?: PgBoss;
  config?: QueueRuntimeConfig;
  connectionString?: string;
  logger?: AppLogger;
  queueName?: string;
}

export interface ConsumeStripeWebhookProcessingOptions {
  batchSize?: number;
  localConcurrency?: number;
  pollingIntervalSeconds?: number;
}

export class PgBossQueueAdapter implements QueuePublisher {
  private readonly boss: PgBoss;

  private readonly logger: AppLogger | null;

  private readonly queueName: string;

  private started = false;

  constructor(options: PgBossQueueAdapterOptions) {
    const connectionString =
      options.connectionString ?? options.config?.connectionString;

    if (!options.boss && !connectionString) {
      throw new Error(
        "PgBossQueueAdapter requires either an existing PgBoss instance or a connection string."
      );
    }

    this.boss =
      options.boss ??
      new PgBoss({
        connectionString,
        schema: options.config?.schema
      });
    this.logger = options.logger ?? null;
    this.queueName =
      options.queueName ??
      options.config?.stripeWebhookQueueName ??
      defaultStripeWebhookQueueName;
  }

  async start(): Promise<void> {
    if (this.started) {
      return;
    }

    await this.boss.start();
    await this.boss.createQueue(this.queueName);
    this.started = true;
    this.logger?.info("Started pg-boss queue adapter", {
      queueName: this.queueName
    });
  }

  async stop(): Promise<void> {
    if (!this.started) {
      return;
    }

    await this.boss.stop();
    this.started = false;
    this.logger?.info("Stopped pg-boss queue adapter", {
      queueName: this.queueName
    });
  }

  async publishStripeWebhookProcessing(
    intent: StripeWebhookQueueIntent
  ): Promise<void> {
    await this.start();

    await this.boss.send(this.queueName, mapStripeWebhookIntentToJob(intent), {
      retryLimit: 3,
      retryBackoff: true
    });
    this.logger?.info("Published Stripe webhook job", {
      queueName: this.queueName,
      stripeEventId: intent.stripeEventId
    });
  }

  async schedule(name: string, cron: string, data?: any): Promise<void> {
    await this.start();
    await this.boss.schedule(name, cron, data);
    this.logger?.info("Scheduled job", { name, cron });
  }

  async consumeStripeWebhookProcessing(
    handler: (job: StripeWebhookProcessingJob) => Promise<void>,
    options: ConsumeStripeWebhookProcessingOptions = {}
  ): Promise<string> {
    await this.start();

    const workOptions: WorkOptions = {
      batchSize: options.batchSize ?? 1,
      localConcurrency: options.localConcurrency ?? 1,
      pollingIntervalSeconds: options.pollingIntervalSeconds ?? 1
    };

    return this.boss.work<StripeWebhookProcessingJob>(
      this.queueName,
      workOptions,
      async (jobs: Array<{ data: StripeWebhookProcessingJob }>) => {
        for (const job of jobs) {
          await handler(job.data);
        }
      }
    );
  }

  async deleteAllJobs(): Promise<void> {
    await this.start();
    await this.boss.deleteAllJobs(this.queueName);
  }
}

export function createPgBossQueueAdapter(
  options: PgBossQueueAdapterOptions
): PgBossQueueAdapter {
  return new PgBossQueueAdapter(options);
}
