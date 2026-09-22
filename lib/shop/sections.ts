import type { FurnitureCatalogItem, FurnitureCategory } from "@/types/database";

export const SHOP_SECTIONS: {
  title: string;
  categories: FurnitureCategory[];
}[] = [
  { title: "Living Room", categories: ["seating", "floor"] },
  { title: "Bedroom", categories: ["bed"] },
  { title: "Plants", categories: ["plant"] },
  { title: "Decorations", categories: ["decor"] },
];

export function itemsForSection(
  items: FurnitureCatalogItem[],
  categories: FurnitureCategory[],
) {
  return items.filter((item) =>
    categories.includes(item.category as FurnitureCategory),
  );
}
