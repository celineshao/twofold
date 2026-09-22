type FurnitureSpriteProps = {
  label: string;
  className?: string;
};

export function FurnitureSprite({ label, className }: FurnitureSpriteProps) {
  return (
    <div
      className={`grid place-items-center rounded-2xl bg-lilac/80 text-center text-xs font-semibold text-ink ${className ?? "h-16 w-16"}`}
    >
      {label}
    </div>
  );
}
