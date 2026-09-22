"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { joinGameSession } from "@/lib/games/client";
import { asGameSessionPayload, gameSessionPath, gameTitle, type GameSessionPayload } from "@/lib/games/session";
import { useCoupleRealtime } from "@/lib/games/useCoupleRealtime";
import { createClient } from "@/lib/supabase/client";

type GameInviteProps = {
  coupleId: string;
  userId: string;
  initialInvite: GameSessionPayload | null;
};

export function GameInvite({
  coupleId,
  userId,
  initialInvite,
}: GameInviteProps) {
  const router = useRouter();
  const [invite, setInvite] = useState(initialInvite);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const refreshInvite = useCallback(async () => {
    const supabase = createClient();
    const { data: row } = await supabase
      .from("game_sessions")
      .select("id")
      .eq("couple_id", coupleId)
      .eq("status", "waiting")
      .maybeSingle();

    if (!row) {
      setInvite(null);
      return;
    }

    const { data } = await supabase.rpc("game_session_payload", {
      _session_id: row.id,
    });
    const next = asGameSessionPayload(data);
    if (!next || next.player_ids.includes(userId)) {
      setInvite(null);
      return;
    }
    setInvite(next);
  }, [coupleId, userId]);

  useCoupleRealtime(coupleId, {
    table: "game_sessions",
    onEvent: () => {
      void refreshInvite();
    },
  });

  function join() {
    if (!invite) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await joinGameSession(invite.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(gameSessionPath(result.session.game_type, result.session.id));
    });
  }

  if (!invite) {
    return null;
  }

  return (
    <section className="home-fade rounded-[1.75rem] bg-[#f7efe4] p-5 shadow-[0_10px_28px_rgba(74,59,62,0.06)] ring-1 ring-[#ead9c8]">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sage-deep">
        Partner invite
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
        They started {gameTitle(invite.game_type)}
      </h2>
      <p className="mt-2 text-sm text-muted">
        Join and you will both land in the game together.
      </p>
      <button
        type="button"
        onClick={join}
        disabled={pending}
        className="mt-4 rounded-full bg-sage-deep px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Joining…" : "Join Game"}
      </button>
      {error ? (
        <p className="mt-3 text-sm font-semibold text-rose-deep">{error}</p>
      ) : null}
    </section>
  );
}
