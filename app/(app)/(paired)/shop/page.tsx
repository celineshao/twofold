import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";

const previewItems = [
  { name: "Cloud sofa", cost: 40, category: "seating" },
  { name: "Rose lamp", cost: 18, category: "decor" },
  { name: "Potted fern", cost: 12, category: "plant" },
  { name: "Quilted bed", cost: 55, category: "bed" },
];

export default function ShopPage() {
  return (
    <div>
      <PageHeader
        kicker="Boutique"
        title="Furniture shop"
        description="Spend Hearts on pieces for the apartment. Purchases are not connected yet."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {previewItems.map((item) => (
          <Card key={item.name} className="flex flex-col gap-3">
            <div className="grid h-24 place-items-center rounded-2xl bg-lilac/50 text-sm font-semibold">
              {item.category}
            </div>
            <div className="flex-1">
              <h2 className="font-display text-lg font-semibold">{item.name}</h2>
              <p className="mt-1 text-sm text-rose-deep">♥ {item.cost}</p>
            </div>
            <Button disabled>Buy</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
