export function ApartmentPreview() {
  const tiles = Array.from({ length: 40 }, (_, index) => index);
  const furniture: Record<number, string> = {
    2: "bg-peach/80",
    12: "bg-sage-deep/50",
    13: "bg-sage-deep/50",
    21: "bg-[#c9b07a]",
    22: "bg-[#c9b07a]",
    23: "bg-[#d8c49a]",
    28: "bg-lilac/80",
    33: "bg-sage-deep/40",
    34: "bg-sage-deep/40",
  };

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border-[3px] border-[#e2c9b0] bg-[#f3e6d4] p-3 shadow-inner">
      <div className="absolute inset-x-6 top-2 h-8 rounded-full bg-[#f7efe4]/80" />
      <div
        className="relative grid gap-[3px] rounded-[1.25rem] bg-[#efe0cc] p-2"
        style={{ gridTemplateColumns: "repeat(8, minmax(0, 1fr))" }}
      >
        {tiles.map((index) => (
          <div
            key={index}
            className={`aspect-square rounded-md ring-1 ring-[#e8d5c0] ${furniture[index] ?? "bg-[#fbf6ee]"}`}
          />
        ))}
      </div>
    </div>
  );
}
