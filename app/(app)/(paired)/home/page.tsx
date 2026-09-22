import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireUser } from "@/lib/auth/session";
import { getCoupleMembership } from "@/lib/couple/membership";

export default async function HomePage() {
  const user = await requireUser();
  const membership = await getCoupleMembership(user.id);

  return (
    <div>
      <PageHeader
        kicker="Home"
        title={`Welcome back, ${user.displayName}`}
        description="Your couple hub. Hearts, the apartment, and games live here."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-sm font-semibold text-rose-deep">Hearts</p>
          <p className="mt-2 font-display text-4xl font-semibold">0</p>
          <p className="mt-1 text-sm text-muted">Shared couple balance</p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-rose-deep">Partner</p>
          <p className="mt-2 font-display text-2xl font-semibold">
            {membership?.partnerName ?? "Your person"}
          </p>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-rose-deep">Apartment</p>
          <p className="mt-2 text-sm text-muted">Peek at the shared room.</p>
          <Button href="/apartment" className="mt-4">
            Go to apartment
          </Button>
        </Card>
        <Card>
          <p className="text-sm font-semibold text-rose-deep">Play</p>
          <p className="mt-2 text-sm text-muted">Start a lobby when you are both free.</p>
          <Button href="/games" variant="secondary" className="mt-4">
            Open games
          </Button>
        </Card>
      </div>
    </div>
  );
}
