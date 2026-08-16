import type { FastifyPluginAsync } from "fastify";
import { writeAudit } from "../audit/index.js";

type ContactPayload = {
  name?: string;
  email?: string;
  company?: string;
  phone?: string;
  message?: string;
};

function isEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value);
}

export const contactRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Body: ContactPayload }>("/v1/contact", async (req, reply) => {
    const body = req.body ?? {};

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const message = String(body.message ?? "").trim();
    const company = String(body.company ?? "").trim().slice(0, 200);
    const phone = String(body.phone ?? "").trim().slice(0, 50);

    const errors: Record<string, string> = {};
    if (!name) errors.name = "Name is required.";
    if (!email || !isEmail(email)) errors.email = "A valid email is required.";
    if (message.length < 10) errors.message = "Message is too short.";

    if (Object.keys(errors).length > 0) {
      return reply.code(422).send({ ok: false, errors });
    }

    const ctx = app.ctx as import("../context.js").Ctx;
    writeAudit(ctx.db, {
      actorType: "system",
      action: "contact.submitted",
      meta: { name, email, company, phone, messagePreview: message.slice(0, 120) },
    });

    return { ok: true };
  });
};