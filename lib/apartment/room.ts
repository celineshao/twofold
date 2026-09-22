import { createClient } from "@/lib/supabase/server";
import { type PlacedFurniture } from "@/lib/apartment/grid";

type CatalogEmbed = {
  name: string;
  category: string;
  image_key: string;
  width: number;
  height: number;
};

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
    .select(
      "id, x, y, rotation, furniture_catalog(name, category, image_key, width, height)",
    )
    .eq("apartment_id", apartment.id);

  const items: PlacedFurniture[] = (rows ?? []).flatMap((row) => {
    const catalog = row.furniture_catalog as CatalogEmbed | CatalogEmbed[] | null;
    const piece = Array.isArray(catalog) ? catalog[0] : catalog;
    if (!piece) {
      return [];
    }

    return [
      {
        id: row.id,
        name: piece.name,
        category: piece.category,
        imageKey: piece.image_key,
        x: row.x,
        y: row.y,
        width: piece.width,
        height: piece.height,
        rotation: row.rotation,
      },
    ];
  });

  return {
    apartmentId: apartment.id,
    hearts: apartment.hearts,
    items,
  };
}
