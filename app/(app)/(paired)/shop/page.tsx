import { ShopView } from "@/components/shop/ShopView";
import { requireUser } from "@/lib/auth/session";
import { getCoupleMembership } from "@/lib/couple/membership";
import { getFurnitureCatalog } from "@/lib/shop/catalog";

export default async function ShopPage() {
  const user = await requireUser();
  const [membership, items] = await Promise.all([
    getCoupleMembership(user.id),
    getFurnitureCatalog(),
  ]);

  return (
    <ShopView items={items} initialHearts={membership?.hearts ?? 0} />
  );
}
