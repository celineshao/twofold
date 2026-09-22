import Link from "next/link";
import { ApartmentCanvas } from "@/components/apartment/ApartmentCanvas";
import { ApartmentRoom } from "@/components/apartment/ApartmentRoom";
import { requireUser } from "@/lib/auth/session";
import { getApartmentRoom } from "@/lib/apartment/room";
import { getCoupleMembership } from "@/lib/couple/membership";

export default async function ApartmentPage() {
  const user = await requireUser();
  const membership = await getCoupleMembership(user.id);

  if (!membership) {
    return null;
  }

  const room = await getApartmentRoom(membership.coupleId);
  const hearts = room?.hearts ?? membership.hearts;
  const items = room?.items ?? [];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage-deep">
            Shared nest
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
            Your apartment
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted">
            Look around, or tap Edit to slide pieces on the grid. Your person
            sees it live.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-[#f7efe4] px-4 py-2 text-sm font-semibold text-ink ring-1 ring-[#ead9c8]">
            ♡ {hearts} Hearts
          </div>
          <Link
            href="/shop"
            className="rounded-full bg-card px-4 py-2 text-sm font-semibold text-ink ring-1 ring-[#ead9c8]"
          >
            Furniture shop
          </Link>
        </div>
      </header>

      {room ? (
        <ApartmentCanvas apartmentId={room.apartmentId} initialItems={items} />
      ) : (
        <ApartmentRoom items={items} />
      )}
    </div>
  );
}
