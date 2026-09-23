import { GamePreview } from "@/components/games/GamePreview";
import { PageHeader } from "@/components/ui/PageHeader";
import { QUIZ_GAMES } from "@/lib/games/quizzes";

export default function GamesPage() {
  return (
    <div>
      <PageHeader
        kicker="Lobby"
        title="Play together"
        description="Pick a game. Your person gets an invite, then you both start together."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {QUIZ_GAMES.map((quiz) => (
          <GamePreview
            key={quiz.gameType}
            title={quiz.title}
            description={quiz.cardDescription}
            href={quiz.href}
          />
        ))}
      </div>
    </div>
  );
}
