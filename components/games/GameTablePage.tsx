"use client";

import { useState } from "react";
import { GameSessionRoom } from "@/components/games/GameSessionRoom";
import { QuizPlay } from "@/components/games/QuizPlay";
import { StartGameScreen } from "@/components/games/StartGameScreen";
import { createGameSession, joinGameSession } from "@/lib/games/client";
import { quizFor } from "@/lib/games/quizzes";
import { quizSessionPath } from "@/lib/games/quiz";
import type { GameType } from "@/types/database";

type GameTablePageProps = {
  gameType: GameType;
  userId: string;
  initialSessionId?: string | null;
};

export function GameTablePage({
  gameType,
  userId,
  initialSessionId = null,
}: GameTablePageProps) {
  const quiz = quizFor(gameType);
  const [sessionId, setSessionId] = useState(initialSessionId);

  async function openSession(id: string) {
    setSessionId(id);
    window.history.replaceState(null, "", quizSessionPath(quiz, id));
  }

  async function playAgain() {
    const created = await createGameSession(gameType);
    if (!created.ok) {
      return;
    }
    let session = created.session;
    if (!session.player_ids.includes(userId) && session.status === "waiting") {
      const joined = await joinGameSession(session.id);
      if (!joined.ok) {
        return;
      }
      session = joined.session;
    }
    await openSession(session.id);
  }

  if (!sessionId) {
    return (
      <StartGameScreen
        gameType={gameType}
        title={quiz.title}
        description={quiz.lobbyDescription}
        userId={userId}
        onStarted={(id) => {
          setSessionId(id);
          window.history.replaceState(null, "", quizSessionPath(quiz, id));
        }}
      />
    );
  }

  return (
    <GameSessionRoom sessionId={sessionId}>
      <QuizPlay
        quiz={quiz}
        sessionId={sessionId}
        onPlayAgain={() => void playAgain()}
      />
    </GameSessionRoom>
  );
}
