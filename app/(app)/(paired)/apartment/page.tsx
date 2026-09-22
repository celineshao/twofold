import Link from "next/link";
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
            A little dollhouse for two. You can look around for now; moving
            furniture comes next.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-[#f7efe4] px-4 py-2 text-sm font-semibold text-ink ring-1 ring-[#ead9c8]">
            ♡ {hearts} Hearts
          </div>
          <Link
            href="/shop"
            className="rounded-full bg-sage-deep px-4 py-2 text-sm font-semibold text-white"
          >
            Furniture shop
          </Link>
        </div>
      </header>

      <ApartmentRoom items={items} />

      {items.length === 0 ? (
        <p className="text-center text-sm text-muted">
          The room is still empty. When you buy and place pieces, they will
          appear here for both of you.
        </p>
      ) : (
        <p className="text-center text-sm text-muted">
          {items.length} {items.length === 1 ? "piece" : "pieces"} in the nest.
          Lower objects sit in front.
        </p>
      )}
    </div>
  );
}
