import { createClient } from "@/lib/supabase/server";
import type { FurnitureCatalogItem } from "@/types/database";

export async function getFurnitureCatalog(): Promise<FurnitureCatalogItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("furniture_catalog")
    .select("id, name, category, image_key, price, width, height")
    .order("price", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data as FurnitureCatalogItem[];
}
