"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  asGameSessionPayload,
  type GameSessionPayload,
} from "@/lib/games/session";

export function useGameSession(sessionId: string | null) {
  const [session, setSession] = useState<GameSessionPayload | null>(null);
  const [loading, setLoading] = useState(Boolean(sessionId));
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!sessionId) {
      setSession(null);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error: loadError } = await supabase.rpc(
      "game_session_payload",
      { _session_id: sessionId },
    );

    if (loadError) {
      setError(loadError.message);
      setLoading(false);
      return;
    }

    setSession(asGameSessionPayload(data));
    setError(null);
    setLoading(false);
  }, [sessionId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const supabase = createClient();
    const channel = supabase
      .channel(`game-session:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_sessions",
          filter: `id=eq.${sessionId}`,
        },
        () => {
          void reload();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_session_players",
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          void reload();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [reload, sessionId]);

  return { session, loading, error, reload };
}
