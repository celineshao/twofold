"use client";

import { useState } from "react";
import { createGameSession, joinGameSession } from "@/lib/games/client";
import type { GameType } from "@/types/database";

type StartGameScreenProps = {
  gameType: GameType;
  title: string;
  description: string;
  userId: string;
  onStarted: (sessionId: string) => void;
};

export function StartGameScreen({
  gameType,
  title,
  description,
  userId,
  onStarted,
}: StartGameScreenProps) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function start() {
    if (busy) {
      return;
    }
    setBusy(true);
    setError(null);

    try {
      const created = await createGameSession(gameType);
      if (!created.ok) {
        setError(created.error);
        return;
      }

      let session = created.session;
      if (!session.player_ids.includes(userId) && session.status === "waiting") {
        const joined = await joinGameSession(session.id);
        if (!joined.ok) {
          setError(joined.error);
          return;
        }
        session = joined.session;
      }

      onStarted(session.id);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not open the game. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-4 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage-deep">
        {title}
      </p>
      <h1 className="font-display text-3xl font-semibold text-ink">{title}</h1>
      <p className="text-sm leading-relaxed text-muted">{description}</p>
      <button
        type="button"
        onClick={() => void start()}
        disabled={busy}
        className="rounded-full bg-sage-deep px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {busy ? "Opening the table…" : "Start game"}
      </button>
      {error ? (
        <p className="rounded-2xl bg-blush/70 px-4 py-3 text-sm font-semibold text-rose-deep">
          {error}
        </p>
      ) : null}
    </div>
  );
}
