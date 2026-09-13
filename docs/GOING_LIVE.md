# Turning BoostReviews.AI live

Everything below assumes the app is deployed on Vercel at a domain we call `APP_DOMAIN`
(temporary: `https://<project>.vercel.app`, production: `https://app.boostreviews.ai`).
Replace `APP_DOMAIN` with the real one. The demo needs none of this.

## Google Business Profile

1. **Google Cloud project** — console.cloud.google.com → New project → `BoostReviews AI`.
2. **APIs to enable** (APIs & Services → Library):
   - My Business Account Management API
   - My Business Business Information API
   - Google My Business API (v4, used for reviews and replies)
   - (Optional, competitors) Places API (New)
   Google gates Business Profile APIs: request access at
   https://developers.google.com/my-business/content/prereqs (fill in the API access form
   with the project number; approval typically takes days).
3. **OAuth consent screen** — External; app name BoostReviews.AI; support email; add the
   scope `https://www.googleapis.com/auth/business.manage`; add your own Google account as a
   test user while in Testing. Publishing to Production requires Google verification because
   the scope is sensitive (privacy policy URL on boostreviews.ai, homepage, justification video).
4. **Credentials** — Create OAuth client ID → Web application. Authorized JavaScript origin:
   `https://APP_DOMAIN`. **Authorized redirect URI (exact):**
   `https://APP_DOMAIN/api/google/oauth/callback`
5. **Environment variables** (Vercel → Project → Settings → Environment Variables, Production + Preview):
   ```
   BUSINESS_DATA_PROVIDER=google
   GOOGLE_CLIENT_ID=...apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=...
   GOOGLE_REDIRECT_URI=https://APP_DOMAIN/api/google/oauth/callback
   NEXT_PUBLIC_APP_URL=https://APP_DOMAIN
   ```
6. **Test with your own profile** — sign in, Settings → Integrations → *Connect*, approve the
   Google consent screen, pick the location. `/api/health` shows `"provider":"google"`.
   Verify reviews sync before inviting a customer.
7. **Switching providers** — `src/lib/providers/index.ts` reads `BUSINESS_DATA_PROVIDER`.
   `google` activates `GoogleBusinessProvider`; anything else stays on `DemoBusinessProvider`.
   Token storage goes in the `google_connections` table (server-side only).

## Stripe

1. dashboard.stripe.com → create account (or use existing) → Products.
2. Create three recurring monthly products/prices: Starter $149, Growth $199, Premium $299.
   Copy each Price ID (`price_...`).
3. Developers → API keys: Secret key and Publishable key.
4. Env vars:
   ```
   STRIPE_SECRET_KEY=sk_test_... (later sk_live_...)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_PRICE_STARTER=price_...
   STRIPE_PRICE_GROWTH=price_...
   STRIPE_PRICE_PREMIUM=price_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
5. Developers → Webhooks → Add endpoint. **Endpoint URL (exact):** `https://APP_DOMAIN/api/stripe/webhook`
   Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`,
   `customer.subscription.deleted`, `invoice.paid`, `invoice.payment_failed`. Copy the signing secret.
6. Test: Billing → Upgrade uses Stripe Checkout with card `4242 4242 4242 4242`; the webhook
   handler updates the `subscriptions` table (finish the TODO in `src/app/api/stripe/webhook/route.ts`).
7. Live mode: toggle the dashboard to Live, recreate prices, replace the four `sk_/pk_/price_/whsec_` values.

## Database and auth (Supabase)

1. supabase.com → New project. Run `supabase/migrations/0001_init.sql` in the SQL editor
   (or `supabase db push`).
2. Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only).
3. Authentication → Providers: enable Email (magic link) and Google; set Site URL to
   `https://APP_DOMAIN` and add `https://APP_DOMAIN/app` to redirect URLs. `/api/auth/magic-link`
   already calls `signInWithOtp`.
4. Security: row-level security is enabled in the migration; keep the service-role key out of
   `NEXT_PUBLIC_*`; encrypt `google_connections` tokens with Supabase Vault.
5. Backups: Pro plan daily backups + PITR; export a weekly dump to object storage.
6. Moving off demo data: real accounts are created by onboarding; the demo dataset is never
   written to the database, so no cleanup is needed.

## AI

- Demo/seeded today: reply drafting (`DemoAIService`), sentiment, themes, summaries.
- Production: `AnthropicAIService` (`src/lib/ai/anthropic.ts`) via the Messages API.
- Env vars: `AI_PROVIDER=anthropic`, `ANTHROPIC_API_KEY=sk-ant-...`, optional `AI_MODEL`.
- Activation: set the vars and redeploy; `/api/ai/reply` immediately uses the live model.
  Sentiment/theme extraction runs in the review-sync job (call `analyzeSentiment` per new review).
- Variable cost: reply drafts (per click), sentiment per new review, monthly summaries.
  At typical volumes (30 reviews/month/business) this is cents per business per month.

## Custom domain (app.boostreviews.ai)

1. Vercel → Project → Settings → Domains → Add `app.boostreviews.ai`.
2. DNS at your registrar: **CNAME**, name `app`, value `cname.vercel-dns.com`.
3. Vercel verifies and issues the TLS certificate automatically (a few minutes).
4. Set `NEXT_PUBLIC_APP_URL=https://app.boostreviews.ai`, update `GOOGLE_REDIRECT_URI`, the
   Google authorized redirect URI, and the Stripe webhook URL to the new domain, then redeploy.

## NFC production setup

- URL to program on every card/stand: `https://app.boostreviews.ai/r/<slug>` — HTTPS, no
  query string. Use NFC Tools (iOS/Android) to write an NDEF URL record and lock the tag.
- A slug is created per **location** in `review_cards` at onboarding (the destination
  defaults to that location's Google review link).
- Test: tap with an iPhone → the `/r/<slug>` route logs a `tap_events` row and redirects.
- Destination changes are edits to `review_cards.destination_url`; the chip is never rewritten.
- **Never change after distribution:** the domain `app.boostreviews.ai`, the `/r/` path, and
  each card's slug. Never delete a `review_cards` row — pause it instead.

## Onboarding my first real business

1. Deploy to production, connect `app.boostreviews.ai`, set Supabase + Stripe + Google vars.
2. Connect your own Google Business Profile first and confirm reviews sync.
3. Create the customer's organization, business and location (onboarding flow), add the owner
   by email (magic link).
4. Have the owner complete Google authorization on their own Google account (the one that
   manages their profile).
5. Set the review destination (their Google "write a review" link) and create the review card slug.
6. Program the NFC card/stand with `https://app.boostreviews.ai/r/<slug>`, test on two phones.
7. Add 3–5 competitors (Places IDs) for their area.
8. Take payment: Billing → plan → Stripe Checkout; confirm the webhook set the subscription active.
9. Reply to their unanswered reviews with them in the first session (shows immediate value).
10. Schedule the first monthly report email 30 days out and a check-in call.
