"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export type CoupleRealtimeTable =
  | "game_sessions"
  | "game_session_players"
  | "apartment_items"
  | "apartments"
  | "couple_members";

type RealtimeRow = Record<string, unknown>;

type UseCoupleRealtimeOptions = {
  table: CoupleRealtimeTable;
  event?: "*" | "INSERT" | "UPDATE" | "DELETE";
  filter?: string;
  onEvent: (payload: RealtimePostgresChangesPayload<RealtimeRow>) => void;
};

export function useCoupleRealtime(
  coupleId: string | null,
  { table, event = "*", filter, onEvent }: UseCoupleRealtimeOptions,
) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!coupleId) {
      return;
    }

    const supabase = createClient();
    const channel = supabase
      .channel(`couple:${coupleId}:${table}:${event}`)
      .on(
        "postgres_changes",
        {
          event,
          schema: "public",
          table,
          filter: filter ?? `couple_id=eq.${coupleId}`,
        },
        (payload) => {
          onEventRef.current(payload as RealtimePostgresChangesPayload<RealtimeRow>);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [coupleId, table, event, filter]);
}
