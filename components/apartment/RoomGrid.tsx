const COLS = 10;
const ROWS = 8;

export function RoomGrid() {
  return (
    <div className="overflow-x-auto rounded-[2rem] border-4 border-peach bg-sage/40 p-3 shadow-inner">
      <div
        className="grid min-w-[520px] gap-1 rounded-[1.5rem] bg-cream/80 p-2"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: COLS * ROWS }).map((_, index) => (
          <div
            key={index}
            className="aspect-square rounded-lg bg-white/70 ring-1 ring-blush/40"
          />
        ))}
      </div>
    </div>
  );
}
