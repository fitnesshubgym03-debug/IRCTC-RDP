import { createHmac, timingSafeEqual } from "node:crypto";
import Razorpay from "razorpay";
import type { Config } from "../config.js";
import { Errors } from "../errors.js";

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}

export interface RazorpayPayment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  method?: string;
  error_code?: string | null;
  error_description?: string | null;
}

export interface RazorpayClient {
  createOrder(input: {
    amountPaise: number;
    receipt: string;
    notes?: Record<string, string>;
  }): Promise<RazorpayOrder>;
  fetchPayment(paymentId: string): Promise<RazorpayPayment | null>;
}

export class RazorpayClientImpl implements RazorpayClient {
  private readonly client: Razorpay | null;
  private readonly mode: "simulated" | "test" | "live";

  constructor(config: Config) {
    this.mode = config.RAZORPAY_MODE;
    this.client = config.razorpayConfigured
      ? new Razorpay({
          key_id: config.RAZORPAY_KEY_ID,
          key_secret: config.RAZORPAY_KEY_SECRET,
        })
      : null;
  }

  async createOrder(input: {
    amountPaise: number;
    receipt: string;
    notes?: Record<string, string>;
  }): Promise<RazorpayOrder> {
    if (this.mode === "simulated") {
      return {
        id: `ord_sim_${input.receipt.slice(0, 8)}`,
        amount: input.amountPaise,
        currency: "INR",
        receipt: input.receipt,
      };
    }
    if (!this.client) throw Errors.paymentsNotConfigured();
    const order = await this.client.orders.create({
      amount: input.amountPaise,
      currency: "INR",
      receipt: input.receipt,
      notes: input.notes,
    });
    return { id: order.id, amount: Number(order.amount), currency: String(order.currency), receipt: String(order.receipt ?? "") };
  }

  async fetchPayment(paymentId: string): Promise<RazorpayPayment | null> {
    if (this.mode === "simulated") {
      // payment ids are formatted pay_sim_<amountPaise> in simulated mode
      return {
        id: paymentId,
        amount: Number(paymentId.split("_")[2] ?? 0),
        currency: "INR",
        status: "captured",
        method: "test",
      };
    }
    if (!this.client) return null;
    const p = await this.client.payments.fetch(paymentId);
    return {
      id: p.id,
      amount: Number(p.amount),
      currency: String(p.currency),
      status: String(p.status),
      method: p.method ?? undefined,
      error_code: p.error_code ?? null,
      error_description: p.error_description ?? null,
    };
  }
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** Payment signature: HMAC-SHA256(key_secret, orderId|paymentId). */
export function verifyPaymentSignature(
  keySecret: string,
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  const expected = createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqual(expected, signature);
}

/** Webhook signature: HMAC-SHA256(webhook_secret, rawBody). */
export function verifyWebhookSignature(webhookSecret: string, rawBody: string, signature: string): boolean {
  const expected = createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  return safeEqual(expected, signature);
}