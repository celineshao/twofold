import Link from "next/link";
import { ApartmentPreview } from "@/components/home/ApartmentPreview";
import { GameInvite } from "@/components/home/GameInvite";
import { TonightCard } from "@/components/home/TonightCard";
import { requireUser } from "@/lib/auth/session";
import { getCoupleMembership } from "@/lib/couple/membership";
import { getOpenGameInvite } from "@/lib/games/queries";

export default async function HomePage() {
  const user = await requireUser();
  const membership = await getCoupleMembership(user.id);
  const partnerName = membership?.partnerName ?? "your person";
  const hearts = membership?.hearts ?? 0;
  const invite = membership
    ? await getOpenGameInvite(membership.coupleId, user.id)
    : null;

  return (
    <div className="space-y-10">
      <header className="home-fade">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sage-deep">
          Shared nest
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight text-ink sm:text-5xl">
          Welcome home, {user.displayName}{" "}
          <span className="home-float inline-block text-rose-deep">♡</span>
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
          The kettle is on. {partnerName} is on the other side of the door.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <div className="home-fade grid grid-cols-2 gap-3">
          <article className="rounded-[1.75rem] border border-[#ead9c8] bg-card/95 p-5 shadow-[0_10px_28px_rgba(74,59,62,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              Together with
            </p>
            <p className="mt-3 font-display text-2xl font-semibold text-ink">
              {partnerName}
            </p>
            <p className="mt-2 text-sm text-muted">Online in spirit, even far away.</p>
          </article>
          <article className="rounded-[1.75rem] border border-[#ead9c8] bg-[#f7efe4] p-5 shadow-[0_10px_28px_rgba(74,59,62,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              Shared Hearts
            </p>
            <p className="mt-3 font-display text-4xl font-semibold text-ink">
              {hearts}
            </p>
            <p className="mt-2 text-sm text-muted">Earned when you play. Spent on the room.</p>
          </article>
        </div>

        <div className="home-fade flex flex-col gap-3 sm:flex-row md:flex-col">
          <Link
            href="/games"
            className="inline-flex flex-1 items-center justify-center rounded-full bg-sage-deep px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6d9269]"
          >
            Play Together
          </Link>
          <Link
            href="/apartment"
            className="inline-flex flex-1 items-center justify-center rounded-full bg-[#f4e6d6] px-5 py-3 text-sm font-semibold text-ink ring-1 ring-[#e2c9b0] transition hover:bg-[#efe0cc]"
          >
            Visit Apartment
          </Link>
          <Link
            href="/shop"
            className="inline-flex flex-1 items-center justify-center rounded-full bg-card px-5 py-3 text-sm font-semibold text-ink ring-1 ring-[#ead9c8] transition hover:bg-[#f7efe4]"
          >
            Furniture Shop
          </Link>
        </div>
      </section>

      {membership ? (
        <GameInvite
          coupleId={membership.coupleId}
          userId={user.id}
          initialInvite={invite}
        />
      ) : null}

      <section className="home-fade">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-display text-xl font-semibold">Your apartment</h2>
          <Link
            href="/apartment"
            className="text-sm font-semibold text-sage-deep hover:underline"
          >
            Peek inside
          </Link>
        </div>
        <ApartmentPreview />
      </section>

      <section>
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sage-deep">
            Evening quests
          </p>
          <h2 className="mt-1 font-display text-2xl font-semibold">Tonight Together</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TonightCard
            title="This or That"
            description="Same prompt, two choices. Match and you both earn extra Hearts."
            accent="bg-sage/60 text-sage-deep"
            href="/games/this-or-that"
          />
          <TonightCard
            title="How Well Do You Know Me?"
            description="One of you answers as yourself. The other guesses. Reveal together."
            accent="bg-peach/50 text-[#9a6a48]"
            href="/games/know-me"
          />
          <TonightCard
            title="Draw Together"
            description="A shared sketchpad for doodles, maps, and little love notes."
            accent="bg-lilac/50 text-[#6f5b80]"
            comingSoon
          />
        </div>
      </section>
    </div>
  );
}
