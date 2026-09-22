import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="mx-auto max-w-2xl text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-rose-deep">
          For two, wherever you are
        </p>
        <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
          A shared apartment, games, and a little pile of hearts.
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-muted">
          Pair with your person, play together in real time, and decorate the
          room you both come home to.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button href="/signup">Create an account</Button>
          <Button href="/login" variant="ghost">
            I already have one
          </Button>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm font-semibold text-rose-deep">1. Pair</p>
          <p className="mt-2 text-sm text-muted">
            Share an invite code and lock in as a couple.
          </p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-rose-deep">2. Play</p>
          <p className="mt-2 text-sm text-muted">
            This or That and How Well Do You Know Me, in sync.
          </p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-rose-deep">3. Nest</p>
          <p className="mt-2 text-sm text-muted">
            Spend Hearts on furniture for your 10×8 grid.
          </p>
        </Card>
      </div>
    </div>
  );
}
