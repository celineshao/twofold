"use client";

import { useState } from "react";
import { GameSessionRoom } from "@/components/games/GameSessionRoom";
import { StartGameScreen } from "@/components/games/StartGameScreen";
import { gameSessionPath } from "@/lib/games/session";
import type { GameType } from "@/types/database";

type GameTablePageProps = {
  gameType: GameType;
  title: string;
  description: string;
  userId: string;
  initialSessionId?: string | null;
  play: React.ReactNode;
};

export function GameTablePage({
  gameType,
  title,
  description,
  userId,
  initialSessionId = null,
  play,
}: GameTablePageProps) {
  const [sessionId, setSessionId] = useState(initialSessionId);

  if (!sessionId) {
    return (
      <StartGameScreen
        gameType={gameType}
        title={title}
        description={description}
        userId={userId}
        onStarted={(id) => {
          setSessionId(id);
          window.history.replaceState(null, "", gameSessionPath(gameType, id));
        }}
      />
    );
  }

  return <GameSessionRoom sessionId={sessionId}>{play}</GameSessionRoom>;
}
