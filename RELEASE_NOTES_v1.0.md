# Quivr v1.0 — Release Notes (Sept 18, 2025)

> **Tagline:** **Quivr — Smarter matches. Safer vibes.**

## Highlights
- **Premium Filters**: distance by city, verified‑only, tag search, with a polished **Paywall Overlay**
- **Favorites**: header tab + long‑press quick favorite on grid
- **Private Storage + Signed URLs**: auto‑blur until approved; BlurHash placeholders
- **Admin Suite**: metrics overview (reports, approval rates, heatmap by city), **Admin Gate** (middleware + server)
- **Geo Map**: city density map using `react-simple-maps`
- **Monetization**: Stripe **Subscriptions (Premium)** + one‑time **Boosts** and **Spotlight** (24h)
- **Moderation**: bulk approve/reject, pagination, SLA badges; signed previews
- **Analytics**: PostHog baseline events
- **A11y + i18n**: focus rings, reduced motion, skip link; translation hook

## New
- Spotlight **feature strip** at grid top with polished cards (avatar/monogram, hover lift, CTA)
- Subscription **Settings** with Upgrade/Manage
- Monetize page for Boost & Spotlight purchase

## Improvements
- Faster grid with client‑side image compression (WebP) and BlurHash
- Search API refactor for tags/verified/distance, plus boosted ordering
- Error handling and env config notes in README

## Fixes
- Admin APIs require role on server and via edge middleware
- Minor layout and focus states across forms

## Technical Notes
- **DB**: ensure `profiles` (premium flags, age/tags/verified), `media.blurHash`, `cities`, `billing_customers`, `boosts`, `spotlights` tables + indexes
- **Stripe events**: `checkout.session.completed`, `customer.subscription.*` (active/trialing → premium=true)
- **Security**: service‑role keys used server‑side only; RLS for user‑owned tables; signed Storage URLs
