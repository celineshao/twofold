import { FurnitureItem } from "@/components/apartment/FurnitureItem";
import { ROOM_COLS, ROOM_ROWS, type PlacedFurniture } from "@/lib/apartment/grid";

type ApartmentRoomProps = {
  items: PlacedFurniture[];
  cols?: number;
  rows?: number;
};

export function ApartmentRoom({
  items,
  cols = ROOM_COLS,
  rows = ROOM_ROWS,
}: ApartmentRoomProps) {
  const wallItems = items.filter(
    (item) => item.y === 0 && (item.category === "decor" || item.imageKey.includes("art")),
  );
  const floorItems = items.filter((item) => !wallItems.includes(item));

  return (
    <div className="overflow-hidden rounded-[2rem] bg-[#fff6ee] shadow-[0_18px_40px_rgba(90,70,50,0.12)] ring-1 ring-[#e4d2b8]">
      <div className="relative h-40 overflow-hidden sm:h-48">
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(180deg, #fff6ee 0%, #f7efe6 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0 46px, rgba(214,168,140,0.35) 46px 48px)",
          }}
        />

        <div className="absolute left-1/2 top-7 h-24 w-24 -translate-x-1/2 overflow-hidden rounded-full sm:h-28 sm:w-28">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(165deg, #9fd0e4 0%, #c5e4ef 48%, #dcecc8 100%)",
            }}
          />
          <div className="absolute -right-3 top-4 h-10 w-10 rounded-full bg-[#fff3c4]/80" />
        </div>

        <div className="absolute inset-x-0 bottom-0 h-4 bg-[#e6c8a8]" />

        <div className="absolute inset-x-[14%] bottom-5 top-5">
          {wallItems.map((item) => (
            <FurnitureItem
              key={item.id}
              name={item.name}
              imageKey={item.imageKey}
              category={item.category}
              x={item.x}
              y={0}
              width={item.width}
              height={1}
              rotation={item.rotation}
              cols={cols}
              rows={1}
              onWall
            />
          ))}
        </div>
      </div>

      <div className="relative min-h-[300px] sm:min-h-[380px]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "repeating-linear-gradient(90deg, #efd3ae 0 9%, #e6c79a 9% 18%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(150,110,70,0.28) 1px, transparent 1px), linear-gradient(to bottom, rgba(150,110,70,0.2) 1px, transparent 1px)",
            backgroundSize: `${100 / cols}% ${100 / rows}%`,
          }}
        />

        {floorItems.map((item) => (
          <FurnitureItem
            key={item.id}
            name={item.name}
            imageKey={item.imageKey}
            category={item.category}
            x={item.x}
            y={item.y}
            width={item.width}
            height={item.height}
            rotation={item.rotation}
            cols={cols}
            rows={rows}
          />
        ))}
      </div>
    </div>
  );
}
