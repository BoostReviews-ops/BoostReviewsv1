-- BoostReviews.AI — production schema (Supabase / Postgres)
-- Multi-tenant: organizations → businesses → locations. Every data table hangs
-- off a location so agencies and multi-location businesses work from day one.
-- Apply with:  supabase db push   (or paste into the SQL editor)

create extension if not exists "pgcrypto";

-- ---------- tenancy ----------
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null default 'business' check (type in ('business','agency')),
  created_at timestamptz not null default now()
);

create table if not exists profiles (               -- 1:1 with auth.users
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists memberships (
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member','agency_admin')),
  primary key (org_id, user_id)
);

create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  category text,
  phone text,
  website text,
  timezone text not null default 'America/Chicago',
  created_at timestamptz not null default now()
);

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null,
  address text,
  city text,
  is_primary boolean not null default false,
  google_place_id text,
  google_location_resource text,          -- accounts/{a}/locations/{l}
  google_rating numeric(2,1),
  google_review_count int,
  photos_last_updated_at timestamptz,
  last_post_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- Google connection (server-side tokens only) ----------
create table if not exists google_connections (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  google_account_email text,
  access_token text not null,               -- encrypt at rest (pgsodium / Vault)
  refresh_token text not null,
  expires_at timestamptz not null,
  scopes text[] not null default '{}',
  status text not null default 'active' check (status in ('active','revoked','error')),
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  unique (business_id)
);

-- ---------- reviews ----------
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,
  source text not null default 'google',
  external_id text not null,                -- Google reviewId
  reviewer_name text not null,
  rating smallint not null check (rating between 1 and 5),
  text text,
  reviewed_at timestamptz not null,
  sentiment text check (sentiment in ('positive','neutral','negative')),
  themes text[] not null default '{}',      -- AI-extracted theme keys
  created_at timestamptz not null default now(),
  unique (location_id, source, external_id)
);
create index if not exists reviews_location_date on reviews (location_id, reviewed_at desc);

create table if not exists review_responses (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references reviews(id) on delete cascade,
  text text not null,
  status text not null default 'draft' check (status in ('draft','approved','published','failed')),
  ai_assisted boolean not null default false,
  ai_model text,
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  published_at timestamptz,               -- set only after Google confirms
  created_at timestamptz not null default now()
);

-- ---------- NFC / QR review cards ----------
create table if not exists review_cards (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,
  slug text not null unique,                -- PERMANENT: programmed on the chip → /r/{slug}
  label text not null default 'Front desk review card',
  status text not null default 'active' check (status in ('active','paused')),
  destination_type text not null default 'google_review' check (destination_type in ('google_review','custom')),
  destination_url text not null,            -- editable any time without touching the chip
  installed_at date,
  created_at timestamptz not null default now()
);

create table if not exists tap_events (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references review_cards(id) on delete cascade,
  tapped_at timestamptz not null default now(),
  source text not null default 'nfc' check (source in ('nfc','qr','link')),
  device text,
  user_agent text,
  ip_hash text
);
create index if not exists tap_events_card_time on tap_events (card_id, tapped_at desc);

-- ---------- competitors ----------
create table if not exists competitors (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,
  name text not null,
  category text,
  google_place_id text,
  distance_miles numeric(4,1),
  created_at timestamptz not null default now()
);

create table if not exists competitor_snapshots (
  id uuid primary key default gen_random_uuid(),
  competitor_id uuid not null references competitors(id) on delete cascade,
  captured_on date not null,
  rating numeric(2,1),
  total_reviews int,
  unique (competitor_id, captured_on)
);

-- ---------- scores & health ----------
create table if not exists reputation_score_snapshots (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,
  captured_on date not null,
  score smallint not null,
  factors jsonb not null,                   -- [{key, points, maxPoints, delta, explanation}]
  unique (location_id, captured_on)
);

create table if not exists profile_health_snapshots (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,
  captured_on date not null,
  score smallint not null,
  checks jsonb not null,
  unique (location_id, captured_on)
);

-- ---------- AI insights ----------
create table if not exists themes (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  key text not null,
  label text not null,
  polarity text not null check (polarity in ('positive','negative')),
  mention_count int not null,
  share numeric(5,4),
  change numeric(6,4),
  unique (location_id, period_start, period_end, key)
);

create table if not exists insights (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,
  kind text not null check (kind in ('working','attention','summary','competitor')),
  title text not null,
  detail text,
  href text,
  generated_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists recommended_actions (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,
  title text not null,
  why text not null,
  impact text not null check (impact in ('high','medium','low')),
  effort text,
  href text,
  category text,
  status text not null default 'open' check (status in ('open','completed','dismissed')),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists monthly_reports (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  payload jsonb not null,                   -- MonthlyReport shape
  pdf_url text,
  emailed_at timestamptz,
  share_token text unique,
  created_at timestamptz not null default now(),
  unique (location_id, period_start)
);

-- ---------- billing ----------
create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  plan text not null check (plan in ('starter','growth','premium')),
  status text not null,
  current_period_end timestamptz,
  payment_method_brand text,
  payment_method_last4 text,
  updated_at timestamptz not null default now()
);

-- ---------- website services (separate offering) ----------
create table if not exists website_leads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete set null,
  contact_name text not null,
  email text not null,
  phone text,
  website_url text,
  notes text,
  status text not null default 'new' check (status in ('new','contacted','closed')),
  created_at timestamptz not null default now()
);

-- ---------- future: SMS / email review requests ----------
create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,
  name text,
  email text,
  phone text,
  last_visit_at timestamptz,
  consent_sms boolean not null default false,
  consent_email boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists review_request_campaigns (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,
  name text not null,
  channel text not null check (channel in ('sms','email')),
  template text not null,
  send_delay_minutes int not null default 120,
  status text not null default 'draft' check (status in ('draft','active','paused')),
  created_at timestamptz not null default now()
);

create table if not exists review_requests (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references review_request_campaigns(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  sent_at timestamptz,
  delivered_at timestamptz,
  clicked_at timestamptz,
  reviewed_at timestamptz,
  status text not null default 'queued' check (status in ('queued','sent','delivered','clicked','reviewed','failed'))
);

-- ---------- row level security ----------
alter table organizations enable row level security;
alter table businesses enable row level security;
alter table locations enable row level security;
alter table reviews enable row level security;
alter table review_responses enable row level security;
alter table review_cards enable row level security;
alter table tap_events enable row level security;
alter table competitors enable row level security;
alter table recommended_actions enable row level security;
alter table monthly_reports enable row level security;
alter table subscriptions enable row level security;
alter table website_leads enable row level security;
alter table google_connections enable row level security;

create or replace function is_org_member(org uuid) returns boolean language sql stable as $$
  select exists (select 1 from memberships m where m.org_id = org and m.user_id = auth.uid());
$$;

create policy org_read on organizations for select using (is_org_member(id));
create policy business_rw on businesses for all using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy location_rw on locations for all
  using (exists (select 1 from businesses b where b.id = business_id and is_org_member(b.org_id)))
  with check (exists (select 1 from businesses b where b.id = business_id and is_org_member(b.org_id)));

-- Location-scoped tables share one policy shape:
create policy reviews_rw on reviews for all
  using (exists (select 1 from locations l join businesses b on b.id = l.business_id where l.id = location_id and is_org_member(b.org_id)));
create policy review_cards_rw on review_cards for all
  using (exists (select 1 from locations l join businesses b on b.id = l.business_id where l.id = location_id and is_org_member(b.org_id)));
create policy actions_rw on recommended_actions for all
  using (exists (select 1 from locations l join businesses b on b.id = l.business_id where l.id = location_id and is_org_member(b.org_id)));
create policy reports_rw on monthly_reports for all
  using (exists (select 1 from locations l join businesses b on b.id = l.business_id where l.id = location_id and is_org_member(b.org_id)));
create policy competitors_rw on competitors for all
  using (exists (select 1 from locations l join businesses b on b.id = l.business_id where l.id = location_id and is_org_member(b.org_id)));
create policy subscriptions_r on subscriptions for select using (is_org_member(org_id));
-- google_connections and tap_events are written by the server (service role) only; no client policies.
-- Public tap redirects resolve review_cards via the service role in the /r/{slug} route.
