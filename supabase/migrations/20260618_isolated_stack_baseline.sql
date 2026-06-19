-- C.A.R.S isolated self-hosted Supabase — baseline of the live security model.
-- Captures what is currently applied on the advance1 VM (cars-supabase) so the
-- repo is the source of truth. Safe to re-run (idempotent where practical).
--
-- Roles assumed present (created by the Supabase self-host image): anon,
-- authenticated, service_role, authenticator.

-- ─────────────────────────────────────────────────────────────────────────
-- 1. Non-recursive admin check (SECURITY DEFINER bypasses RLS on profiles)
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as
$$ select coalesce((select is_admin from public.profiles where id = auth.uid()), false) $$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- caller's own customer ids (used by client RLS without recursion)
create or replace function public.my_customer_ids()
returns setof uuid language sql security definer stable set search_path = public as
$$ select id from public.customers where user_id = auth.uid() $$;
grant execute on function public.my_customer_ids() to anon, authenticated, service_role;

-- ─────────────────────────────────────────────────────────────────────────
-- 2. profiles policies (fix infinite recursion; own-row + function-based admin)
-- ─────────────────────────────────────────────────────────────────────────
drop policy if exists admin_access_all on public.profiles;
create policy admin_access_all on public.profiles for all
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists users_update_own_profile on public.profiles;
create policy users_update_own_profile on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id and is_admin = public.is_admin());
-- (users_select_own_profile / users_insert_own_profile remain as imported)

-- ─────────────────────────────────────────────────────────────────────────
-- 3. Client "own-data" policies (the customer portal read/write surface).
--    admin_access_all already grants admins full access on each table.
-- ─────────────────────────────────────────────────────────────────────────
drop policy if exists client_select_own on public.customers;
create policy client_select_own on public.customers for select using (user_id = auth.uid());
drop policy if exists client_insert_own on public.customers;
create policy client_insert_own on public.customers for insert with check (user_id = auth.uid());
drop policy if exists client_update_own on public.customers;
create policy client_update_own on public.customers for update using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists client_select_own on public.vehicles;
create policy client_select_own on public.vehicles for select using (customer_id in (select public.my_customer_ids()));
drop policy if exists client_insert_own on public.vehicles;
create policy client_insert_own on public.vehicles for insert with check (customer_id in (select public.my_customer_ids()));

drop policy if exists client_select_own on public.work_orders;
create policy client_select_own on public.work_orders for select using (customer_id in (select public.my_customer_ids()));
drop policy if exists client_select_own on public.customer_documents;
create policy client_select_own on public.customer_documents for select using (customer_id in (select public.my_customer_ids()));
drop policy if exists client_select_own on public.repair_photos;
create policy client_select_own on public.repair_photos for select using (customer_id in (select public.my_customer_ids()));
drop policy if exists client_select_own on public.invoices;
create policy client_select_own on public.invoices for select using (customer_id in (select public.my_customer_ids()));
drop policy if exists client_select_own on public.status_updates;
create policy client_select_own on public.status_updates for select
  using (work_order_id in (select id from public.work_orders where customer_id in (select public.my_customer_ids())));
drop policy if exists client_select_own on public.invoice_line_items;
create policy client_select_own on public.invoice_line_items for select
  using (invoice_id in (select id from public.invoices where customer_id in (select public.my_customer_ids())));
-- inventory + work_order_parts stay admin-only (internal cost data).

-- ─────────────────────────────────────────────────────────────────────────
-- 4. One customer row per login (prevents the .single() duplicate-row hang)
-- ─────────────────────────────────────────────────────────────────────────
create unique index if not exists customers_user_id_unique on public.customers(user_id) where user_id is not null;

-- ─────────────────────────────────────────────────────────────────────────
-- 5. Append-only audit log + triggers on mutating tables
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.audit_log (
  id           bigint generated always as identity primary key,
  occurred_at  timestamptz not null default now(),
  actor_id     uuid,
  actor_email  text,
  action       text not null,
  table_name   text not null,
  row_id       text,
  old_data     jsonb,
  new_data     jsonb
);
create index if not exists audit_log_table_time_idx on public.audit_log (table_name, occurred_at desc);
create index if not exists audit_log_actor_idx on public.audit_log (actor_id, occurred_at desc);
alter table public.audit_log enable row level security;
drop policy if exists audit_admin_read on public.audit_log;
create policy audit_admin_read on public.audit_log for select using (public.is_admin());
-- no insert/update/delete policies -> append-only via the trigger below only

create or replace function public.audit_trigger()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_actor uuid; v_email text; v_rowid text;
begin
  begin v_actor := auth.uid(); exception when others then v_actor := null; end;
  begin v_email := (auth.jwt() ->> 'email'); exception when others then v_email := null; end;
  v_rowid := case when tg_op='DELETE' then (to_jsonb(old)->>'id') else (to_jsonb(new)->>'id') end;
  insert into public.audit_log(actor_id, actor_email, action, table_name, row_id, old_data, new_data)
  values (v_actor, v_email, tg_op, tg_table_name, v_rowid,
          case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) else null end,
          case when tg_op in ('UPDATE','INSERT') then to_jsonb(new) else null end);
  return case when tg_op='DELETE' then old else new end;
end $$;

do $$
declare t text;
begin
  foreach t in array array['work_orders','invoices','invoice_line_items','customers','inventory','profiles','vehicles','work_order_parts','customer_documents','status_updates','repair_photos']
  loop
    execute format('drop trigger if exists audit_%1$s on public.%1$s;', t);
    execute format('create trigger audit_%1$s after insert or update or delete on public.%1$s for each row execute function public.audit_trigger();', t);
  end loop;
end $$;

-- ─────────────────────────────────────────────────────────────────────────
-- 6. Storage hardening: private buckets + RLS
-- ─────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public) values ('invoice-files','invoice-files', false)
  on conflict (id) do update set public = excluded.public;
update storage.buckets set public = false where id in ('customer-files','repair-photos');

drop policy if exists "admin_all_objects" on storage.objects;
create policy "admin_all_objects" on storage.objects for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists "auth_read_customer_buckets" on storage.objects;
create policy "auth_read_customer_buckets" on storage.objects for select to authenticated
  using (bucket_id in ('customer-files','repair-photos'));

-- ─────────────────────────────────────────────────────────────────────────
-- 7. Server-set timestamps + atomic inventory decrement
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at := now(); return new; end $$;
drop trigger if exists set_updated_at on public.work_orders;
create trigger set_updated_at before update on public.work_orders for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at on public.inventory;
create trigger set_updated_at before update on public.inventory for each row execute function public.set_updated_at();

create or replace function public.decrement_inventory(p_inventory_id uuid, p_qty integer)
returns integer language plpgsql security definer set search_path = public as $$
declare v_remaining integer;
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  if p_qty is null or p_qty <= 0 then raise exception 'quantity must be positive'; end if;
  update public.inventory set quantity = quantity - p_qty
    where id = p_inventory_id and quantity >= p_qty returning quantity into v_remaining;
  if not found then raise exception 'insufficient inventory'; end if;
  return v_remaining;
end $$;
revoke all on function public.decrement_inventory(uuid, integer) from public;
grant execute on function public.decrement_inventory(uuid, integer) to authenticated, service_role;

-- ─────────────────────────────────────────────────────────────────────────
-- 8. Superadmin tier (Phase 2): role flag, function, role-change protection.
--    NOTE: seed the first superadmin BEFORE the protect trigger exists.
-- ─────────────────────────────────────────────────────────────────────────
alter table public.profiles add column if not exists is_superadmin boolean not null default false;

create or replace function public.is_superadmin()
returns boolean language sql security definer stable set search_path = public as
$$ select coalesce((select is_superadmin from public.profiles where id = auth.uid()), false) $$;
grant execute on function public.is_superadmin() to anon, authenticated, service_role;

-- is_admin() includes superadmins
create or replace function public.is_admin()
returns boolean language sql security definer stable set search_path = public as
$$ select coalesce((select is_admin or is_superadmin from public.profiles where id = auth.uid()), false) $$;

-- seed (run once, before the trigger below): info@stephenscode.dev is superadmin
-- update public.profiles set is_superadmin=true, is_admin=true where lower(email)='info@stephenscode.dev';

create or replace function public.protect_role_columns()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (new.is_admin is distinct from old.is_admin) or (new.is_superadmin is distinct from old.is_superadmin) then
    if not public.is_superadmin() then raise exception 'only a superadmin may change role flags'; end if;
  end if;
  return new;
end $$;
drop trigger if exists protect_role_columns on public.profiles;
create trigger protect_role_columns before update on public.profiles for each row execute function public.protect_role_columns();

-- ─────────────────────────────────────────────────────────────────────────
-- 9. Phase 4 — quoting, insurance, approval, scheduling
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.shop_settings (
  id int primary key default 1,
  default_labor_rate numeric(10,2) not null default 55.00,
  tax_rate numeric(5,4) not null default 0.0825,
  manual_estimating_enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint shop_settings_singleton check (id = 1)
);
insert into public.shop_settings (id) values (1) on conflict (id) do nothing;
alter table public.shop_settings enable row level security;
drop policy if exists shop_settings_read on public.shop_settings;
create policy shop_settings_read on public.shop_settings for select to authenticated using (true);
drop policy if exists shop_settings_admin on public.shop_settings;
create policy shop_settings_admin on public.shop_settings for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.work_order_labor (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.work_orders(id) on delete cascade,
  category text not null default 'Body',
  hours numeric(10,2) not null default 0,
  rate numeric(10,2) not null default 0,
  amount numeric(12,2) generated always as (round(hours * rate, 2)) stored,
  created_at timestamptz not null default now()
);
create index if not exists work_order_labor_wo_idx on public.work_order_labor(work_order_id);
alter table public.work_order_labor enable row level security;
drop policy if exists admin_access_all on public.work_order_labor;
create policy admin_access_all on public.work_order_labor for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists client_select_own on public.work_order_labor;
create policy client_select_own on public.work_order_labor for select
  using (work_order_id in (select id from public.work_orders where customer_id in (select public.my_customer_ids())));

alter table public.work_orders
  add column if not exists paint_materials_total numeric(12,2) not null default 0,
  add column if not exists sublet_total numeric(12,2) not null default 0,
  add column if not exists tax_rate numeric(5,4) not null default 0.0825,
  add column if not exists estimate_total numeric(12,2),
  add column if not exists is_insurance boolean not null default false,
  add column if not exists insurance_company text,
  add column if not exists claim_number text,
  add column if not exists policy_number text,
  add column if not exists adjuster_name text,
  add column if not exists adjuster_phone text,
  add column if not exists deductible numeric(12,2),
  add column if not exists estimate_approved_at timestamptz,
  add column if not exists approved_by uuid,
  add column if not exists dropoff_date date,
  add column if not exists pickup_date date;

drop trigger if exists audit_work_order_labor on public.work_order_labor;
create trigger audit_work_order_labor after insert or update or delete on public.work_order_labor for each row execute function public.audit_trigger();
drop trigger if exists audit_shop_settings on public.shop_settings;
create trigger audit_shop_settings after insert or update or delete on public.shop_settings for each row execute function public.audit_trigger();

create or replace function public.approve_estimate(p_work_order_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.work_orders set estimate_approved_at = now(), approved_by = auth.uid()
    where id = p_work_order_id and customer_id in (select public.my_customer_ids()) and estimate_approved_at is null;
  if not found then raise exception 'not authorized, not found, or already approved'; end if;
end $$;
revoke all on function public.approve_estimate(uuid) from public;
grant execute on function public.approve_estimate(uuid) to authenticated;
