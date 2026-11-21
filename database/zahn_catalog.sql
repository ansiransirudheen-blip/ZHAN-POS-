create table public.zahn_catalog (
owner_id uuid not null references auth.users(id), id text not null,
kind text not null check(kind in ('category','item')),
name text not null check(length(trim(name)) between 1 and 100),
category_id text, sizes jsonb not null default '[]' check(jsonb_typeof(sizes)='array'),
price numeric(12,2) check(price>=0), revision integer not null default 1,
primary key(owner_id,id));
alter table public.zahn_catalog enable row level security;
revoke all on public.zahn_catalog from anon, public;
grant select,insert,update on public.zahn_catalog to authenticated;
create policy catalog_read on public.zahn_catalog for select to authenticated using ((select auth.uid())=owner_id);
create policy catalog_add on public.zahn_catalog for insert to authenticated with check ((select auth.uid())=owner_id);
create policy catalog_edit on public.zahn_catalog for update to authenticated using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
create unique index zahn_catalog_unique_name on public.zahn_catalog(owner_id,kind,coalesce(category_id,''),lower(trim(name)));