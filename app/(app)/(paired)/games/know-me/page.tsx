import { GameTablePage } from "@/components/games/GameTablePage";
import { KnowMePlay } from "@/components/games/KnowMePlay";
import { requireUser } from "@/lib/auth/session";

export default async function KnowMePage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const user = await requireUser();
  const { session } = await searchParams;

  return (
    <GameTablePage
      gameType="how_well"
      title="How Well Do You Know Me?"
      description="One answers, one guesses. We will wait for your person, then start together."
      userId={user.id}
      initialSessionId={session ?? null}
      play={<KnowMePlay />}
    />
  );
}
