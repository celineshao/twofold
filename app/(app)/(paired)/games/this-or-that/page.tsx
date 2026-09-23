import { GameTablePage } from "@/components/games/GameTablePage";
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
      userId={user.id}
      initialSessionId={session ?? null}
    />
  );
}
