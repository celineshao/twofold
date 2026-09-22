import { redirect } from "next/navigation";
import { CopyInviteCode } from "@/components/pair/CopyInviteCode";
import { CreateCoupleForm } from "@/components/pair/CreateCoupleForm";
import { JoinCoupleForm } from "@/components/pair/JoinCoupleForm";
import { WaitingForPartner } from "@/components/pair/WaitingForPartner";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireUser } from "@/lib/auth/session";
import { getCoupleMembership } from "@/lib/couple/membership";

export default async function PairPage() {
  const user = await requireUser();
  const membership = await getCoupleMembership(user.id);

  if (membership && membership.memberCount >= 2) {
    redirect("/home");
  }

  if (membership) {
    return (
      <div className="mx-auto max-w-md">
        <PageHeader
          kicker="Almost home"
          title="Send this to your person"
          description="They sign up, open Pair, and type this code. You can wait right here."
        />
        <Card className="space-y-4 text-center">
          <p className="rounded-2xl bg-blush/40 px-4 py-6 font-display text-3xl tracking-[0.18em] text-rose-deep">
            {membership.inviteCode}
          </p>
          <CopyInviteCode code={membership.inviteCode} />
          <WaitingForPartner coupleId={membership.coupleId} />
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        kicker="Just the two of you"
        title="Pair as a couple"
        description="Create a nest and share the code, or join with one your partner already made."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="font-display text-xl font-semibold">Create a couple</h2>
          <p className="text-sm text-muted">
            We will make a short LOVE- code for you to send.
          </p>
          <CreateCoupleForm />
        </Card>
        <Card className="space-y-4">
          <h2 className="font-display text-xl font-semibold">Join a couple</h2>
          <p className="text-sm text-muted">
            Paste the code they shared. It looks like LOVE-7K2F.
          </p>
          <JoinCoupleForm />
        </Card>
      </div>
    </div>
  );
}
