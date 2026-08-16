import { loadConfig } from "./config.js";
import { createPool } from "./database/pool.js";
import { migrate } from "./database/migrate.js";
import { buildApp } from "./app.js";
import { syncProducts } from "./products/sync.js";
import { seedIpPools } from "./ipam/service.js";
import { startProvisioningWorker } from "./jobs/worker.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const pool = createPool(config);

  const applied = await migrate(pool);
  if (applied.length > 0) console.log(`[migrate] applied: ${applied.join(", ")}`);

  await syncProducts(pool);
  await seedIpPools(pool);

  const app = await buildApp({ config, pool });
  const worker = startProvisioningWorker(app);

  await app.listen({ host: config.HOST, port: config.PORT });
  app.log.info(`backend listening on ${config.HOST}:${config.PORT} (${config.NODE_ENV})`);

  const shutdown = async (signal: string): Promise<void> => {
    app.log.info(`received ${signal}, shutting down`);
    worker.stop();
    await app.close();
    await pool.end();
    process.exit(0);
  };
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((err) => {
  console.error("[backend] fatal startup error:", err.message);
  process.exit(1);
});