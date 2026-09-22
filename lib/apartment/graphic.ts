export function furnitureGraphic(imageKey: string, category: string) {
  const key = imageKey.toLowerCase();

  if (key.includes("bed")) {
    return { emoji: "🛏️", tone: "bg-[#f0d2b3]" };
  }
  if (key.includes("sofa") || key.includes("couch") || key.includes("seat")) {
    return { emoji: "🛋️", tone: "bg-[#b7d0a8]" };
  }
  if (key.includes("table") || key.includes("cart")) {
    return { emoji: "🪑", tone: "bg-[#e2b889]" };
  }
  if (key.includes("plant") || key.includes("fern") || key.includes("olive")) {
    return { emoji: "🌿", tone: "bg-[#9ecb88]" };
  }
  if (key.includes("lamp")) {
    return { emoji: "💡", tone: "bg-[#f6de9a]" };
  }
  if (key.includes("rug") || key.includes("floor")) {
    return { emoji: "🧺", tone: "bg-[#e8b7a4]" };
  }
  if (key.includes("tv") || key.includes("television")) {
    return { emoji: "📺", tone: "bg-[#9eb3c4]" };
  }
  if (key.includes("book") || key.includes("shelf")) {
    return { emoji: "📚", tone: "bg-[#d9a07a]" };
  }
  if (key.includes("art") || key.includes("heart")) {
    return { emoji: "🖼️", tone: "bg-[#e9b7c2]" };
  }

  if (category === "bed") return { emoji: "🛏️", tone: "bg-[#f0d2b3]" };
  if (category === "seating") return { emoji: "🛋️", tone: "bg-[#b7d0a8]" };
  if (category === "plant") return { emoji: "🌿", tone: "bg-[#9ecb88]" };
  if (category === "floor") return { emoji: "🧺", tone: "bg-[#e8b7a4]" };

  return { emoji: "🪴", tone: "bg-[#cbb6d8]" };
}
