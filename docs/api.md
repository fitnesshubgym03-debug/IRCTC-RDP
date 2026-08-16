# API Reference

Base URL (production): `https://api.irctcrdp.com` — all routes under `/v1`.
Internal/provisioner routes use `x-internal-secret` and are never reachable from the browser
(backend binds 127.0.0.1; only the API vhost is published).

## Public

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | – | liveness |
| GET | `/v1/products` | – | plans, regions, OS templates (cached by clients; server sends `no-store`) |
| POST | `/v1/auth/register` | – | create account (rate-limited 5/min) |
| POST | `/v1/auth/login` | – | session cookie (`irctcrdp_session`, httpOnly, 30 days) |
| POST | `/v1/auth/logout` | cookie | destroy session |
| GET | `/v1/auth/me` | cookie | current user |
| POST | `/v1/orders` | guest or cookie | create order → `{ order, checkout }` |
| POST | `/v1/orders/:id/payment` | guest or cookie | verify Razorpay signature, mark PAID, enqueue provisioning |
| GET | `/v1/orders/:id` | guest or cookie | order + plan; ownership enforced for signed-in users |
| GET | `/v1/orders` | cookie | current user's orders |
| POST | `/v1/contact` | – | contact form (rate-limited) |

### POST /v1/orders

```json
{ "planId": "intel-6c-16gb", "region": "mumbai", "os": "ubuntu-24-04", "billingCycle": "monthly" }
```

Plans: `intel-4c-8gb`, `intel-6c-16gb`, `intel-6c-24gb`, `intel-8c-32gb`,
`ryzen-4c-8gb`, `ryzen-6c-16gb`, `ryzen-6c-24gb`, `ryzen-8c-32gb`.
Regions: `mumbai`, `delhi`, `singapore`. OS: `windows-server-2025|2022|2019`, `windows-11-pro`,
`ubuntu-24-04`, `debian-12`. Billing: `monthly` / `quarterly` / `annual`.

Response includes `checkout.razorpayOrderId`, `checkout.amountINR` (pricing computed server-side)
and `checkout.razorpayKeyId`. Invalid plan → 422 with code `INVALID_PLAN`.

### POST /v1/orders/:id/payment

Body mirrors the Razorpay checkout callback: `orderId`, `razorpayOrderId`, `razorpayPaymentId`,
`razorpaySignature`. Server recomputes the HMAC-SHA256 signature over `razorpayOrderId|razorpayPaymentId`
with the Razorpay key secret. Replays return `{ ok: true, alreadyProcessed: true }` instead of 500s.

### GET /v1/orders/:id

```json
{ "order": { "id": "...", "planId": "...", "plan": {...}, "region": "...", "os": "...",
             "billingCycle": "monthly", "amountINR": 999, "status": "PAID|ACTIVE|FAILED|..." } }
```

Status flow: `PENDING → PAID → PROVISIONING → ACTIVE | FAILED` (retries are transparent).

## Internal (127.0.0.1 only)

| Method | Path | Description |
|---|---|---|
| POST | `/internal/jobs/:id/result` | provisioner completion callback (`status: completed\|failed\|retrying` + `server`) |
| POST | `/v1/webhooks/razorpay` | Razorpay webhook (`payment.captured`), HMAC verified, idempotent |
| GET | `/health` | provisioner liveness (`mode: simulated\|real`) |
| POST | `/internal/provision` | provisioner job entry (requires `x-internal-secret`) |

## Error format

`{ "error": "...", "code": "..." }` with 400/401/403/404/422/429/500 as appropriate.