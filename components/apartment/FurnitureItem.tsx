import { cn } from "@/lib/cn";

type FurnitureItemProps = {
  name: string;
  imageKey: string;
  category: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  cols: number;
  rows: number;
  onWall?: boolean;
};

function graphic(imageKey: string, category: string) {
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

export function FurnitureItem({
  name,
  imageKey,
  category,
  x,
  y,
  width,
  height,
  rotation,
  cols,
  rows,
  onWall = false,
}: FurnitureItemProps) {
  const { emoji, tone } = graphic(imageKey, category);
  const isRug = category === "floor";
  const zIndex = isRug ? y + 1 : 40 + y * 10 + x;

  return (
    <div
      title={name}
      className={cn(
        "absolute flex items-end justify-center",
        isRug ? "rounded-[1.2rem] opacity-90" : "rounded-2xl",
      )}
      style={{
        left: `${(x / cols) * 100}%`,
        top: `${(y / rows) * 100}%`,
        width: `${(width / cols) * 100}%`,
        height: `${(height / rows) * 100}%`,
        zIndex,
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
      }}
    >
      <div
        className={cn(
          "flex h-[90%] w-[90%] flex-col items-center justify-center ring-1 ring-[#fff6e8]/70 shadow-[0_6px_0_rgba(160,110,70,0.12)]",
          tone,
          isRug ? "rounded-[1.4rem]" : "rounded-[1.4rem]",
          onWall ? "h-full w-full rounded-2xl shadow-none" : "",
        )}
      >
        <span className="text-lg leading-none sm:text-2xl" aria-hidden>
          {emoji}
        </span>
      </div>
    </div>
  );
}
