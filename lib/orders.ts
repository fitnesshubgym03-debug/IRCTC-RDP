import "server-only"
import crypto from "node:crypto"
import type { RowDataPacket } from "mysql2"
import { ensureSchema, getPool } from "@/lib/db"

export type OrderStatus = "pending" | "paid" | "failed"

export type Order = {
  id: string
  planId: string
  planName: string
  platform: string
  region: string
  osImage: string
  hostname: string | null
  billingCycle: string
  amountInr: number
  currency: string
  email: string
  status: OrderStatus
  razorpayOrderId: string | null
  razorpayPaymentId: string | null
  createdAt: string
}

type OrderRow = RowDataPacket & {
  id: string
  plan_id: string
  plan_name: string
  platform: string
  region: string
  os_image: string
  hostname: string | null
  billing_cycle: string
  amount_inr: number
  currency: string
  email: string
  status: OrderStatus
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  created_at: Date
}

function mapRow(row: OrderRow): Order {
  return {
    id: row.id,
    planId: row.plan_id,
    planName: row.plan_name,
    platform: row.platform,
    region: row.region,
    osImage: row.os_image,
    hostname: row.hostname,
    billingCycle: row.billing_cycle,
    amountInr: row.amount_inr,
    currency: row.currency,
    email: row.email,
    status: row.status,
    razorpayOrderId: row.razorpay_order_id,
    razorpayPaymentId: row.razorpay_payment_id,
    createdAt: new Date(row.created_at).toISOString(),
  }
}

export function generateOrderId(): string {
  const now = new Date()
  const stamp = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(
    now.getUTCDate(),
  ).padStart(2, "0")}`
  const rand = crypto.randomBytes(3).toString("hex").toUpperCase()
  return `IR-${stamp}-${rand}`
}

export async function createOrder(input: {
  id: string
  planId: string
  planName: string
  platform: string
  region: string
  osImage: string
  hostname: string | null
  billingCycle: string
  amountInr: number
  email: string
  razorpayOrderId: string
}): Promise<void> {
  await ensureSchema()
  await getPool().query(
    `INSERT INTO orders
      (id, plan_id, plan_name, platform, region, os_image, hostname, billing_cycle, amount_inr, email, razorpay_order_id, status)
     VALUES
      (:id, :planId, :planName, :platform, :region, :osImage, :hostname, :billingCycle, :amountInr, :email, :razorpayOrderId, 'pending')`,
    input,
  )
}

export async function getOrder(id: string): Promise<Order | null> {
  await ensureSchema()
  const [rows] = await getPool().query<OrderRow[]>(`SELECT * FROM orders WHERE id = :id LIMIT 1`, { id })
  return rows.length ? mapRow(rows[0]) : null
}

export async function getOrderByRazorpayId(razorpayOrderId: string): Promise<Order | null> {
  await ensureSchema()
  const [rows] = await getPool().query<OrderRow[]>(
    `SELECT * FROM orders WHERE razorpay_order_id = :razorpayOrderId LIMIT 1`,
    { razorpayOrderId },
  )
  return rows.length ? mapRow(rows[0]) : null
}

export async function markOrderPaid(id: string, razorpayPaymentId: string): Promise<void> {
  await ensureSchema()
  await getPool().query(
    `UPDATE orders SET status = 'paid', razorpay_payment_id = :razorpayPaymentId
     WHERE id = :id AND status <> 'paid'`,
    { id, razorpayPaymentId },
  )
}

export async function markOrderFailed(id: string): Promise<void> {
  await ensureSchema()
  await getPool().query(`UPDATE orders SET status = 'failed' WHERE id = :id AND status = 'pending'`, { id })
}

export async function listRecentOrders(limit = 20): Promise<Order[]> {
  await ensureSchema()
  const [rows] = await getPool().query<OrderRow[]>(
    `SELECT * FROM orders ORDER BY created_at DESC LIMIT :limit`,
    { limit },
  )
  return rows.map(mapRow)
}
