import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function KnowMePlay() {
  return (
    <Card className="mx-auto max-w-xl space-y-4 text-center">
      <p className="text-sm font-semibold text-rose-deep">You are both here</p>
      <h2 className="font-display text-2xl font-semibold">
        Ideal weekend: stay in or go out?
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="ghost" disabled>
          Stay in
        </Button>
        <Button variant="ghost" disabled>
          Go out
        </Button>
      </div>
      <p className="text-sm text-muted">Roles and scoring come next.</p>
    </Card>
  );
}
