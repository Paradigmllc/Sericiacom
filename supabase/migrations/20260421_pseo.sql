-- Sericia pSEO — multi-country × product guides
create table if not exists sericia_pseo (
  slug text primary key,
  country_code text not null,
  country_name text not null,
  product_slug text not null,
  product_name text not null,
  title text not null,
  meta_description text not null,
  intro_md text not null,
  why_japanese_md text not null,
  shipping_info_md text not null,
  faq jsonb not null default '[]'::jsonb,
  related_drop_handle text,
  published_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists sericia_pseo_country_idx on sericia_pseo(country_code);
create index if not exists sericia_pseo_product_idx on sericia_pseo(product_slug);

alter table sericia_pseo enable row level security;
create policy "public read sericia_pseo"
  on sericia_pseo for select
  using (true);
