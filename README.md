# BoostReviewsAI

Reputation management and Google Business intelligence for local businesses.
Customers tap an NFC review card at the counter; owners get one Reputation Score,
plain-English insights, AI-drafted replies, competitor intelligence and a monthly report.

This repository is the web application (Next.js 16, React 19, TypeScript, Tailwind v4).
It ships **demo-first**: the fully populated demo customer *Royal Massage & Spa* runs with
zero external credentials. Production integrations (Google Business Profile, Stripe,
Supabase, AI) are architected and env-gated — see `docs/GOING_LIVE.md`.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
npm run lint
```

No `.env` is required for the demo. Copy `.env.example` to `.env.local` when enabling integrations.

## Routes

| Route | What it is |
| --- | --- |
| `/` | Public landing page |
| `/demo` | "Explore Live Demo" → loads Royal Massage & Spa |
| `/app` | Overview (Reputation Score, what's working, needs attention, next best actions) |
| `/app/reviews` | Review inbox with filters and AI reply drafting |
| `/app/insights` | Sentiment and themes |
| `/app/review-card` | NFC card status, dynamic destination, QR code, tap analytics |
| `/app/competitors` | Competitor intelligence |
| `/app/google-profile` | Google Profile Health |
| `/app/reports` | Monthly Reputation Report |
| `/app/billing` · `/app/settings` · `/app/website` | Billing, settings, website-upgrade upsell |
| `/onboarding` · `/login` | Future-ready onboarding and sign-in |
| `/r/[slug]` | **Permanent NFC/QR redirect** programmed onto physical cards |
| `/api/*` | AI reply, Stripe checkout/webhook, Google OAuth, NFC tap, website audit, health |

## Architecture

```
src/lib/types.ts            Domain types shared by every provider
src/lib/providers/          BusinessDataProvider seam
  demo.ts                     DemoBusinessProvider  (active)
  google.ts                   GoogleBusinessProvider (production, env-gated)
src/lib/ai/                 AIService seam: DemoAIService (active) / AnthropicAIService (env-gated)
src/lib/scoring/            Reputation Score + Google Profile Health methodology
src/lib/demo/               Seeded dataset generator + pure analytics
src/lib/store/demoStore.ts  Persisted demo edits (localStorage); "Reset demo" clears it
src/lib/hooks/useBusinessData.ts  Single view-model hook — all numbers derive from one place
supabase/migrations/        Production Postgres schema (multi-business, multi-location)
docs/GOING_LIVE.md          Exact steps to turn the demo into production
```

Switching from demo to production is configuration: set `BUSINESS_DATA_PROVIDER=google`
plus the Google/Supabase keys. The UI never imports a provider directly.

## Brand

`public/brand/boostreviews-logo.png` is the official, locked logo asset. Favicons and the
OG image are cropped from it, never redrawn.
