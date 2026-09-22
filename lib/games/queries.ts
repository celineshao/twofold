import { createClient } from "@/lib/supabase/server";
import {
  asGameSessionPayload,
  type GameSessionPayload,
} from "@/lib/games/session";

export async function getGameSession(
  sessionId: string,
): Promise<GameSessionPayload | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("game_session_payload", {
    _session_id: sessionId,
  });

  if (error) {
    return null;
  }

  return asGameSessionPayload(data);
}

export async function getOpenGameInvite(
  coupleId: string,
  userId: string,
): Promise<GameSessionPayload | null> {
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("game_sessions")
    .select("id")
    .eq("couple_id", coupleId)
    .eq("status", "waiting")
    .maybeSingle();

  if (!row) {
    return null;
  }

  const session = await getGameSession(row.id);
  if (!session) {
    return null;
  }

  if (session.player_ids.includes(userId)) {
    return null;
  }

  return session;
}
