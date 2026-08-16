import type { Pool } from "../database/pool.js";
import { PLAN_LIST } from "./catalog.js";

/**
 * Upsert the authoritative in-code catalog into the products table so the
 * database always mirrors the single source of truth. Idempotent.
 */
export async function syncProducts(db: Pool): Promise<void> {
  for (const plan of PLAN_LIST) {
    await db.execute(
      `INSERT INTO products
         (id, family, platform, name, tagline, cpu_cores, ram_gb, storage_gb, price_inr, price_usd, popular, best_value, features)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         family = VALUES(family), platform = VALUES(platform), name = VALUES(name),
         tagline = VALUES(tagline), cpu_cores = VALUES(cpu_cores), ram_gb = VALUES(ram_gb),
         storage_gb = VALUES(storage_gb), price_inr = VALUES(price_inr), price_usd = VALUES(price_usd),
         popular = VALUES(popular), best_value = VALUES(best_value), features = VALUES(features),
         active = 1`,
      [
        plan.id,
        plan.family,
        plan.platform,
        plan.name,
        plan.tagline,
        plan.cpuCores,
        plan.ramGB,
        plan.storageGB,
        plan.priceINR,
        plan.priceUSD,
        plan.popular ? 1 : 0,
        plan.bestValue ? 1 : 0,
        JSON.stringify(plan.features),
      ],
    );
  }
}