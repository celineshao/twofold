import { type PlacedFurniture } from "@/lib/apartment/grid";

export type CatalogEmbed = {
  name: string;
  category: string;
  image_key: string;
  width: number;
  height: number;
};

export type ApartmentItemRow = {
  id: string;
  x: number;
  y: number;
  rotation: number;
  furniture_catalog: CatalogEmbed | CatalogEmbed[] | null;
};

export function mapApartmentItems(rows: ApartmentItemRow[] | null): PlacedFurniture[] {
  return (rows ?? []).flatMap((row) => {
    const catalog = row.furniture_catalog;
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
}

export const APARTMENT_ITEM_SELECT =
  "id, x, y, rotation, furniture_catalog(name, category, image_key, width, height)";
