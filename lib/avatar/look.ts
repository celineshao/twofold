export type AvatarPose = "idle" | "walk" | "sit";
export type AvatarFacing = "left" | "right";

export type SkinId = "porcelain" | "peach" | "warm" | "olive" | "deep";
export type HairId = "short" | "wavy" | "bun" | "pony" | "curly";
export type HairColorId = "black" | "brown" | "auburn" | "blonde" | "pink";
export type ShirtId = "cream" | "rose" | "sage" | "sky" | "lilac";
export type PantsId = "ink" | "sage" | "denim" | "cocoa" | "cream";
export type AccessoryId = "none" | "glasses" | "bow" | "flower" | "earring";

export type AvatarLook = {
  skin: SkinId;
  hair: HairId;
  hairColor: HairColorId;
  shirt: ShirtId;
  pants: PantsId;
  accessory: AccessoryId;
};

export const SKIN_TONES: { id: SkinId; label: string; color: string }[] = [
  { id: "porcelain", label: "Porcelain", color: "#f3d4c4" },
  { id: "peach", label: "Peach", color: "#e4b08c" },
  { id: "warm", label: "Warm", color: "#c48a5a" },
  { id: "olive", label: "Olive", color: "#b08b58" },
  { id: "deep", label: "Deep", color: "#7a4b32" },
];

export const HAIRSTYLES: { id: HairId; label: string }[] = [
  { id: "short", label: "Short" },
  { id: "wavy", label: "Wavy" },
  { id: "bun", label: "Bun" },
  { id: "pony", label: "Pony" },
  { id: "curly", label: "Curly" },
];

export const HAIR_COLORS: { id: HairColorId; label: string; color: string }[] = [
  { id: "black", label: "Black", color: "#2b2420" },
  { id: "brown", label: "Brown", color: "#6b4423" },
  { id: "auburn", label: "Auburn", color: "#a85a32" },
  { id: "blonde", label: "Blonde", color: "#e0c56a" },
  { id: "pink", label: "Pink", color: "#e8919a" },
];

export const SHIRTS: { id: ShirtId; label: string; color: string }[] = [
  { id: "cream", label: "Cream", color: "#f4e6d6" },
  { id: "rose", label: "Rose", color: "#e8919a" },
  { id: "sage", label: "Sage", color: "#7ea07a" },
  { id: "sky", label: "Sky", color: "#8fbfd4" },
  { id: "lilac", label: "Lilac", color: "#c9b3d6" },
];

export const PANTS: { id: PantsId; label: string; color: string }[] = [
  { id: "ink", label: "Ink", color: "#4a3b3e" },
  { id: "sage", label: "Sage", color: "#6d8f68" },
  { id: "denim", label: "Denim", color: "#6d86a8" },
  { id: "cocoa", label: "Cocoa", color: "#8a5a3c" },
  { id: "cream", label: "Cream", color: "#ead9c4" },
];

export const ACCESSORIES: { id: AccessoryId; label: string }[] = [
  { id: "none", label: "None" },
  { id: "glasses", label: "Glasses" },
  { id: "bow", label: "Bow" },
  { id: "flower", label: "Flower" },
  { id: "earring", label: "Earring" },
];

export const DEFAULT_LOOK: AvatarLook = {
  skin: "peach",
  hair: "wavy",
  hairColor: "brown",
  shirt: "rose",
  pants: "ink",
  accessory: "none",
};

function pick<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export function parseAvatarLook(raw: unknown): AvatarLook | null {
  let value = raw;
  if (typeof raw === "string") {
    try {
      value = JSON.parse(raw) as unknown;
    } catch {
      return null;
    }
  }
  if (!value || typeof value !== "object") {
    return null;
  }
  const row = value as Record<string, unknown>;
  return {
    skin: pick(row.skin, SKIN_TONES.map((item) => item.id), DEFAULT_LOOK.skin),
    hair: pick(row.hair, HAIRSTYLES.map((item) => item.id), DEFAULT_LOOK.hair),
    hairColor: pick(
      row.hairColor,
      HAIR_COLORS.map((item) => item.id),
      DEFAULT_LOOK.hairColor,
    ),
    shirt: pick(row.shirt, SHIRTS.map((item) => item.id), DEFAULT_LOOK.shirt),
    pants: pick(row.pants, PANTS.map((item) => item.id), DEFAULT_LOOK.pants),
    accessory: pick(
      row.accessory,
      ACCESSORIES.map((item) => item.id),
      DEFAULT_LOOK.accessory,
    ),
  };
}

export function defaultLookFor(seed: string): AvatarLook {
  const n = seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return {
    skin: SKIN_TONES[n % SKIN_TONES.length].id,
    hair: HAIRSTYLES[n % HAIRSTYLES.length].id,
    hairColor: HAIR_COLORS[(n * 3) % HAIR_COLORS.length].id,
    shirt: SHIRTS[(n * 5) % SHIRTS.length].id,
    pants: PANTS[(n * 7) % PANTS.length].id,
    accessory: "none",
  };
}

export function lookFromProfile(avatar: string | null | undefined, seed: string) {
  return parseAvatarLook(avatar) ?? defaultLookFor(seed);
}

export function colorOf<T extends { id: string; color: string }>(
  list: T[],
  id: string,
) {
  return list.find((item) => item.id === id)?.color ?? "#c48a5a";
}
