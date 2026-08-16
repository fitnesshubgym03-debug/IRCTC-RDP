import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { paymentVerificationSchema } from "@irctcrdp/validation";
import type { Ctx } from "../context.js";
import { Errors } from "../errors.js";
import { writeAudit } from "../audit/index.js";
import { getPlan } from "../products/catalog.js";
import { enqueueProvisioningJob } from "../jobs/queue.js";
import { clientIp } from "../context.js";
import { verifyPaymentSignature } from "../payments/razorpay.js";
import { resolveUser } from "../security/guards.js";

export interface OrderRow {
  id: string;
  user_id: string | null;
  plan_id: string;
  region: string;
  os: string;
  billing_cycle: "monthly" | "quarterly" | "annual";
  amount_inr: number;
  status: string;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface PaymentRow {
  id: string;
  order_id: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  amount_inr: number;
  currency: string;
  status: string;
  method: string | null;
}

export async function insertOrder(
  ctx: Ctx,
  user: { id: string } | null,
  input: { planId: string; region: string; os: string; billingCycle: "monthly" | "quarterly" | "annual" },
): Promise<OrderRow> {
  const plan = getPlan(input.planId);
  if (!plan) throw Errors.unprocessable("Invalid plan");
  const amountInr = Math.round(
    plan.priceINR * { monthly: 1, quarterly: 3 * 0.95, annual: 12 * 0.83 }[input.billingCycle],
  );

  if (!ctx.config.razorpayConfigured) throw Errors.paymentsNotConfigured();

  const orderId = randomUUID();
  const conn = await ctx.db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute(
      `INSERT INTO orders (id, user_id, plan_id, region, os, billing_cycle, amount_inr, status, provisioning_key)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING_PAYMENT', ?)`,
      [orderId, user?.id ?? null, plan.id, input.region, input.os, input.billingCycle, amountInr, orderId],
    );

    const rzpOrder = await ctx.razorpay.createOrder({
      amountPaise: amountInr * 100,
      receipt: orderId,
      notes: { planId: plan.id, region: input.region, os: input.os },
    });

    await conn.execute(
      `INSERT INTO payments (id, order_id, razorpay_order_id, amount_inr, currency, status)
       VALUES (?, ?, ?, ?, 'INR', 'CREATED')`,
      [randomUUID(), orderId, rzpOrder.id, amountInr],
    );
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }

  writeAudit(ctx.db, {
    actorType: user ? "user" : "system",
    actorId: user?.id ?? null,
    action: "order.created",
    resourceType: "order",
    resourceId: orderId,
    meta: { planId: input.planId, amountInr },
  });

  return {
    id: orderId,
    user_id: user?.id ?? null,
    plan_id: input.planId,
    region: input.region,
    os: input.os,
    billing_cycle: input.billingCycle,
    amount_inr: amountInr,
    status: "PENDING_PAYMENT",
    created_at: new Date(),
    updated_at: new Date(),
  };
}

export async function getOrderById(ctx: Ctx, orderId: string): Promise<OrderRow | null> {
  const [rows] = await ctx.db.query<import("mysql2/promise").RowDataPacket[]>(
    "SELECT * FROM orders WHERE id = ? LIMIT 1",
    [orderId],
  );
  return (rows[0] as OrderRow) ?? null;
}

export async function getPaymentByOrderId(ctx: Ctx, orderId: string): Promise<PaymentRow | null> {
  const [rows] = await ctx.db.query<import("mysql2/promise").RowDataPacket[]>(
    "SELECT * FROM payments WHERE order_id = ? LIMIT 1",
    [orderId],
  );
  return (rows[0] as PaymentRow) ?? null;
}

/**
 * Idempotent, transactional payment capture.
 * Only ever transitions PENDING_PAYMENT -> PAID once per order.
 */
export async function markOrderPaid(
  ctx: Ctx,
  orderId: string,
  payment: { razorpayPaymentId: string; method?: string | null },
): Promise<{ order: OrderRow; alreadyPaid: boolean }> {
  const conn = await ctx.db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.execute(
      `UPDATE payments SET status = 'CAPTURED', razorpay_payment_id = ?, method = COALESCE(?, method)
       WHERE order_id = ? AND status != 'CAPTURED'`,
      [payment.razorpayPaymentId, payment.method ?? null, orderId],
    );
    const [res] = await conn.execute(
      `UPDATE orders SET status = 'PAID' WHERE id = ? AND status IN ('CREATED', 'PENDING_PAYMENT')`,
      [orderId],
    );
    // Webhook/verification dedup record
    await conn.execute(
      `INSERT IGNORE INTO payment_events (event_id, event_type, payment_id, order_id, payload, processed)
       VALUES (?, 'payment.captured', ?, ?, ?, 1)`,
      [`capture:${payment.razorpayPaymentId}`, payment.razorpayPaymentId, orderId, JSON.stringify({ orderId, razorpayPaymentId: payment.razorpayPaymentId })],
    );
    await conn.commit();
    const alreadyPaid = (res as { affectedRows: number }).affectedRows === 0;
    if (!alreadyPaid) {
      await enqueueProvisioningJob(ctx.db, orderId, "provision_server", ctx.config.PROVISIONING_MAX_ATTEMPTS);
      writeAudit(ctx.db, {
        actorType: "system",
        action: "order.paid",
        resourceType: "order",
        resourceId: orderId,
        meta: { razorpayPaymentId: payment.razorpayPaymentId },
      });
    }
    return { order: (await getOrderById(ctx, orderId))!, alreadyPaid };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function listOrders(ctx: Ctx, userId: string, limit = 50): Promise<OrderRow[]> {
  const [rows] = await ctx.db.query<import("mysql2/promise").RowDataPacket[]>(
    "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
    [userId, limit],
  );
  return rows as OrderRow[];
}

export function orderToPublic(order: OrderRow): Record<string, unknown> {
  const plan = getPlan(order.plan_id);
  return {
    id: order.id,
    planId: order.plan_id,
    plan: plan ? { name: plan.name, platform: plan.platform, cpuCores: plan.cpuCores, ramGB: plan.ramGB } : null,
    region: order.region,
    os: order.os,
    billingCycle: order.billing_cycle,
    amountINR: order.amount_inr,
    status: order.status,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
  };
}

export async function ordersRoutes(app: FastifyInstance): Promise<void> {
  const ctx = app.ctx;

  app.addHook("preHandler", resolveUser);

  app.post("/v1/orders", async (req, reply) => {
    const body = req.body as Record<string, unknown>;
    if (!body || typeof body !== "object") return reply.code(422).send({ error: "Invalid request body" });
    const { planId, region, os, billingCycle } = body as {
      planId?: string;
      region?: string;
      os?: string;
      billingCycle?: string;
    };
    if (
      typeof planId !== "string" ||
      typeof region !== "string" ||
      typeof os !== "string" ||
      typeof billingCycle !== "string"
    ) {
      return reply.code(422).send({ error: "planId, region, os and billingCycle are required" });
    }
    const order = await insertOrder(ctx, req.user ?? null, {
        planId,
        region,
        os,
        billingCycle: billingCycle as "monthly" | "quarterly" | "annual",
      });
      const payment = await getPaymentByOrderId(ctx, order.id);
      return reply.code(201).send({
        order: orderToPublic(order),
        checkout: {
          orderId: order.id,
          razorpayOrderId: payment?.razorpay_order_id,
          razorpayKeyId: ctx.config.RAZORPAY_KEY_ID,
          amountINR: order.amount_inr,
          currency: "INR",
        },
      });
  });

  app.get("/v1/orders", async (req, reply) => {
    if (!req.user) return reply.code(401).send({ error: "Unauthorized" });
    const orders = await listOrders(ctx, req.user.id);
    return reply.send({ orders: orders.map(orderToPublic) });
  });

  app.get("/v1/orders/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const order = await getOrderById(ctx, id);
    if (!order) return reply.code(404).send({ error: "Order not found" });
    if (req.user && order.user_id !== null && order.user_id !== req.user.id) {
      return reply.code(403).send({ error: "Forbidden" });
    }
    const payment = await getPaymentByOrderId(ctx, id);
    return reply.send({ order: orderToPublic(order), payment: payment ? { status: payment.status } : null });
  });

  app.post("/v1/orders/:id/payment", async (req, reply) => {
    const { id } = req.params as { id: string };
    const parsed = paymentVerificationSchema.safeParse(req.body);
    if (!parsed.success) return reply.code(422).send({ error: "Invalid payment data", details: parsed.error.flatten() });

    const order = await getOrderById(ctx, id);
    if (!order) return reply.code(404).send({ error: "Order not found" });
    if (req.user && order.user_id !== null && order.user_id !== req.user.id) {
      return reply.code(403).send({ error: "Forbidden" });
    }
    if (order.status === "PAID" || order.status === "PROVISIONING" || order.status === "ACTIVE") {
      return reply.send({ order: orderToPublic(order), ok: true, alreadyProcessed: true });
    }

    const payment = await getPaymentByOrderId(ctx, id);
    if (!payment) return reply.code(404).send({ error: "Payment not found" });
    if (payment.razorpay_order_id !== parsed.data.razorpayOrderId) {
      return reply.code(422).send({ error: "Razorpay order mismatch", code: "ORDER_MISMATCH" });
    }

    const signatureOk = verifyPaymentSignature(
      ctx.config.RAZORPAY_KEY_SECRET,
      parsed.data.razorpayOrderId,
      parsed.data.razorpayPaymentId,
      parsed.data.razorpaySignature,
    );
    if (!signatureOk) {
      writeAudit(ctx.db, { actorType: "system", action: "payment.verify_failed", resourceType: "order", resourceId: id, requestId: req.id, ip: clientIp(req) });
      return reply.code(400).send({ error: "Invalid payment signature", code: "BAD_SIGNATURE" });
    }

    if (ctx.config.razorpayConfigured) {
      const rzpPayment = await ctx.razorpay.fetchPayment(parsed.data.razorpayPaymentId);
      if (!rzpPayment || rzpPayment.amount !== payment.amount_inr * 100 || rzpPayment.currency !== "INR") {
        return reply.code(400).send({ error: "Payment amount mismatch", code: "AMOUNT_MISMATCH" });
      }
      if (rzpPayment.status !== "captured") {
        return reply.code(400).send({ error: `Payment not captured (status: ${rzpPayment.status})`, code: "NOT_CAPTURED" });
      }
    }

    const { order: updated, alreadyPaid } = await markOrderPaid(ctx, id, {
      razorpayPaymentId: parsed.data.razorpayPaymentId,
    });
    writeAudit(ctx.db, {
      actorType: "user",
      actorId: req.user?.id ?? null,
      action: "payment.verified",
      resourceType: "order",
      resourceId: id,
      requestId: req.id,
      ip: clientIp(req),
    });
    return reply.send({ order: orderToPublic(updated), ok: true, alreadyProcessed: alreadyPaid });
  });
}