-- Invite codes like LOVE-7K2F, plus safer create/join RPCs.

alter table public.couples
  drop constraint if exists couples_invite_code_format;

update public.couples
set invite_code = 'LOVE-' || right(invite_code, 4)
where invite_code !~ '^LOVE-';

alter table public.couples
  add constraint couples_invite_code_format
  check (invite_code ~ '^LOVE-[A-Z0-9]{4}$');

create or replace function public.normalize_invite_code(_invite_code text)
returns text
language plpgsql
immutable
as $$
declare
  normalized text;
begin
  normalized := upper(regexp_replace(coalesce(_invite_code, ''), '\s+', '', 'g'));

  if normalized = '' then
    return '';
  end if;

  if normalized !~ '^LOVE-' then
    normalized := 'LOVE-' || normalized;
  end if;

  return normalized;
end;
$$;

create or replace function public.generate_invite_code()
returns text
language plpgsql
as $$
declare
  chars constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  suffix text;
  result text;
  i int;
begin
  loop
    suffix := '';
    for i in 1..4 loop
      suffix := suffix || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    end loop;
    result := 'LOVE-' || suffix;
    exit when not exists (
      select 1 from public.couples where invite_code = result
    );
  end loop;
  return result;
end;
$$;

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

drop function if exists public.join_couple(text);

create or replace function public.join_couple(p_invite_code text)
returns public.couples
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.couples;
  member_count integer;
  normalized text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  normalized := public.normalize_invite_code(p_invite_code);

  if normalized is null or normalized !~ '^LOVE-[A-Z0-9]{4}$' then
    raise exception 'Invalid invite code';
  end if;

  select *
  into target
  from public.couples
  where invite_code = normalized
  for update;

  if target.id is null then
    raise exception 'Invalid invite code';
  end if;

  if exists (
    select 1
    from public.couple_members
    where couple_id = target.id
      and user_id = auth.uid()
  ) then
    raise exception 'Already in this couple';
  end if;

  if exists (
    select 1
    from public.couple_members
    where user_id = auth.uid()
  ) then
    raise exception 'Already paired';
  end if;

  select count(*)
  into member_count
  from public.couple_members
  where couple_id = target.id;

  if member_count >= 2 then
    raise exception 'This couple is already full';
  end if;

  insert into public.couple_members (couple_id, user_id)
  values (target.id, auth.uid());

  return target;
end;
$$;

grant execute on function public.normalize_invite_code(text) to authenticated;
grant execute on function public.create_couple() to authenticated;
grant execute on function public.join_couple(text) to authenticated;
