import type { FastifyInstance } from "fastify";
import { verifyWebhookSignature } from "../payments/razorpay.js";
import { writeAudit } from "../audit/index.js";
import { markOrderPaid } from "../orders/service.js";
import { clientIp } from "../context.js";

interface WebhookPaymentEntity {
  id?: string;
  order_id?: string;
  amount?: number;
  status?: string;
  method?: string;
  error_code?: string | null;
  error_description?: string | null;
}

interface WebhookEvent {
  event: string;
  payload: {
    payment?: { entity?: WebhookPaymentEntity };
    order?: { entity?: { id?: string; amount?: number; status?: string } };
    refund?: { entity?: { id?: string; payment_id?: string; status?: string } };
  };
}

export async function webhookRoutes(app: FastifyInstance): Promise<void> {
  const { db, config } = app.ctx;

  await app.register(async (scope) => {
    // Preserve the raw request body — required for signature verification.
    scope.addContentTypeParser("application/json", { parseAs: "string" }, (_req, body, done) => {
      done(null, body as string);
    });

    scope.post(
      "/webhooks/razorpay",
      { config: { rateLimit: { max: 120, timeWindow: "1 minute" } } },
      async (req, reply) => {
        if (!config.RAZORPAY_WEBHOOK_SECRET) {
          return reply.code(503).send({ error: "Webhooks are not configured" });
        }
        const signature = String(req.headers["x-razorpay-signature"] ?? "");
        const rawBody = req.body as string;

        if (!verifyWebhookSignature(config.RAZORPAY_WEBHOOK_SECRET, rawBody, signature)) {
          writeAudit(db, {
            actorType: "system",
            action: "webhook.rejected_signature",
            requestId: req.id,
            ip: clientIp(req),
          });
          return reply.code(401).send({ error: "Invalid signature" });
        }

        let event: WebhookEvent;
        try {
          event = JSON.parse(rawBody) as WebhookEvent;
        } catch {
          return reply.code(422).send({ error: "Malformed payload" });
        }

        const paymentEntity = event.payload.payment?.entity;
        const refundEntity = event.payload.refund?.entity;
        const orderEntity = event.payload.order?.entity;
        const eventId = paymentEntity?.id ?? refundEntity?.id ?? orderEntity?.id ?? "";
        if (!eventId) {
          return reply.code(422).send({ error: "Unrecognized event payload" });
        }

        // Dedup: unique event id. A replayed webhook is answered 200 without reprocessing.
        const [insert] = await db.execute(
          `INSERT IGNORE INTO payment_events (event_id, event_type, payment_id, order_id, payload)
           VALUES (?, ?, ?, NULL, ?)`,
          [eventId, event.event, paymentEntity?.id ?? null, rawBody],
        );
        if ((insert as { affectedRows: number }).affectedRows === 0) {
          return reply.send({ ok: true, duplicate: true });
        }

        // Resolve the internal order for this payment.
        let orderId: string | null = null;
        if (paymentEntity) {
          const [rows] = await db.query<import("mysql2/promise").RowDataPacket[]>(
            `SELECT order_id FROM payments
             WHERE razorpay_payment_id = ? OR (razorpay_order_id = ? AND razorpay_order_id IS NOT NULL)
             LIMIT 1`,
            [paymentEntity.id ?? "", paymentEntity.order_id ?? ""],
          );
          orderId = (rows[0]?.order_id as string) ?? null;
        }
        if (!orderId && refundEntity?.payment_id) {
          const [rows] = await db.query<import("mysql2/promise").RowDataPacket[]>(
            "SELECT order_id FROM payments WHERE razorpay_payment_id = ? LIMIT 1",
            [refundEntity.payment_id],
          );
          orderId = (rows[0]?.order_id as string) ?? null;
        }
        if (orderId) {
          await db.execute("UPDATE payment_events SET order_id = ? WHERE event_id = ?", [orderId, eventId]);
        }

        if (orderId) {
          switch (event.event) {
            case "payment.captured":
            case "order.paid":
              if (paymentEntity) {
                await markOrderPaid(app.ctx, orderId, {
                  razorpayPaymentId: paymentEntity.id ?? eventId,
                  method: paymentEntity.method ?? null,
                });
              }
              break;
            case "payment.failed":
              await db.execute(
                `UPDATE payments SET status = 'FAILED', error_code = ?, error_description = ?
                 WHERE order_id = ? AND status NOT IN ('CAPTURED', 'REFUNDED')`,
                [paymentEntity?.error_code ?? null, paymentEntity?.error_description ?? null, orderId],
              );
              await db.execute(
                "UPDATE orders SET status = 'FAILED' WHERE id = ? AND status NOT IN ('PAID', 'ACTIVE', 'PROVISIONING')",
                [orderId],
              );
              writeAudit(db, { actorType: "system", action: "order.payment_failed", resourceType: "order", resourceId: orderId });
              break;
            case "refund.processed":
            case "refund.processed.v2":
              await db.execute("UPDATE payments SET status = 'REFUNDED' WHERE order_id = ?", [orderId]);
              await db.execute("UPDATE orders SET status = 'REFUNDED' WHERE id = ?", [orderId]);
              writeAudit(db, { actorType: "system", action: "order.refunded", resourceType: "order", resourceId: orderId });
              break;
            default:
              break;
          }
        }

        await db.execute("UPDATE payment_events SET processed = 1 WHERE event_id = ?", [eventId]);
        return reply.send({ ok: true });
      },
    );
  });
}