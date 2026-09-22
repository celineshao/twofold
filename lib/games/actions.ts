"use server";

import { createClient } from "@/lib/supabase/server";
import { toGameError } from "@/lib/games/errors";
import {
  asGameSessionPayload,
  type GameSessionPayload,
} from "@/lib/games/session";
import type { GameType } from "@/types/database";

export type GameActionResult =
  | { ok: true; session: GameSessionPayload }
  | { ok: false; error: string };

export async function createGameSessionAction(
  gameType: GameType,
): Promise<GameActionResult> {
  const supabase = await createClient();
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

export async function joinGameSessionAction(
  sessionId: string,
): Promise<GameActionResult> {
  const supabase = await createClient();
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
