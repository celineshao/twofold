import { GamePreview } from "@/components/games/GamePreview";
import { PageHeader } from "@/components/ui/PageHeader";

export default function GamesPage() {
  return (
    <div>
      <PageHeader
        kicker="Lobby"
        title="Play together"
        description="Pick a game. Multiplayer sessions and scoring are not wired up yet."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <GamePreview
          title="This or That"
          description="Same prompt, two options. Match with your person and earn Hearts."
          href="/games/this-or-that"
        />
        <GamePreview
          title="How Well Do You Know Me?"
          description="One of you answers as yourself. The other guesses. Reveal together."
          href="/games/know-me"
        />
      </div>
    </div>
  );
}
