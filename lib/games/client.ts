import { createClient } from "@/lib/supabase/client";
import { toGameError } from "@/lib/games/errors";
import {
  asGameSessionPayload,
  type GameSessionPayload,
} from "@/lib/games/session";
import type { GameType } from "@/types/database";
import type { GameActionResult } from "@/lib/games/actions";

export async function createGameSession(
  gameType: GameType,
): Promise<GameActionResult> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("create_game_session", {
    p_game_type: gameType,
  });

  if (error) {
    return { ok: false, error: toGameError(error) };
  }

  const session = asGameSessionPayload(data);
  if (!session) {
    return { ok: false, error: "Could not open a game table." };
  }

  return { ok: true, session };
}

export async function joinGameSession(
  sessionId: string,
): Promise<GameActionResult> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("join_game_session", {
    p_session_id: sessionId,
  });

  if (error) {
    return { ok: false, error: toGameError(error) };
  }

  const session = asGameSessionPayload(data);
  if (!session) {
    return { ok: false, error: "Could not join that game." };
  }

  return { ok: true, session };
}

export async function loadGameSession(
  sessionId: string,
): Promise<GameSessionPayload | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("game_session_payload", {
    _session_id: sessionId,
  });

  if (error) {
    return null;
  }

  return asGameSessionPayload(data);
}
