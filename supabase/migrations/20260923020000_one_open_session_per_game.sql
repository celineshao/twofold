-- Allow one open table per game, and never reuse This or That when starting How Well.

drop index if exists public.game_sessions_one_open_per_couple;

create unique index if not exists game_sessions_one_open_per_couple_game
  on public.game_sessions (couple_id, game_type)
  where status in ('waiting', 'playing');

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
    and game_type = p_game_type
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
