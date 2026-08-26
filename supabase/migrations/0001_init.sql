-- Haberbot: kategoriler + haberler
-- Supabase Dashboard → SQL Editor içinde çalıştır.

create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  meta_title text,
  meta_description text
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text,
  content text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_articles_slug on public.articles (slug);
create index if not exists idx_articles_status on public.articles (status);
create index if not exists idx_articles_category on public.articles (category);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists articles_updated_at on public.articles;
create trigger articles_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.articles enable row level security;

drop policy if exists "categories_select_public" on public.categories;
create policy "categories_select_public"
  on public.categories for select
  to public
  using (true);

drop policy if exists "articles_select_published" on public.articles;
create policy "articles_select_published"
  on public.articles for select
  to public
  using (status = 'published');

-- Yazma: service_role (admin API). Anon ile insert/update yok.

insert into public.categories (name, slug)
values ('Gündem', 'gundem'), ('Ekonomi', 'ekonomi')
on conflict (slug) do nothing;
