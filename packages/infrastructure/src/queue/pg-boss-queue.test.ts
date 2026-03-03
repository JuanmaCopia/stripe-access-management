import assert from "node:assert/strict";
import test from "node:test";
import { PgBossQueueAdapter } from "./pg-boss-queue.js";
import {
  hasDatabaseUrl,
  uniqueTestName
} from "../testing/test-helpers.js";

const databaseAvailable = hasDatabaseUrl();

test(
  "PgBossQueueAdapter publishes and consumes durable webhook jobs",
  { concurrency: false, skip: !databaseAvailable },
  async () => {
    const queueName = uniqueTestName("stripe-webhook");
    const adapter = new PgBossQueueAdapter({
      connectionString: process.env.DATABASE_URL,
      queueName
    });
    let resolveJob: ((value: string) => void) | null = null;
    const received = new Promise<string>((resolve) => {
      resolveJob = resolve;
    });

    try {
      const workerId = await adapter.consumeStripeWebhookProcessing(
        async (job) => {
          resolveJob?.(job.stripeEventId);
        },
        {
          pollingIntervalSeconds: 0.5
        }
      );

      await adapter.publishStripeWebhookProcessing({
        inboxEventId: "inbox_1",
        kind: "process-stripe-webhook",
        stripeEventId: "evt_queue"
      });

      const receivedStripeEventId = await Promise.race([
        received,
        new Promise<string>((_, reject) => {
          setTimeout(() => {
            reject(new Error("Timed out waiting for pg-boss to deliver the job."));
          }, 10_000);
        })
      ]);

      assert.equal(typeof workerId, "string");
      assert.equal(receivedStripeEventId, "evt_queue");
    } finally {
      await adapter.deleteAllJobs();
      await adapter.stop();
    }
  }
);
