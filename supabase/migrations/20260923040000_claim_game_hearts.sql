-- Pay Hearts into the apartment once when a game finishes.

alter table public.game_sessions
  add column if not exists hearts_claimed boolean not null default false;

-- Sessions that already credited the apartment per round must not pay again.
update public.game_sessions
set hearts_claimed = true
where hearts_earned > 0
   or status in ('finished', 'abandoned');

create or replace function public.claim_game_hearts(p_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.game_sessions;
  v_apartment_hearts integer;
  v_reward integer;
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

  if v_session.status <> 'finished' then
    raise exception 'Game is not finished';
  end if;

  v_reward := v_session.hearts_earned;

  select hearts
  into v_apartment_hearts
  from public.apartments
  where couple_id = v_session.couple_id
  for update;

  if v_apartment_hearts is null then
    raise exception 'Apartment not found';
  end if;

  if not v_session.hearts_claimed then
    update public.apartments
    set hearts = hearts + v_reward
    where couple_id = v_session.couple_id
    returning hearts into v_apartment_hearts;

    update public.game_sessions
    set hearts_claimed = true
    where id = v_session.id
      and hearts_claimed = false;
  end if;

  return jsonb_build_object(
    'session_id', v_session.id,
    'hearts_earned', v_reward,
    'apartment_hearts', v_apartment_hearts,
    'claimed', true
  );
end;
$$;

create or replace function public.next_game_round(p_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_session public.game_sessions;
  v_count integer;
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

  if v_session.status <> 'playing' then
    if v_session.game_type = 'how_well' then
      return public.how_well_state(p_session_id);
    end if;
    return public.this_or_that_state(p_session_id);
  end if;

  select count(*)
  into v_count
  from public.game_answers
  where session_id = v_session.id
    and round_number = v_session.current_round;

  if v_count < 2 then
    if v_session.game_type = 'how_well' then
      return public.how_well_state(p_session_id);
    end if;
    return public.this_or_that_state(p_session_id);
  end if;

  if v_session.current_round >= 10 then
    update public.game_sessions
    set status = 'finished'
    where id = v_session.id;

    perform public.claim_game_hearts(p_session_id);
  else
    update public.game_sessions
    set
      current_round = current_round + 1,
      answers_in_round = 0
    where id = v_session.id;
  end if;

  if v_session.game_type = 'how_well' then
    return public.how_well_state(p_session_id);
  end if;

  return public.this_or_that_state(p_session_id);
end;
$$;

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
  else
    update public.game_sessions
    set answers_in_round = v_count
    where id = v_session.id
      and answers_in_round is distinct from v_count;
  end if;

  return public.this_or_that_state(p_session_id);
end;
$$;

create or replace function public.submit_how_well_answer(
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
  v_prompt public.how_well_prompts;
  v_answer text;
  v_round integer;
  v_answerer uuid;
  v_guesser uuid;
  v_count integer;
  v_real text;
  v_guess text;
  v_correct boolean;
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

  if v_session.game_type <> 'how_well' then
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

  v_round := v_session.current_round;
  v_answerer := public.how_well_answerer_id(v_session.id, v_round);

  select user_id
  into v_guesser
  from public.game_session_players
  where session_id = v_session.id
    and user_id is distinct from v_answerer
  limit 1;

  if auth.uid() is distinct from v_answerer
     and not exists (
       select 1
       from public.game_answers
       where session_id = v_session.id
         and round_number = v_round
         and user_id = v_answerer
     )
  then
    raise exception 'Waiting for the answerer';
  end if;

  select *
  into v_prompt
  from public.how_well_prompts
  where round_number = v_round;

  if v_prompt.round_number is null then
    raise exception 'Round not found';
  end if;

  if v_answer not in (
    v_prompt.option_a,
    v_prompt.option_b,
    v_prompt.option_c,
    v_prompt.option_d
  ) then
    raise exception 'Invalid answer';
  end if;

  insert into public.game_answers (session_id, round_number, user_id, answer)
  values (v_session.id, v_round, auth.uid(), v_answer)
  on conflict (session_id, round_number, user_id) do nothing;

  select count(*)
  into v_count
  from public.game_answers
  where session_id = v_session.id
    and round_number = v_round;

  if v_count = 2 then
    select answer
    into v_real
    from public.game_answers
    where session_id = v_session.id
      and round_number = v_round
      and user_id = v_answerer;

    select answer
    into v_guess
    from public.game_answers
    where session_id = v_session.id
      and round_number = v_round
      and user_id = v_guesser;

    v_correct := v_real = v_guess;
    v_hearts := case when v_correct then 30 else 10 end;

    update public.game_sessions
    set
      answers_in_round = 2,
      matches = matches + case when v_correct then 1 else 0 end,
      hearts_earned = hearts_earned + v_hearts
    where id = v_session.id
      and answers_in_round < 2;
  else
    update public.game_sessions
    set answers_in_round = v_count
    where id = v_session.id
      and answers_in_round is distinct from v_count;
  end if;

  return public.how_well_state(p_session_id);
end;
$$;

grant execute on function public.claim_game_hearts(uuid) to authenticated;
grant execute on function public.next_game_round(uuid) to authenticated;
grant execute on function public.submit_this_or_that_answer(uuid, text) to authenticated;
grant execute on function public.submit_how_well_answer(uuid, text) to authenticated;
