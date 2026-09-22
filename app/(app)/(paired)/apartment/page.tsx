import { FurnitureSprite } from "@/components/apartment/FurnitureSprite";
import { RoomGrid } from "@/components/apartment/RoomGrid";
import { PageHeader } from "@/components/ui/PageHeader";

export default function ApartmentPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Nest"
        title="Your shared apartment"
        description="A 10×8 tile grid. Placement and live updates come next — this is the empty room."
      />
      <div className="flex flex-wrap gap-2">
        <FurnitureSprite label="Bed" />
        <FurnitureSprite label="Plant" />
        <FurnitureSprite label="Lamp" />
      </div>
      <RoomGrid />
    </div>
  );
}
