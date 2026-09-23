-- Fix This or That sessions that started on round 0 (no matching prompt).

update public.game_sessions
set current_round = 1
where game_type = 'this_or_that'
  and status = 'playing'
  and current_round < 1;

create or replace function public.submit_this_or_that_answer(
  p_session_id uuid,
  p_answer text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.game_sessions;
  v_prompt public.this_or_that_prompts;
  v_answer text;
  v_count integer;
  v_other text;
  v_match boolean;
  v_hearts integer;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  v_answer := btrim(p_answer);

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

  if v_session.game_type <> 'this_or_that' then
    raise exception 'Wrong game';
  end if;

  if v_session.status <> 'playing' then
    raise exception 'Game is not playing';
  end if;

  if v_session.current_round < 1 then
    update public.game_sessions
    set current_round = 1
    where id = v_session.id;
    v_session.current_round := 1;
  end if;

  select *
  into v_prompt
  from public.this_or_that_prompts
  where round_number = v_session.current_round;

  if v_prompt.round_number is null then
    raise exception 'Round not found';
  end if;

  if v_answer <> v_prompt.option_a and v_answer <> v_prompt.option_b then
    raise exception 'Invalid answer';
  end if;

  insert into public.game_answers (session_id, round_number, user_id, answer)
  values (v_session.id, v_session.current_round, auth.uid(), v_answer)
  on conflict (session_id, round_number, user_id) do nothing;

  select count(*)
  into v_count
  from public.game_answers
  where session_id = v_session.id
    and round_number = v_session.current_round;

  if v_count = 2 then
    select answer
    into v_other
    from public.game_answers
    where session_id = v_session.id
      and round_number = v_session.current_round
      and user_id <> auth.uid();

    v_match := (
      select answer
      from public.game_answers
      where session_id = v_session.id
        and round_number = v_session.current_round
        and user_id = auth.uid()
    ) = v_other;
    v_hearts := case when v_match then 20 else 10 end;

    update public.game_sessions
    set
      answers_in_round = 2,
      matches = matches + case when v_match then 1 else 0 end,
      hearts_earned = hearts_earned + v_hearts
    where id = v_session.id
      and answers_in_round < 2;

    if found then
      update public.apartments
      set hearts = hearts + v_hearts
      where couple_id = v_session.couple_id;
    end if;
  else
    update public.game_sessions
    set answers_in_round = v_count
    where id = v_session.id
      and answers_in_round is distinct from v_count;
  end if;

  return public.this_or_that_state(p_session_id);
end;
$$;
