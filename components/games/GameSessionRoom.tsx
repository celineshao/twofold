"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GameLobby } from "@/components/games/GameLobby";
import { LeaveGameButton } from "@/components/games/LeaveGameButton";
import { useGameSession } from "@/lib/games/useGameSession";
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
  const router = useRouter();
  const { session, loading, error } = useGameSession(sessionId);
  const current = session ?? initialSession;

  useEffect(() => {
    if (current?.status === "abandoned") {
      router.replace("/games");
    }
  }, [current?.status, router]);

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

  if (current.status === "abandoned") {
    return (
      <p className="text-center text-sm font-semibold text-muted">
        This table closed. Heading back to games…
      </p>
    );
  }

  if (current.status === "waiting") {
    return (
      <div>
        <GameLobby partnerName={partnerName} />
        <LeaveGameButton sessionId={sessionId} />
      </div>
    );
  }

  return (
    <div>
      {children}
      {current.status === "playing" ? (
        <LeaveGameButton sessionId={sessionId} />
      ) : null}
    </div>
  );
}
