-- Multiplayer lobby: waiting / playing / finished, plus who has joined.

alter type public.game_session_status rename value 'lobby' to 'waiting';
alter type public.game_session_status rename value 'in_progress' to 'playing';
alter type public.game_session_status rename value 'completed' to 'finished';

alter table public.game_sessions
  alter column status set default 'waiting';

create table public.game_session_players (
  session_id uuid not null references public.game_sessions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (session_id, user_id)
);

create index game_session_players_user_id_idx
  on public.game_session_players (user_id);

create unique index game_sessions_one_open_per_couple
  on public.game_sessions (couple_id)
  where status in ('waiting', 'playing');

alter table public.game_session_players enable row level security;

create policy "game_session_players_select_members"
on public.game_session_players for select
to authenticated
using (public.is_couple_member(public.couple_id_for_session(session_id)));

grant select on public.game_session_players to authenticated;

alter table public.game_session_players replica identity full;
alter publication supabase_realtime add table public.game_session_players;

create or replace function public.game_session_payload(_session_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', s.id,
    'couple_id', s.couple_id,
    'game_type', s.game_type,
    'status', s.status,
    'current_round', s.current_round,
    'player_ids', coalesce(
      (
        select jsonb_agg(p.user_id order by p.joined_at)
        from public.game_session_players p
        where p.session_id = s.id
      ),
      '[]'::jsonb
    )
  )
  from public.game_sessions s
  where s.id = _session_id
    and public.is_couple_member(s.couple_id);
$$;

create or replace function public.create_game_session(p_game_type public.game_type)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_couple_id uuid;
  v_session public.game_sessions;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select couple_id
  into v_couple_id
  from public.couple_members
  where user_id = auth.uid();

  if v_couple_id is null then
    raise exception 'Not paired';
  end if;

  perform 1
  from public.couples
  where id = v_couple_id
  for update;

  select *
  into v_session
  from public.game_sessions
  where couple_id = v_couple_id
    and status in ('waiting', 'playing')
  order by created_at desc
  limit 1
  for update;

  if v_session.id is not null then
    return public.game_session_payload(v_session.id);
  end if;

  insert into public.game_sessions (couple_id, game_type, status)
  values (v_couple_id, p_game_type, 'waiting')
  returning * into v_session;

  insert into public.game_session_players (session_id, user_id)
  values (v_session.id, auth.uid());

  return public.game_session_payload(v_session.id);
end;
$$;

create or replace function public.join_game_session(p_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.game_sessions;
  v_player_count integer;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select *
  into v_session
  from public.game_sessions
  where id = p_session_id
  for update;

  if v_session.id is null then
    raise exception 'Session not found';
  end if;

  if not public.is_couple_member(v_session.couple_id) then
    raise exception 'Not paired';
  end if;

  if exists (
    select 1
    from public.game_session_players
    where session_id = v_session.id
      and user_id = auth.uid()
  ) then
    return public.game_session_payload(v_session.id);
  end if;

  if v_session.status = 'finished' or v_session.status = 'abandoned' then
    raise exception 'Session finished';
  end if;

  if v_session.status = 'playing' then
    raise exception 'Game already started';
  end if;

  insert into public.game_session_players (session_id, user_id)
  values (v_session.id, auth.uid());

  select count(*)
  into v_player_count
  from public.game_session_players
  where session_id = v_session.id;

  if v_player_count >= 2 then
    update public.game_sessions
    set status = 'playing'
    where id = v_session.id;
  end if;

  return public.game_session_payload(v_session.id);
end;
$$;

grant execute on function public.game_session_payload(uuid) to authenticated;
grant execute on function public.create_game_session(public.game_type) to authenticated;
grant execute on function public.join_game_session(uuid) to authenticated;
