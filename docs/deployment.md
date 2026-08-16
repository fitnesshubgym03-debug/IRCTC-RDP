# Deployment Guide

Production host: 103.216.170.252 — 2 GB RAM, AApanel (BT panel), Ubuntu.

## Architecture

```
Browser ──► Cloudflare (DNS / CDN / WAF) ──► nginx (443, TLS)
                                              ├── irctcrdp.com        → apps/frontend  (Next.js, :3000)
                                              └── api.irctcrdp.com    → apps/backend   (Fastify, :4000)
                                                                         │
                                                                         └── services/provisioner (Fastify, :4001)
                                                                             └── Proxmox VE API (real or simulated)
```

- Frontend: presentation only. It holds **no** pricing authority, no DB access, no secrets.
  Its only env vars are `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_RAZORPAY_KEY_ID`.
- Backend: sole authority for plans, pricing, orders, payments, IPAM, and provisioning jobs.
- Provisioner: isolated service that talks to Proxmox. Auth between backend and provisioner
  uses a shared `INTERNAL_API_SECRET`; the backend never exposes it to the browser.

## Process management (pm2)

`ecosystem.config.cjs` at repo root. Apps: `irctcrdp-frontend` (:3000), `irctcrdp-backend` (:4000),
`irctcrdp-provisioner` (:4001). All three are `online`; run each process from its own directory
so `.env` and `dist/` resolve.

```bash
pm2 start ecosystem.config.cjs
pm2 save
```

Update a service after a change: `pnpm --filter <pkg> build && pm2 restart <app>`.

## Builds

```bash
export PATH=$PATH:/usr/local/nodejs/bin
pnpm install --frozen-lockfile
pnpm --filter @irctcrdp/backend build     # → dist/src/, run: node --env-file=.env dist/src/server.js
pnpm --filter @irctcrdp/provisioner build
# frontend:
cd apps/frontend && NEXT_PUBLIC_API_URL=https://api.irctcrdp.com NEXT_PUBLIC_RAZORPAY_KEY_ID=<key> npx next build
```

## Tests

```bash
pnpm --filter @irctcrdp/backend test      # 29 tests — uses local MySQL DB `irctcrdp_test`
pnpm --filter @irctcrdp/provisioner test  # 4 tests — simulated adapter, no network
```

Test DB: `CREATE DATABASE irctcrdp_test; GRANT ALL ON irctcrdp_test.* TO 'irctcrdp'@'localhost';`
(wired via `MYSQL_URL` in `apps/backend/test/helpers.ts`, `multipleStatements=true`).

## nginx

- Main vhost `/www/server/panel/vhost/nginx/irctcrdp.com.conf` (port 80 → 301, port 443 ssl → :3000).
- API vhost `/www/server/panel/vhost/nginx/api.irctcrdp.com.conf` (443 ssl → :4000; `Cache-Control: no-store`;
  rate limits `api_global` 30 r/s burst 60, `api_auth` 5 r/min burst 5; `client_max_body_size 64k`).
- `nginx.conf` http block: Cloudflare `real_ip` (trust CF ranges, `CF-Connecting-IP`) and the two
  `limit_req_zone`s.

Important: the API vhost must use `listen 443 ssl` **with its own certificate**. A plain `listen 443;`
cannot coexist with another vhost's `listen 443 ssl` on the same port — nginx merges listeners and
fails with `no "ssl_certificate" is defined for the "listen ... ssl" directive`.

```bash
/www/server/nginx/sbin/nginx -t -c /www/server/nginx/conf/nginx.conf && /www/server/nginx/sbin/nginx -s reload
```

Certificates (webroot auth, webroot `/var/www/le` — the port-80 vhosts answer `/.well-known/acme-challenge/`):

```bash
certbot certonly --webroot -w /var/www/le -d api.irctcrdp.com --agree-tos -m admin@irctcrdp.com --no-eff-email --keep-until-expiring
```

## Razorpay

Currently `RAZORPAY_MODE=simulated` (deterministic stub, zero network): payments are `pay_sim_<paise>`
and signatures are HMAC-SHA256. Switch to real payments in `apps/backend/.env`:

1. `RAZORPAY_MODE=test` + test keys, run a smoke checkout.
2. Configure the webhook in the Razorpay dashboard → `https://api.irctcrdp.com/v1/webhooks/razorpay`
   (event: `payment.captured`), paste the webhook secret into `RAZORPAY_WEBHOOK_SECRET`.
3. `RAZORPAY_MODE=live` + live keys only after a successful test-mode run.

The webhook is the only authoritative payment signal; `POST /v1/orders/:id/payment` merely verifies the
client-side signature and is idempotent (`payment_events` unique on `event_id`).

## Cloudflare (api.irctcrdp.com)

- DNS: A record `api.irctcrdp.com` → `103.216.170.252` already exists and resolves; enable the
  orange cloud to proxy through CF (then WAF/bot rules apply).
- SSL/TLS mode: Full (strict) once the origin cert is in place.
- nginx already trusts `CF-Connecting-IP`, so WAF/rate-limit decisions see real client IPs.

## SMTP (pending)

Email verification / password reset are not yet wired. Add a mailer to the backend and set
`ADMIN_EMAILS` for privileged registration before enabling those features.