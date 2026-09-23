-- Leave a table: mark the session abandoned so both players can start something new.

create or replace function public.quit_game_session(p_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.game_sessions;
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

  if not exists (
    select 1
    from public.game_session_players
    where session_id = v_session.id
      and user_id = auth.uid()
  ) then
    raise exception 'Not in this game';
  end if;

  if v_session.status in ('waiting', 'playing') then
    update public.game_sessions
    set status = 'abandoned'
    where id = v_session.id;
  end if;

  return public.game_session_payload(p_session_id);
end;
$$;

grant execute on function public.quit_game_session(uuid) to authenticated;
