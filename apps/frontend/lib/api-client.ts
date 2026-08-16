export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ""

export type ApiErrorBody = { error?: string; code?: string; errors?: Record<string, string> }

export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly errors?: Record<string, string>

  constructor(status: number, body: ApiErrorBody) {
    super(body.error ?? `Request failed (${status})`)
    this.name = "ApiError"
    this.status = status
    this.code = body.code
    this.errors = body.errors
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  })
  const body = (await res.json().catch(() => ({}))) as ApiErrorBody & T
  if (!res.ok) throw new ApiError(res.status, body)
  return body as T
}

export const api = {
  getProducts: () => apiFetch<{ products: unknown[] }>("/v1/products"),

  createOrder: (input: {
    planId: string
    region: string
    os: string
    billingCycle: string
  }) =>
    apiFetch<{
      order: Order
      checkout: {
        orderId: string
        razorpayOrderId: string
        razorpayKeyId: string
        amountINR: number
        currency: string
      }
    }>("/v1/orders", { method: "POST", body: JSON.stringify(input) }),

  verifyPayment: (input: {
    orderId: string
    razorpayOrderId: string
    razorpayPaymentId: string
    razorpaySignature: string
  }) =>
    apiFetch<{ order: Order; ok: boolean; alreadyProcessed: boolean }>(
      `/v1/orders/${input.orderId}/payment`,
      { method: "POST", body: JSON.stringify(input) },
    ),

  getOrder: (id: string) => apiFetch<{ order: Order; payment?: Payment }>(`/v1/orders/${id}`),

  login: (input: { email: string; password: string }) =>
    apiFetch<{ user: User }>("/v1/auth/login", { method: "POST", body: JSON.stringify(input) }),

  register: (input: { name: string; email: string; phone: string; address: string; password: string }) =>
    apiFetch<{ user: User }>("/v1/auth/register", { method: "POST", body: JSON.stringify(input) }),

  logout: () => apiFetch<{ ok: boolean }>("/v1/auth/logout", { method: "POST" }),

  me: () => apiFetch<{ user: User }>("/v1/auth/me"),

  submitContact: (input: { name: string; email: string; company?: string; phone?: string; message: string }) =>
    apiFetch<{ ok: boolean }>("/v1/contact", { method: "POST", body: JSON.stringify(input) }),
}

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PROVISIONING"
  | "ACTIVE"
  | "FAILED"
  | "CANCELLED"
  | "EXPIRED"
  | "SUSPENDED"

export type Order = {
  id: string
  planId: string
  plan: { id: string; name: string; platform: string; cpuCores: number; ramGB: number }
  region: string
  os: string
  billingCycle: string
  amountINR: number
  status: OrderStatus
  createdAt: string
  updatedAt: string
}

export type Payment = {
  id: string
  status: string
  method: string | null
  paidAt: string | null
}

export type User = {
  id: string
  name: string
  email: string
}

const OS_ID_LABELS: Record<string, string> = {
  "windows-server-2022": "Windows Server 2022",
  "windows-server-2025": "Windows Server 2025",
  "ubuntu-24-04": "Ubuntu 24.04 LTS",
  "debian-12": "Debian 12",
}

const OS_LABEL_IDS = Object.fromEntries(Object.entries(OS_ID_LABELS).map(([id, label]) => [label, id]))

const REGION_ID_LABELS: Record<string, string> = {
  mumbai: "Mumbai (BOM)",
  bangalore: "Bangalore (BLR)",
  delhi: "Delhi (DEL)",
}

const REGION_LABEL_IDS = Object.fromEntries(
  Object.entries(REGION_ID_LABELS).map(([id, label]) => [label, id]),
)

export function osIdToLabel(id: string): string {
  return OS_ID_LABELS[id] ?? id
}

export function osLabelToId(label: string): string {
  return OS_LABEL_IDS[label] ?? label
}

export function regionIdToLabel(id: string): string {
  return REGION_ID_LABELS[id] ?? id
}

export function regionLabelToId(label: string): string {
  return REGION_LABEL_IDS[label] ?? label
}

export function orderStatusToUi(status: OrderStatus): "pending" | "paid" | "failed" {
  switch (status) {
    case "PAID":
    case "PROVISIONING":
    case "ACTIVE":
    case "SUSPENDED":
      return "paid"
    case "FAILED":
    case "CANCELLED":
    case "EXPIRED":
      return "failed"
    default:
      return "pending"
  }
}