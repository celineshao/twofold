-- Twofold initial schema: profiles, couples, apartment, furniture, games.
-- Apply in the Supabase SQL editor or via: supabase db push

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.furniture_category as enum (
  'bed',
  'seating',
  'decor',
  'plant',
  'floor'
);

create type public.game_type as enum (
  'this_or_that',
  'how_well'
);

create type public.game_session_status as enum (
  'lobby',
  'in_progress',
  'completed',
  'abandoned'
);

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Player',
  avatar text,
  created_at timestamptz not null default now()
);

create table public.couples (
  id uuid primary key default gen_random_uuid(),
  invite_code text not null,
  created_at timestamptz not null default now(),
  constraint couples_invite_code_key unique (invite_code),
  constraint couples_invite_code_format check (invite_code ~ '^[A-Z0-9]{6}$')
);

create table public.couple_members (
  couple_id uuid not null references public.couples (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (couple_id, user_id),
  constraint couple_members_user_unique unique (user_id)
);

create table public.apartments (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  hearts integer not null default 0,
  created_at timestamptz not null default now(),
  constraint apartments_couple_unique unique (couple_id),
  constraint apartments_hearts_nonnegative check (hearts >= 0)
);

create table public.furniture_catalog (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category public.furniture_category not null,
  image_key text not null,
  price integer not null,
  width integer not null default 1,
  height integer not null default 1,
  constraint furniture_catalog_price_nonnegative check (price >= 0),
  constraint furniture_catalog_size_positive check (width > 0 and height > 0),
  constraint furniture_catalog_image_key_unique unique (image_key)
);

create table public.apartment_items (
  id uuid primary key default gen_random_uuid(),
  apartment_id uuid not null references public.apartments (id) on delete cascade,
  furniture_id uuid not null references public.furniture_catalog (id) on delete restrict,
  x integer not null,
  y integer not null,
  rotation integer not null default 0,
  placed_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint apartment_items_rotation_check check (rotation in (0, 90, 180, 270)),
  constraint apartment_items_origin_check check (x >= 0 and y >= 0)
);

create table public.game_sessions (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  game_type public.game_type not null,
  status public.game_session_status not null default 'lobby',
  current_round integer not null default 0,
  player1_score integer not null default 0,
  player2_score integer not null default 0,
  created_at timestamptz not null default now(),
  constraint game_sessions_round_nonnegative check (current_round >= 0),
  constraint game_sessions_scores_nonnegative check (player1_score >= 0 and player2_score >= 0)
);

create table public.game_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.game_sessions (id) on delete cascade,
  round_number integer not null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  answer text not null,
  created_at timestamptz not null default now(),
  constraint game_answers_round_positive check (round_number > 0),
  constraint game_answers_unique_per_round unique (session_id, round_number, user_id)
);

-- ---------------------------------------------------------------------------
-- Indexes (FKs that are not already unique/PK)
-- ---------------------------------------------------------------------------

create index couple_members_user_id_idx on public.couple_members (user_id);
create index apartment_items_apartment_id_idx on public.apartment_items (apartment_id);
create index apartment_items_furniture_id_idx on public.apartment_items (furniture_id);
create index game_sessions_couple_id_idx on public.game_sessions (couple_id);
create index game_sessions_status_idx on public.game_sessions (couple_id, status);
create index game_answers_session_id_idx on public.game_answers (session_id);
create index game_answers_user_id_idx on public.game_answers (user_id);
create index furniture_catalog_category_idx on public.furniture_catalog (category);

-- ---------------------------------------------------------------------------
-- Helpers (SECURITY DEFINER so RLS does not recurse)
-- ---------------------------------------------------------------------------

create or replace function public.is_couple_member(_couple_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.couple_members
    where couple_id = _couple_id
      and user_id = auth.uid()
  );
$$;

create or replace function public.couple_id_for_apartment(_apartment_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select couple_id
  from public.apartments
  where id = _apartment_id;
$$;

create or replace function public.couple_id_for_session(_session_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select couple_id
  from public.game_sessions
  where id = _session_id;
$$;

create or replace function public.generate_invite_code()
returns text
language plpgsql
as $$
declare
  chars constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text;
  i int;
begin
  loop
    result := '';
    for i in 1..6 loop
      result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    end loop;
    exit when not exists (
      select 1 from public.couples where invite_code = result
    );
  end loop;
  return result;
end;
$$;

create or replace function public.enforce_couple_member_limit()
returns trigger
language plpgsql
as $$
begin
  if (
    select count(*) from public.couple_members where couple_id = new.couple_id
  ) >= 2 then
    raise exception 'A couple can only have two members';
  end if;
  return new;
end;
$$;

create trigger couple_members_limit
before insert on public.couple_members
for each row
execute function public.enforce_couple_member_limit();

-- New auth user -> profile row
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      split_part(new.email, '@', 1),
      'Player'
    ),
    new.raw_user_meta_data ->> 'avatar'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- Pairing: create couple + membership + empty apartment
create or replace function public.create_couple()
returns public.couples
language plpgsql
security definer
set search_path = public
as $$
declare
  new_couple public.couples;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if exists (select 1 from public.couple_members where user_id = auth.uid()) then
    raise exception 'Already paired';
  end if;

  insert into public.couples (invite_code)
  values (public.generate_invite_code())
  returning * into new_couple;

  insert into public.couple_members (couple_id, user_id)
  values (new_couple.id, auth.uid());

  insert into public.apartments (couple_id, hearts)
  values (new_couple.id, 0);

  return new_couple;
end;
$$;

create or replace function public.join_couple(_invite_code text)
returns public.couples
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.couples;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if exists (select 1 from public.couple_members where user_id = auth.uid()) then
    raise exception 'Already paired';
  end if;

  select * into target
  from public.couples
  where invite_code = upper(trim(_invite_code));

  if target.id is null then
    raise exception 'Invalid invite code';
  end if;

  insert into public.couple_members (couple_id, user_id)
  values (target.id, auth.uid());

  return target;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.couples enable row level security;
alter table public.couple_members enable row level security;
alter table public.apartments enable row level security;
alter table public.furniture_catalog enable row level security;
alter table public.apartment_items enable row level security;
alter table public.game_sessions enable row level security;
alter table public.game_answers enable row level security;

-- profiles
create policy "profiles_select_self_or_partner"
on public.profiles for select
to authenticated
using (
  id = auth.uid()
  or exists (
    select 1
    from public.couple_members mine
    join public.couple_members theirs
      on mine.couple_id = theirs.couple_id
    where mine.user_id = auth.uid()
      and theirs.user_id = profiles.id
  )
);

create policy "profiles_update_self"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- couples: members only (join/create go through RPCs)
create policy "couples_select_members"
on public.couples for select
to authenticated
using (public.is_couple_member(id));

create policy "couples_update_members"
on public.couples for update
to authenticated
using (public.is_couple_member(id))
with check (public.is_couple_member(id));

-- couple_members
create policy "couple_members_select_own_couple"
on public.couple_members for select
to authenticated
using (public.is_couple_member(couple_id));

-- apartments
create policy "apartments_select_members"
on public.apartments for select
to authenticated
using (public.is_couple_member(couple_id));

create policy "apartments_update_members"
on public.apartments for update
to authenticated
using (public.is_couple_member(couple_id))
with check (public.is_couple_member(couple_id));

-- catalog is readable by any signed-in user; writes stay in SQL/dashboard
create policy "furniture_catalog_select_authenticated"
on public.furniture_catalog for select
to authenticated
using (true);

-- apartment_items
create policy "apartment_items_select_members"
on public.apartment_items for select
to authenticated
using (public.is_couple_member(public.couple_id_for_apartment(apartment_id)));

create policy "apartment_items_insert_members"
on public.apartment_items for insert
to authenticated
with check (
  placed_by = auth.uid()
  and public.is_couple_member(public.couple_id_for_apartment(apartment_id))
);

create policy "apartment_items_update_members"
on public.apartment_items for update
to authenticated
using (public.is_couple_member(public.couple_id_for_apartment(apartment_id)))
with check (public.is_couple_member(public.couple_id_for_apartment(apartment_id)));

create policy "apartment_items_delete_members"
on public.apartment_items for delete
to authenticated
using (public.is_couple_member(public.couple_id_for_apartment(apartment_id)));

-- game_sessions
create policy "game_sessions_select_members"
on public.game_sessions for select
to authenticated
using (public.is_couple_member(couple_id));

create policy "game_sessions_insert_members"
on public.game_sessions for insert
to authenticated
with check (public.is_couple_member(couple_id));

create policy "game_sessions_update_members"
on public.game_sessions for update
to authenticated
using (public.is_couple_member(couple_id))
with check (public.is_couple_member(couple_id));

-- game_answers
create policy "game_answers_select_members"
on public.game_answers for select
to authenticated
using (public.is_couple_member(public.couple_id_for_session(session_id)));

create policy "game_answers_insert_own"
on public.game_answers for insert
to authenticated
with check (
  user_id = auth.uid()
  and public.is_couple_member(public.couple_id_for_session(session_id))
);

-- ---------------------------------------------------------------------------
-- Grants
-- ---------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;

grant select, update on public.profiles to authenticated;
grant select, update on public.couples to authenticated;
grant select on public.couple_members to authenticated;
grant select, update on public.apartments to authenticated;
grant select on public.furniture_catalog to authenticated;
grant select, insert, update, delete on public.apartment_items to authenticated;
grant select, insert, update on public.game_sessions to authenticated;
grant select, insert on public.game_answers to authenticated;

grant execute on function public.create_couple() to authenticated;
grant execute on function public.join_couple(text) to authenticated;
grant execute on function public.is_couple_member(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------

alter table public.apartments replica identity full;
alter table public.apartment_items replica identity full;
alter table public.game_sessions replica identity full;
alter table public.game_answers replica identity full;
alter table public.couple_members replica identity full;

alter publication supabase_realtime add table public.apartments;
alter publication supabase_realtime add table public.apartment_items;
alter publication supabase_realtime add table public.game_sessions;
alter publication supabase_realtime add table public.game_answers;
alter publication supabase_realtime add table public.couple_members;

-- ---------------------------------------------------------------------------
-- Seed furniture (10 items)
-- ---------------------------------------------------------------------------

insert into public.furniture_catalog
  (name, category, image_key, price, width, height)
values
  ('Quilted double bed', 'bed', 'bed-quilt', 55, 2, 3),
  ('Cloud sofa', 'seating', 'sofa-cloud', 40, 2, 1),
  ('Window seat', 'seating', 'seat-window', 28, 2, 1),
  ('Rose table lamp', 'decor', 'lamp-rose', 18, 1, 1),
  ('Heart wall art', 'decor', 'art-heart', 12, 1, 1),
  ('Potted fern', 'plant', 'plant-fern', 12, 1, 1),
  ('Olive tree', 'plant', 'plant-olive', 22, 1, 2),
  ('Peach rug', 'floor', 'rug-peach', 20, 2, 2),
  ('Sage floor tiles', 'floor', 'floor-sage', 16, 1, 1),
  ('Tea cart', 'decor', 'cart-tea', 24, 1, 1);
