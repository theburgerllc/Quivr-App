# quivr — LGBTQIA+ Dating App (Next.js 15 · React 19 · Supabase · Mapbox · Stripe)

**Institutional-grade** scaffold that is deployment-ready and engineered for growth:
- Grindr-like **proximity grid**
- Sniffies-style **interactive map**
- **Realtime chat** (Supabase Realtime)
- **Taps** (quick reactions), **filters**, **presence**
- **Stripe** subscriptions (Quivr Plus)
- **Privacy-first** geo (fuzzing, toggle distance)
- Production CI tips, RLS policies, and security checklist

> Target: **Vercel + Supabase + Mapbox + Stripe** (September 2025 stack).

---

## 0) Tech Quick Sheet
- **Node:** ≥ 20.11 (use 22.x if available)
- **Next.js:** 15.0.3 (App Router, React Compiler enabled)
- **React:** 19.0.0
- **Tailwind:** 3.4.x (upgrade to v4 once ecosystem stabilizes)
- **Supabase:** Auth + Postgres + Realtime
- **Mapbox GL:** 3.x
- **Stripe:** 2024-06-20 API (via `stripe@^16`)

---

## 1) Environment Variables (copy `.env.example` → `.env.local`)

### Required
```
# App
NEXT_PUBLIC_APP_NAME=Quivr
NEXT_PUBLIC_SITE_URL=https://your-domain.com
ENCRYPTION_SECRET=change-me-32-bytes-min

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...   # server-only, set in Vercel env (never client)

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxxxx

# Stripe
STRIPE_SECRET_KEY=sk_live_or_test_xxx
STRIPE_PRICE_ID_PLUS=price_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Optional
```
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx.ingest.sentry.io/xxx
```

**Vercel:** set these in **Project Settings → Environment Variables** for Production & Preview.

---

## 2) Supabase Setup

1. Create project → copy **Project URL** and **Anon key** into `.env.local`.
2. **Run migration:** open SQL editor and execute `supabase/migrations/001_init.sql`.
3. **Auth Providers:** enable Email (magic link). Add Apple/Google later.
4. **Realtime:** enable for `messages` table (Database → Replication).
5. **RLS Policies (recommended starting point):**
   - `public_profiles_view`: `SELECT` for **anon** (anyone can browse public profiles)
   - `profiles`:
     - `SELECT`: for **authenticated**
     - `UPDATE`: `WITH CHECK (id = auth.uid())`
   - `conversations`:
     - `SELECT`: `WHERE a = auth.uid() OR b = auth.uid()`
     - `INSERT`: `WITH CHECK (a = auth.uid() OR b = auth.uid())`
   - `messages`:
     - `SELECT`: `EXISTS (SELECT 1 FROM conversations c WHERE c.id = conversation_id AND (c.a = auth.uid() OR c.b = auth.uid()))`
     - `INSERT`: `WITH CHECK (sender = auth.uid() AND EXISTS (SELECT 1 FROM conversations c WHERE c.id = conversation_id AND (c.a = auth.uid() OR c.b = auth.uid())))`
   - `taps`:
     - `SELECT`: `receiver = auth.uid() OR sender = auth.uid()`
     - `INSERT`: `WITH CHECK (sender = auth.uid())`

> Lock down further as you grow (rate limits, abuse controls, audit logs).

---

## 3) Stripe Setup (Subscriptions)

1. Create a **Product** “Quivr Plus” and **Price** (monthly) → copy **Price ID** to `STRIPE_PRICE_ID_PLUS`.
2. Create a **Webhook endpoint** at:  
   `${NEXT_PUBLIC_SITE_URL}/api/stripe/webhook`  
   Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
3. Copy the generated **Signing secret** to `STRIPE_WEBHOOK_SECRET`.
4. Map Stripe `customer` → user `id` (store mapping when creating session or post-checkout).  
   In `app/api/stripe/webhook/route.ts`, update the user’s `profiles.plan` to `'plus'` on active subscription.

---

## 4) Mapbox

- Create Access Token → set `NEXT_PUBLIC_MAPBOX_TOKEN`.
- Styles: using `dark-v11` by default; swap as you like.
- Production: restrict token usage to your domains.

---

## 5) Develop Locally

```bash
pnpm i         # or npm i
cp .env.example .env.local
pnpm dev
# open http://localhost:3000
```

Key routes:
- `/grid` — proximity grid with filters
- `/map` — interactive map with pins
- `/messages` — conversation list (uses `my_conversations()` RPC)
- `/messages/[id]` — realtime chat (Supabase Realtime)
- `/profile` — profile editor (+ set location)
- `/plus` — Stripe checkout

---

## 6) Deploy to Vercel (Production)

```bash
npm i -g vercel
vercel link              # link project
vercel                   # first deploy
# then set envs in dashboard, redeploy
```

**Build Command:** `next build`  
**Install Command:** (auto)  
**Output:** Next.js default

---

## 7) UX / UI Decisions

- **Minimal, photo-first cards** with gradient overlays and online dots.
- **FiltersBar** persists to `localStorage`; applies to Supabase query.
- **Privacy-first geo:** distances shown only when allowed; add server-side jitter if required.
- **NSFW-ready**: add `blur-nsfw` CSS class and a boolean flag to profile media to blur by default.
- **Performance:** grid pagination (extend to infinite scroll), map pins limited (extend to clustering).

---

## 8) Security & Compliance Checklist

- [ ] Never expose `SUPABASE_SERVICE_ROLE_KEY` to client
- [ ] Strong RLS policies; verify with Supabase Policy Simulator
- [ ] Rate-limit inserts (messages/taps) with Postgres policies or API gateway
- [ ] Image moderation / blur NSFW by default; user-based content flags
- [ ] Obfuscate exact coordinates (jitter or rounding); never show home-precision
- [ ] Stripe webhooks validate signature; map to user securely
- [ ] Logging + alerting (Sentry, PostHog) without PII leakage
- [ ] App Store readiness: content filters, report/block, user safety pages

---

## 9) Roadmap (Fast Upgrades)

- Presence heartbeat & last-seen updates via Edge Functions
- Marker clustering + heatmaps
- Saved searches & favorites
- Incognito mode (hide online/last seen/distance)
- OAuth providers (Apple/Google), phone auth (SMS)
- Media albums with signed URLs + moderation queue
- In-app purchases (iOS/Android) mirroring Stripe entitlements

---

## 10) File Tree (key)

```
app/
  (auth)/login/page.tsx         # magic-link auth
  layout.tsx
  page.tsx
  grid/page.tsx
  map/page.tsx
  messages/page.tsx
  messages/[id]/page.tsx
  profile/page.tsx
  plus/page.tsx
  api/stripe/create-checkout-session/route.ts
  api/stripe/webhook/route.ts
components/
  FiltersBar.tsx
  ProfileCard.tsx
lib/
  supabaseClient.ts
  geo.ts
supabase/
  migrations/001_init.sql
tailwind.config.js
postcss.config.js
next.config.mjs
.env.example
```

---

## Notes

- This repo uses client-side Supabase Auth for simplicity. For SSR, add `@supabase/ssr` helpers and server components.
- Distance and nearby queries can be moved server-side via the `profiles_nearby()` RPC (already included).
- Replace placeholder UI and copy with your brand. The design tokens are centralized in Tailwind `colors.brand`.

**You now have a fully deployable, modern LGBTQIA+ dating app foundation.** Ship it, measure, iterate, and scale.


## Notes
- Ensure `media.blurHash` (text) column exists.
- Add `NEXT_PUBLIC_POSTHOG_KEY` to `.env.local` for analytics.
- Admin gate uses cookie `role=admin`; replace with your session in production.
