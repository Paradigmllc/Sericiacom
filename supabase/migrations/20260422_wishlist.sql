-- Wishlist + waitlist metadata — luxury UX upgrade (2026-04-22)

-- 1) Add product-level metadata to waitlist (for PDP notify-me)
alter table sericia_waitlist
  add column if not exists metadata jsonb;

create index if not exists idx_waitlist_metadata_product
  on sericia_waitlist ((metadata ->> 'productId'));

-- 2) Wishlist table (user-scoped, synced from client Zustand store for logged-in users)
create table if not exists sericia_wishlist (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists idx_wishlist_user on sericia_wishlist(user_id, created_at desc);
create index if not exists idx_wishlist_product on sericia_wishlist(product_id);

alter table sericia_wishlist enable row level security;

-- Owner can read their own saved items
drop policy if exists "wishlist_select_own" on sericia_wishlist;
create policy "wishlist_select_own"
  on sericia_wishlist for select
  using (auth.uid() = user_id);

-- Owner can insert their own
drop policy if exists "wishlist_insert_own" on sericia_wishlist;
create policy "wishlist_insert_own"
  on sericia_wishlist for insert
  with check (auth.uid() = user_id);

-- Owner can delete their own
drop policy if exists "wishlist_delete_own" on sericia_wishlist;
create policy "wishlist_delete_own"
  on sericia_wishlist for delete
  using (auth.uid() = user_id);
