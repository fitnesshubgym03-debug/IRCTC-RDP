# Security Audit

Status: reviewed 2026-08-16 after monorepo cutover and test suite (33 tests) went green.

## Verified

- **No secrets in the frontend**: `apps/frontend/.env.local` contains only
  `NEXT_PUBLIC_API_URL=https://api.irctcrdp.com`. Build grep for `MYSQL_URL`, `<db-password>`,
  `simulated_secret` → 0 matches. Frontend never receives database, internal, or provisioning secrets.
- **Pricing is server-authoritative**: the client sends only `planId`/`region`/`os`/`billingCycle`;
  `amountINR` is computed in the backend and sent to Razorpay. Tampering with client payloads cannot
  change a price.
- **Payment verification is HMAC-based**: `POST /v1/orders/:id/payment` recomputes the Razorpay
  signature server-side; the webhook is the authoritative capture signal and is idempotent
  (unique `payment_events.event_id`).
- **Internal API shielded**: backend binds 127.0.0.1; provisioner binds 127.0.0.1:4001 and requires
  `x-internal-secret` (HMAC-verified). No internal route is published through nginx/Cloudflare.
- **Session handling**: httpOnly cookie, 30-day TTL, ownership enforced on order reads/writes for
  signed-in users (guest checkout still allowed).
- **Rate limiting**: nginx zones `api_global` 30 r/s (burst 60) + `api_auth` 5 r/min (burst 5);
  app-level limiter on register/login/contact.
- **Headers**: API responds `Cache-Control: no-store`; orders responses must not be cached.
- **TLS**: valid Let's Encrypt certs for both domains; Cloudflare real-IP trust configured.
- **DB**: application uses the least-privileged `irctcrdp` account; panel root MySQL password kept
  out of the repository and out of the frontend.

## Open items

1. **Razorpay mode is `simulated`** — real test/live keys + webhook secret must be added before
   public launch (see `docs/deployment.md` → Razorpay).
2. **SMTP absent** — email verification and password reset are not wired; `ADMIN_EMAILS` is unused
   until a mailer exists. Guest checkout means this is acceptable pre-launch.
3. **Cloudflare orange cloud** on `api.irctcrdp.com` — enable + SSL mode Full (strict) so WAF rules
   apply to the API.
4. **Proxmox** — the real adapter is implemented but only the simulated adapter is exercised in
   production; add real cluster credentials, then require a Proxmox user with least privilege
   (VM.Audit, VM.Clone, VM.Config.*, VM.PowerMgmt, Datastore.AllocateSpace, Pool.Allocate) and
   restrict it to the provisioning pool.
5. **Rate limits on order creation** — global zone covers it, but consider a stricter per-IP cap on
   `POST /v1/orders` if abuse appears.
6. **pm2 logs** — check `pm2 logs` retention; ship logs off-host (e.g., daily journald/rsyslog
   rotation) if compliance requires it.

## Regression guard

Run `pnpm --filter @irctcrdp/backend test` and `pnpm --filter @irctcrdp/provisioner test` before any
change to pricing, payments, provisioning, or auth. The suite covers: pricing correctness per plan/region
(independent of client input), HMAC signature rejection, webhook dedup and bad-signature rejection,
full order→provision→IP-allocate lifecycle (incl. retry/failure paths), IPAM free/reserved/allocated
transitions, auth flows, and cross-customer access denial.