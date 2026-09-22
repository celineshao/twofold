-- Atomic furniture purchase: lock apartment hearts, debit, then place an item.
-- Concurrent buys wait on FOR UPDATE so the balance cannot go negative.

create or replace function public.purchase_furniture(p_furniture_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_couple_id uuid;
  v_apartment public.apartments;
  v_piece public.furniture_catalog;
  v_hearts integer;
  v_item_id uuid;
  v_x integer := 0;
  v_y integer := 0;
  v_w integer;
  v_h integer;
  v_ow integer;
  v_oh integer;
  occ record;
  spot_ok boolean;
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

  select *
  into v_piece
  from public.furniture_catalog
  where id = p_furniture_id;

  if v_piece.id is null then
    raise exception 'Item not found';
  end if;

  v_w := v_piece.width;
  v_h := v_piece.height;

  select *
  into v_apartment
  from public.apartments
  where couple_id = v_couple_id
  for update;

  if v_apartment.id is null then
    raise exception 'Apartment not found';
  end if;

  update public.apartments
  set hearts = hearts - v_piece.price
  where id = v_apartment.id
    and hearts >= v_piece.price
  returning hearts into v_hearts;

  if v_hearts is null then
    raise exception 'Not enough Hearts';
  end if;

  <<find_spot>>
  for yy in 0..(8 - v_h) loop
    for xx in 0..(10 - v_w) loop
      spot_ok := true;

      for occ in
        select
          i.x,
          i.y,
          i.rotation,
          c.width as w,
          c.height as h
        from public.apartment_items i
        join public.furniture_catalog c on c.id = i.furniture_id
        where i.apartment_id = v_apartment.id
      loop
        if occ.rotation in (90, 270) then
          v_ow := occ.h;
          v_oh := occ.w;
        else
          v_ow := occ.w;
          v_oh := occ.h;
        end if;

        if not (
          xx + v_w <= occ.x
          or occ.x + v_ow <= xx
          or yy + v_h <= occ.y
          or occ.y + v_oh <= yy
        ) then
          spot_ok := false;
          exit;
        end if;
      end loop;

      if spot_ok then
        v_x := xx;
        v_y := yy;
        exit find_spot;
      end if;
    end loop;
  end loop;

  insert into public.apartment_items (
    apartment_id,
    furniture_id,
    x,
    y,
    rotation,
    placed_by
  )
  values (
    v_apartment.id,
    v_piece.id,
    v_x,
    v_y,
    0,
    auth.uid()
  )
  returning id into v_item_id;

  return jsonb_build_object(
    'item_id', v_item_id,
    'hearts', v_hearts
  );
end;
$$;

grant execute on function public.purchase_furniture(uuid) to authenticated;
