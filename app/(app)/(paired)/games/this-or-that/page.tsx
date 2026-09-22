import { GameTablePage } from "@/components/games/GameTablePage";
import { ThisOrThatPlay } from "@/components/games/ThisOrThatPlay";
import { requireUser } from "@/lib/auth/session";

export default async function ThisOrThatPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const user = await requireUser();
  const { session } = await searchParams;

  return (
    <GameTablePage
      gameType="this_or_that"
      title="This or That"
      description="Same prompt, two options. We will wait for your person, then start together."
      userId={user.id}
      initialSessionId={session ?? null}
      play={<ThisOrThatPlay />}
    />
  );
}
