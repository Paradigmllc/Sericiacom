-- F46: pSEO keyword research scoring table.
--
-- Stores DeepSeek V4-generated 4-axis scores for every (matrix combination
-- × locale) keyword. The composite score gates whether the pSEO brief
-- enters the generation queue (`sericia_pseo_briefs`) — only composite ≥ 60
-- combinations get articles written.
--
-- Indexed for "rank by composite within locale" queries that the
-- expand-pseo-briefs.ts script runs to pick top-N keywords per locale.
--
-- Companion table: `sericia_pseo_briefs` (existing). Flow:
--   1. matrix expansion script writes ALL combinations here with scores
--   2. expand-pseo-briefs.ts reads composite ≥ 60 rows, inserts into
--      sericia_pseo_briefs as pending
--   3. drain-pseo-queue.ts generates articles for those briefs

create table if not exists sericia_pseo_keyword_research (
  id          uuid primary key default gen_random_uuid(),
  -- Matrix axis used to derive this keyword.
  -- "guides" | "compare" | "uses"
  axis        text not null check (axis in ('guides', 'compare', 'uses')),
  -- Composite slug — for guides: "<country>:<product>", for compare:
  -- "<a>:<b>", for uses: "<product>:<case>". Unique within locale.
  combo_slug  text not null,
  locale      text not null check (locale in ('en','ja','de','fr','es','it','ko','zh-TW','ru','ar','nl')),
  topic       text not null,                   -- human-readable headline
  keywords    jsonb not null default '[]'::jsonb,

  -- 4-axis scores from DeepSeek V4
  demand       int not null check (demand between 0 and 100),
  commercial   int not null check (commercial between 0 and 100),
  difficulty   int not null check (difficulty between 0 and 100),
  sericia_fit  int not null check (sericia_fit between 0 and 100),
  composite    int not null check (composite between 0 and 100),
  rationale    text,

  -- Operational
  scored_at   timestamptz not null default now(),
  scored_by   text not null default 'deepseek-v4-flash',
  promoted    boolean not null default false,    -- has been pushed into pseo_briefs?
  promoted_at timestamptz,

  unique (axis, combo_slug, locale)
);

create index if not exists idx_pseo_research_composite
  on sericia_pseo_keyword_research (locale, composite desc);

create index if not exists idx_pseo_research_axis_locale
  on sericia_pseo_keyword_research (axis, locale, composite desc);

create index if not exists idx_pseo_research_pending_promote
  on sericia_pseo_keyword_research (promoted, composite desc)
  where promoted = false and composite >= 60;

-- RLS — service role only (the script runs under service role, no
-- end-user access).
alter table sericia_pseo_keyword_research enable row level security;

drop policy if exists pseo_research_service_only on sericia_pseo_keyword_research;
create policy pseo_research_service_only
  on sericia_pseo_keyword_research
  for all
  to service_role
  using (true)
  with check (true);

comment on table sericia_pseo_keyword_research is
  'F46: DeepSeek V4 4-axis keyword scoring. Gate for sericia_pseo_briefs promotion.';
