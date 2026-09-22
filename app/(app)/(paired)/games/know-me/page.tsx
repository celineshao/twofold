import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export default function KnowMePage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader
        kicker="How Well Do You Know Me?"
        title="Waiting to start"
        description="Roles will flip each round. This screen is a static preview of the prompt layout."
      />
      <Card className="space-y-4 text-center">
        <p className="text-sm font-semibold text-rose-deep">Guess their answer</p>
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
        <p className="text-sm text-muted">Scoring and realtime sync come later.</p>
      </Card>
    </div>
  );
}
