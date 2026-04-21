-- M4a-6 — Marketing automation columns + RPCs for n8n workflows
--
-- Consumed by:
--   n8n-workflows/abandoned-cart.json     → list_abandoned_carts, PATCH cart_abandoned_notified
--   n8n-workflows/post-purchase-review.json → list_review_targets,  PATCH review_requested
--
-- Idempotent: safe to re-run. Uses `add column if not exists` + `create or replace function`.
-- RLS stays restricted to service_role (existing sericia_orders policy covers these new columns).

-- ──────────────────────────────────────────────────────────────
-- 1. Columns: idempotency markers so n8n workflows never double-email
-- ──────────────────────────────────────────────────────────────

alter table sericia_orders
  add column if not exists cart_abandoned_notified    boolean     not null default false,
  add column if not exists cart_abandoned_notified_at timestamptz,
  add column if not exists review_requested           boolean     not null default false,
  add column if not exists review_requested_at        timestamptz;

-- Partial indexes — n8n scans these hourly/daily, most rows are already notified=true
create index if not exists idx_orders_cart_abandon_pending
  on sericia_orders(created_at)
  where status = 'pending' and cart_abandoned_notified = false;

create index if not exists idx_orders_review_pending
  on sericia_orders(paid_at)
  where status = 'paid' and review_requested = false;

-- ──────────────────────────────────────────────────────────────
-- 2. RPC: list_abandoned_carts
--    Returns orders that have been `pending` for longer than N minutes
--    and have not yet been notified.
--    Default: 60 min grace (per industry standard abandoned-cart trigger timing).
-- ──────────────────────────────────────────────────────────────

create or replace function list_abandoned_carts(
  older_than_minutes integer default 60,
  not_yet_notified   boolean default true
)
returns table (
  id         uuid,
  email      text,
  full_name  text,
  amount_usd integer,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    o.id,
    o.email,
    o.full_name,
    o.amount_usd,
    o.created_at
  from sericia_orders o
  where o.status = 'pending'
    and o.created_at < now() - make_interval(mins => older_than_minutes)
    and (not not_yet_notified or o.cart_abandoned_notified = false)
    and o.email is not null
    and o.email <> ''
  order by o.created_at asc
  limit 200;
$$;

-- ──────────────────────────────────────────────────────────────
-- 3. RPC: list_review_targets
--    Returns paid orders that landed N days ago and have not yet
--    been asked for a review. Drives UGC / Google Merchant reviews.
--    Default: 3 days (enough time for EMS delivery + first tasting).
-- ──────────────────────────────────────────────────────────────

create or replace function list_review_targets(
  paid_days_ago     integer default 3,
  not_yet_requested boolean default true
)
returns table (
  id         uuid,
  email      text,
  full_name  text,
  paid_at    timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    o.id,
    o.email,
    o.full_name,
    o.paid_at
  from sericia_orders o
  where o.status = 'paid'
    and o.paid_at is not null
    and o.paid_at < now() - make_interval(days => paid_days_ago)
    and o.paid_at > now() - make_interval(days => paid_days_ago + 1)
    and (not not_yet_requested or o.review_requested = false)
    and o.email is not null
    and o.email <> ''
  order by o.paid_at asc
  limit 200;
$$;

-- Grant execute to the service role (n8n uses the Supabase service-role key
-- via genericAuthType=httpHeaderAuth — see n8n-workflows/*.json).
grant execute on function list_abandoned_carts(integer, boolean) to service_role;
grant execute on function list_review_targets(integer, boolean)   to service_role;

-- ──────────────────────────────────────────────────────────────
-- 4. (Optional future) notes
-- ──────────────────────────────────────────────────────────────
-- When the welcome-email workflow matures, add `welcomed_at timestamptz` to
-- sericia_profiles so we can suppress duplicate coupon sends if a user triggers
-- auth.signup more than once (e.g., deleted + re-created). Out of scope here.
