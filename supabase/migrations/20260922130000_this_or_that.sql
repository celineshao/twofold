-- This or That: secret answers, reveal only when both have submitted, Hearts on reveal.

alter table public.game_sessions
  add column if not exists answers_in_round integer not null default 0;

alter table public.game_sessions
  add column if not exists matches integer not null default 0;

alter table public.game_sessions
  add column if not exists hearts_earned integer not null default 0;

alter table public.game_sessions
  drop constraint if exists game_sessions_answers_in_round_nonnegative;

alter table public.game_sessions
  add constraint game_sessions_answers_in_round_nonnegative
  check (answers_in_round >= 0);

alter table public.game_sessions
  drop constraint if exists game_sessions_matches_nonnegative;

alter table public.game_sessions
  add constraint game_sessions_matches_nonnegative
  check (matches >= 0);

alter table public.game_sessions
  drop constraint if exists game_sessions_hearts_earned_nonnegative;

alter table public.game_sessions
  add constraint game_sessions_hearts_earned_nonnegative
  check (hearts_earned >= 0);

create table if not exists public.this_or_that_prompts (
  round_number integer primary key,
  option_a text not null,
  option_b text not null,
  constraint this_or_that_prompts_round_range check (round_number between 1 and 10)
);

insert into public.this_or_that_prompts (round_number, option_a, option_b)
values
  (1, 'Beach', 'Mountains'),
  (2, 'Movies', 'Games'),
  (3, 'Morning', 'Night'),
  (4, 'Sweet', 'Salty'),
  (5, 'City', 'Countryside'),
  (6, 'Fancy Dinner', 'Cozy Night In'),
  (7, 'Coffee', 'Tea'),
  (8, 'Stay In', 'Go Out'),
  (9, 'Books', 'Podcasts'),
  (10, 'Sunrise', 'Sunset')
on conflict (round_number) do nothing;

grant select on public.this_or_that_prompts to authenticated;

alter table public.this_or_that_prompts enable row level security;

drop policy if exists "this_or_that_prompts_select_authenticated" on public.this_or_that_prompts;

create policy "this_or_that_prompts_select_authenticated"
on public.this_or_that_prompts for select
to authenticated
using (true);

drop policy if exists "game_answers_select_members" on public.game_answers;

drop policy if exists "game_answers_select_own_or_revealed" on public.game_answers;

create policy "game_answers_select_own_or_revealed"
on public.game_answers for select
to authenticated
using (
  public.is_couple_member(public.couple_id_for_session(session_id))
  and (
    user_id = auth.uid()
    or (
      select count(*)
      from public.game_answers revealed
      where revealed.session_id = game_answers.session_id
        and revealed.round_number = game_answers.round_number
    ) >= 2
  )
);

drop policy if exists "game_answers_insert_own" on public.game_answers;

revoke insert on public.game_answers from authenticated;

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
    set
      status = 'playing',
      current_round = 1,
      answers_in_round = 0
    where id = v_session.id;
  end if;

  return public.game_session_payload(v_session.id);
end;
$$;

create or replace function public.this_or_that_state(p_session_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_session public.game_sessions;
  v_prompt public.this_or_that_prompts;
  v_my_answer text;
  v_partner_id uuid;
  v_partner_answer text;
  v_partner_name text;
  v_partner_answered boolean := false;
  v_revealed boolean := false;
  v_is_match boolean;
  v_hearts_round integer;
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

  select user_id
  into v_partner_id
  from public.game_session_players
  where session_id = v_session.id
    and user_id <> auth.uid()
  limit 1;

  if v_partner_id is not null then
    select display_name
    into v_partner_name
    from public.profiles
    where id = v_partner_id;
  end if;

  select answer
  into v_my_answer
  from public.game_answers
  where session_id = v_session.id
    and round_number = v_session.current_round
    and user_id = auth.uid();

  if v_partner_id is not null then
    v_partner_answered := exists (
      select 1
      from public.game_answers
      where session_id = v_session.id
        and round_number = v_session.current_round
        and user_id = v_partner_id
    );
  end if;

  v_revealed := v_my_answer is not null and v_partner_answered;

  if v_revealed then
    select answer
    into v_partner_answer
    from public.game_answers
    where session_id = v_session.id
      and round_number = v_session.current_round
      and user_id = v_partner_id;

    v_is_match := v_my_answer = v_partner_answer;
    v_hearts_round := case when v_is_match then 20 else 10 end;
  end if;

  select *
  into v_prompt
  from public.this_or_that_prompts
  where round_number = greatest(v_session.current_round, 1);

  return jsonb_build_object(
    'session_id', v_session.id,
    'status', v_session.status,
    'current_round', v_session.current_round,
    'total_rounds', 10,
    'option_a', v_prompt.option_a,
    'option_b', v_prompt.option_b,
    'prompt', v_prompt.option_a || ' or ' || v_prompt.option_b || '?',
    'my_answer', v_my_answer,
    'partner_answered', v_partner_answered,
    'revealed', v_revealed,
    'partner_answer', case when v_revealed then v_partner_answer else null end,
    'partner_name', coalesce(v_partner_name, 'your person'),
    'is_match', v_is_match,
    'hearts_this_round', v_hearts_round,
    'matches', v_session.matches,
    'hearts_earned', v_session.hearts_earned
  );
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

create or replace function public.next_this_or_that_round(p_session_id uuid)
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
    return public.this_or_that_state(p_session_id);
  end if;

  select count(*)
  into v_count
  from public.game_answers
  where session_id = v_session.id
    and round_number = v_session.current_round;

  if v_count < 2 then
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

  return public.this_or_that_state(p_session_id);
end;
$$;

grant execute on function public.this_or_that_state(uuid) to authenticated;
grant execute on function public.submit_this_or_that_answer(uuid, text) to authenticated;
grant execute on function public.next_this_or_that_round(uuid) to authenticated;
grant execute on function public.join_game_session(uuid) to authenticated;
