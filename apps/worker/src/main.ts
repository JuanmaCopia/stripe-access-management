const heartbeat = setInterval(() => {
  // Keep the placeholder worker alive during Phase 1 verification.
}, 60_000);

function shutdown(signal: NodeJS.Signals) {
  clearInterval(heartbeat);
  console.info(`[worker] Received ${signal}. Shutting down placeholder worker.`);
  process.exit(0);
}

console.info("[worker] Placeholder worker booted. No jobs are registered yet.");

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
