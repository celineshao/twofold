-- How Well Do You Know Me: reuse session answers, secret until both submitted.

create table if not exists public.how_well_prompts (
  round_number integer primary key,
  question text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  constraint how_well_prompts_round_range check (round_number between 1 and 10)
);

insert into public.how_well_prompts
  (round_number, question, option_a, option_b, option_c, option_d)
values
  (1, 'What is your ideal vacation?', 'Tropical beach', 'Big city', 'Mountains', 'Countryside'),
  (2, 'How do you want to spend a free weekend?', 'Stay in', 'Road trip', 'A party', 'A museum day'),
  (3, 'What is your comfort food?', 'Pasta', 'Tacos', 'Soup', 'Ice cream'),
  (4, 'What is your love language?', 'Words', 'Quality time', 'Gifts', 'Touch'),
  (5, 'What is your morning drink?', 'Coffee', 'Tea', 'Smoothie', 'Just water'),
  (6, 'What is your movie-night pick?', 'Rom-com', 'Thriller', 'Animation', 'Documentary'),
  (7, 'Which pet energy are you?', 'Dog', 'Cat', 'Both', 'Neither'),
  (8, 'How do you text them most?', 'Long notes', 'Voice notes', 'Memes', 'Short replies'),
  (9, 'Which superpower would you take?', 'Flight', 'Invisibility', 'Time travel', 'Teleport'),
  (10, 'What is your perfect date night?', 'Cooking together', 'Stargazing', 'A concert', 'Board games')
on conflict (round_number) do nothing;

alter table public.how_well_prompts enable row level security;

drop policy if exists "how_well_prompts_select_authenticated" on public.how_well_prompts;

create policy "how_well_prompts_select_authenticated"
on public.how_well_prompts for select
to authenticated
using (true);

grant select on public.how_well_prompts to authenticated;

create or replace function public.how_well_answerer_id(
  _session_id uuid,
  _round integer
)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  with players as (
    select
      user_id,
      (row_number() over (order by joined_at, user_id) - 1) as idx
    from public.game_session_players
    where session_id = _session_id
  ),
  seed as (
    select mod(get_byte(decode(md5(_session_id::text), 'hex'), 0), 2) as start_idx
  )
  select p.user_id
  from players p
  cross join seed s
  where p.idx = mod(s.start_idx + greatest(_round, 1) - 1, 2)
  limit 1;
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

create or replace function public.how_well_state(p_session_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_session public.game_sessions;
  v_prompt public.how_well_prompts;
  v_round integer;
  v_answerer uuid;
  v_guesser uuid;
  v_answerer_name text;
  v_guesser_name text;
  v_my_answer text;
  v_answerer_answer text;
  v_guesser_answer text;
  v_answerer_answered boolean := false;
  v_guesser_answered boolean := false;
  v_revealed boolean := false;
  v_correct boolean;
  v_hearts integer;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select *
  into v_session
  from public.game_sessions
  where id = p_session_id;

  if v_session.id is null then
    raise exception 'Session not found';
  end if;

  if not public.is_couple_member(v_session.couple_id) then
    raise exception 'Not paired';
  end if;

  v_round := greatest(v_session.current_round, 1);
  v_answerer := public.how_well_answerer_id(v_session.id, v_round);

  select user_id
  into v_guesser
  from public.game_session_players
  where session_id = v_session.id
    and user_id is distinct from v_answerer
  limit 1;

  select display_name into v_answerer_name from public.profiles where id = v_answerer;
  select display_name into v_guesser_name from public.profiles where id = v_guesser;

  select answer
  into v_my_answer
  from public.game_answers
  where session_id = v_session.id
    and round_number = v_round
    and user_id = auth.uid();

  v_answerer_answered := exists (
    select 1
    from public.game_answers
    where session_id = v_session.id
      and round_number = v_round
      and user_id = v_answerer
  );

  v_guesser_answered := exists (
    select 1
    from public.game_answers
    where session_id = v_session.id
      and round_number = v_round
      and user_id = v_guesser
  );

  v_revealed := v_answerer_answered and v_guesser_answered;

  if v_revealed then
    select answer
    into v_answerer_answer
    from public.game_answers
    where session_id = v_session.id
      and round_number = v_round
      and user_id = v_answerer;

    select answer
    into v_guesser_answer
    from public.game_answers
    where session_id = v_session.id
      and round_number = v_round
      and user_id = v_guesser;

    v_correct := v_answerer_answer = v_guesser_answer;
    v_hearts := case when v_correct then 30 else 10 end;
  end if;

  select *
  into v_prompt
  from public.how_well_prompts
  where round_number = v_round;

  return jsonb_build_object(
    'session_id', v_session.id,
    'status', v_session.status,
    'current_round', v_round,
    'total_rounds', 10,
    'question', v_prompt.question,
    'options', jsonb_build_array(
      v_prompt.option_a,
      v_prompt.option_b,
      v_prompt.option_c,
      v_prompt.option_d
    ),
    'i_am_answerer', auth.uid() = v_answerer,
    'answerer_name', coalesce(v_answerer_name, 'your person'),
    'guesser_name', coalesce(v_guesser_name, 'your person'),
    'my_answer', v_my_answer,
    'answerer_answered', v_answerer_answered,
    'guesser_answered', v_guesser_answered,
    'revealed', v_revealed,
    'answerer_answer', case when v_revealed then v_answerer_answer else null end,
    'guesser_answer', case when v_revealed then v_guesser_answer else null end,
    'is_correct', v_correct,
    'hearts_this_round', v_hearts,
    'matches', v_session.matches,
    'hearts_earned', v_session.hearts_earned
  );
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

  return public.how_well_state(p_session_id);
end;
$$;

create or replace function public.next_this_or_that_round(p_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.next_game_round(p_session_id);
end;
$$;

create or replace function public.next_how_well_round(p_session_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return public.next_game_round(p_session_id);
end;
$$;

grant execute on function public.how_well_answerer_id(uuid, integer) to authenticated;
grant execute on function public.how_well_state(uuid) to authenticated;
grant execute on function public.submit_how_well_answer(uuid, text) to authenticated;
grant execute on function public.next_game_round(uuid) to authenticated;
grant execute on function public.next_how_well_round(uuid) to authenticated;
grant execute on function public.next_this_or_that_round(uuid) to authenticated;
