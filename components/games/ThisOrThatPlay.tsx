import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function ThisOrThatPlay() {
  return (
    <Card className="mx-auto max-w-xl space-y-4 text-center">
      <p className="text-sm font-semibold text-rose-deep">You are both here</p>
      <h2 className="font-display text-2xl font-semibold">
        Coffee or tea in the morning?
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="ghost" disabled>
          Coffee
        </Button>
        <Button variant="ghost" disabled>
          Tea
        </Button>
      </div>
      <p className="text-sm text-muted">Rounds and scoring come next.</p>
    </Card>
  );
}
