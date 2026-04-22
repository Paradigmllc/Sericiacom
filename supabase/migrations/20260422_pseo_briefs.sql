-- ─────────────────────────────────────────────────────────────────────────
-- Sericia pSEO brief queue
-- Purpose: topics-to-generate backlog that feeds the Payload `articles`
--          collection via /api/pseo/generate (called from n8n cron).
-- Distinct from `sericia_pseo` (static country × product guides, 64 rows
-- max). This table is evergreen editorial generation, unbounded.
-- ─────────────────────────────────────────────────────────────────────────

create table if not exists sericia_pseo_briefs (
  id               bigserial primary key,

  -- Brief inputs (what editorial/marketing fills in)
  topic            text   not null,
  -- Locales MUST match Payload's localization.locales set in payload.config.ts
  -- AND the PseoLocale union in storefront/lib/pseo.ts. Any change requires
  -- updating all three.
  locale           text   not null check (locale in
                     ('en','ja','de','fr','es','it','ko','zh-TW','ru','ar')),
  keywords         text[] not null,
  related_product_handle text,
  cluster          text,
  grounding_facts  text[] not null default array[]::text[],

  -- Queue state machine
  -- pending    : freshly inserted, waiting for a worker
  -- processing : a worker has claimed it; processing_started_at stamps when
  -- done       : article persisted; article_slug links to Payload
  -- failed     : generation/validation/persist error; error column has detail
  status           text not null default 'pending'
                     check (status in ('pending','processing','done','failed')),
  processing_started_at timestamptz,
  attempts         int  not null default 0,
  last_error       text,

  -- Output linkage
  article_slug     text,         -- payload articles.slug once persisted
  article_id       text,         -- payload doc id (text to stay DB-agnostic)

  -- Telemetry (cache-hit audit, cost accounting)
  usage            jsonb,        -- { prompt_tokens, completion_tokens,
                                 --   prompt_cache_hit_tokens, total_tokens }
  prompt_version   text,
  elapsed_ms       int,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  completed_at     timestamptz
);

-- A single-topic deduplication index. If marketing submits the same topic
-- twice for the same locale, we reject the second one at the app layer
-- (see /api/pseo/briefs route) — but the index keeps it honest at the DB.
create unique index if not exists idx_pseo_briefs_topic_locale
  on sericia_pseo_briefs (lower(topic), locale)
  where status in ('pending','processing','done');

-- Worker dequeue index — supports the FOR UPDATE SKIP LOCKED claim pattern.
create index if not exists idx_pseo_briefs_pending
  on sericia_pseo_briefs (created_at)
  where status = 'pending';

-- Recovery index — find stale 'processing' rows (crashed workers).
create index if not exists idx_pseo_briefs_processing
  on sericia_pseo_briefs (processing_started_at)
  where status = 'processing';

-- updated_at auto-bump trigger.
create or replace function sericia_pseo_briefs_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_pseo_briefs_updated_at on sericia_pseo_briefs;
create trigger trg_pseo_briefs_updated_at
  before update on sericia_pseo_briefs
  for each row execute function sericia_pseo_briefs_touch_updated_at();

-- RLS: service-role only. No public read — briefs contain keyword strategy
-- we don't want competitors scraping via a public endpoint.
alter table sericia_pseo_briefs enable row level security;

-- No policies added → service_role key bypasses RLS but anon/authenticated
-- have zero access. Explicit by design.

comment on table sericia_pseo_briefs is
  'pSEO article generation queue. Consumed by /api/pseo/generate (cron via n8n).';
comment on column sericia_pseo_briefs.usage is
  'DeepSeek usage JSON: prompt_tokens, completion_tokens, prompt_cache_hit_tokens, total_tokens. Used for cache-hit % dashboards.';
