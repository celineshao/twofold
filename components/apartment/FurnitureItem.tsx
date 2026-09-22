import type { PointerEvent } from "react";
import { furnitureGraphic } from "@/lib/apartment/graphic";
import { rotatedFootprint } from "@/lib/apartment/placement";
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
  selected?: boolean;
  editing?: boolean;
  onPointerDown?: (event: PointerEvent<HTMLDivElement>) => void;
};

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
  selected = false,
  editing = false,
  onPointerDown,
}: FurnitureItemProps) {
  const { emoji, tone } = furnitureGraphic(imageKey, category);
  const { w, h } = rotatedFootprint(width, height, rotation);
  const isRug = category === "floor";
  const zIndex = isRug ? y + 1 : 40 + y * 10 + x;

  return (
    <div
      title={name}
      role={editing ? "button" : undefined}
      tabIndex={editing ? 0 : undefined}
      onPointerDown={onPointerDown}
      className={cn(
        "absolute flex items-end justify-center touch-none",
        editing ? "cursor-grab" : "",
        selected ? "z-[80]" : "",
      )}
      style={{
        left: `${(x / cols) * 100}%`,
        top: `${(y / rows) * 100}%`,
        width: `${(w / cols) * 100}%`,
        height: `${(h / rows) * 100}%`,
        zIndex: selected ? 80 : zIndex,
      }}
    >
      <div
        className={cn(
          "flex h-[90%] w-[90%] flex-col items-center justify-center shadow-[0_6px_0_rgba(160,110,70,0.12)] ring-1 ring-[#fff6e8]/70",
          tone,
          "rounded-[1.4rem]",
          selected ? "ring-2 ring-sage-deep" : "",
        )}
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <span className="text-lg leading-none sm:text-2xl" aria-hidden>
          {emoji}
        </span>
      </div>
    </div>
  );
}
