import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

export default function ThisOrThatPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader
        kicker="This or That"
        title="Waiting to start"
        description="Both of you will see the same prompt. Answering and reveal are placeholders."
      />
      <Card className="space-y-4 text-center">
        <p className="text-sm font-semibold text-rose-deep">Round 1 of 5</p>
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
        <p className="text-sm text-muted">Partner has not joined yet.</p>
      </Card>
    </div>
  );
}
