"use client";

import { GameLobby } from "@/components/games/GameLobby";
import { useGameSession } from "@/lib/games/useGameSession";
import { gameTitle } from "@/lib/games/session";
import type { GameSessionPayload } from "@/lib/games/session";

type GameSessionRoomProps = {
  sessionId: string;
  partnerName?: string | null;
  initialSession?: GameSessionPayload | null;
  children: React.ReactNode;
};

export function GameSessionRoom({
  sessionId,
  partnerName,
  initialSession = null,
  children,
}: GameSessionRoomProps) {
  const { session, loading, error } = useGameSession(sessionId);
  const current = session ?? initialSession;

  if (loading && !current) {
    return (
      <p className="text-center text-sm font-semibold text-muted">
        Opening the table…
      </p>
    );
  }

  if (error || !current) {
    return (
      <p className="text-center text-sm font-semibold text-rose-deep">
        {error ?? "We could not find this game."}
      </p>
    );
  }

  if (current.status === "waiting") {
    return <GameLobby partnerName={partnerName} />;
  }

  if (current.status === "finished" || current.status === "abandoned") {
    return (
      <div className="mx-auto max-w-md text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">
          {gameTitle(current.game_type)} ended
        </h1>
        <p className="mt-2 text-sm text-muted">This table is closed.</p>
      </div>
    );
  }

  return <>{children}</>;
}
