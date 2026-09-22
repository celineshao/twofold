import { createClient } from "@/lib/supabase/server";
import { APARTMENT_ITEM_SELECT, mapApartmentItems } from "@/lib/apartment/map-items";

export async function getApartmentRoom(coupleId: string) {
  const supabase = await createClient();

  const { data: apartment, error: apartmentError } = await supabase
    .from("apartments")
    .select("id, hearts")
    .eq("couple_id", coupleId)
    .maybeSingle();

  if (apartmentError || !apartment) {
    return null;
  }

  const { data: rows } = await supabase
    .from("apartment_items")
    .select(APARTMENT_ITEM_SELECT)
    .eq("apartment_id", apartment.id);

  return {
    apartmentId: apartment.id,
    hearts: apartment.hearts,
    items: mapApartmentItems(rows),
  };
}
