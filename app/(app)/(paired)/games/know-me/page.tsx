import { GameTablePage } from "@/components/games/GameTablePage";
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
      userId={user.id}
      initialSessionId={session ?? null}
    />
  );
}
