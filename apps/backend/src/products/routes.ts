import type { FastifyInstance } from "fastify";
import { PLAN_LIST } from "./catalog.js";
import { REGION_LABELS } from "@irctcrdp/contracts";
import type { PublicLocation, PublicPlan } from "@irctcrdp/contracts";

export async function productsRoutes(app: FastifyInstance): Promise<void> {
  app.get("/v1/products", async (_req, reply) => {
    const products: PublicPlan[] = PLAN_LIST.map((p) => ({
      id: p.id,
      family: p.family,
      platform: p.platform,
      name: p.name,
      tagline: p.tagline,
      cpuCores: p.cpuCores,
      ramGB: p.ramGB,
      storageGB: p.storageGB,
      priceINR: p.priceINR,
      priceUSD: p.priceUSD,
      popular: p.popular,
      bestValue: p.bestValue,
      features: p.features,
    }));
    return reply.send({ products });
  });

  app.get("/v1/locations", async (_req, reply) => {
    const locations: PublicLocation[] = (Object.entries(REGION_LABELS) as Array<[PublicLocation["id"], string]>).map(
      ([id, label]) => ({ id, label, code: label.match(/\(([^)]+)\)/)?.[1] ?? id.toUpperCase() }),
    );
    return reply.send({ locations });
  });
}