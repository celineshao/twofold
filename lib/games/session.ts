import type { GameType, SessionStatus } from "@/types/database";

export type GameSessionPayload = {
  id: string;
  couple_id: string;
  game_type: GameType;
  status: SessionStatus;
  current_round: number;
  player_ids: string[];
};

export function asGameSessionPayload(data: unknown): GameSessionPayload | null {
  let value = data;
  if (typeof data === "string") {
    try {
      value = JSON.parse(data) as unknown;
    } catch {
      return null;
    }
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const row = value as Record<string, unknown>;
  const playerIds = Array.isArray(row.player_ids)
    ? row.player_ids.filter((id): id is string => typeof id === "string")
    : [];

  if (
    typeof row.id !== "string" ||
    typeof row.couple_id !== "string" ||
    (row.game_type !== "this_or_that" && row.game_type !== "how_well") ||
    typeof row.status !== "string"
  ) {
    return null;
  }

  return {
    id: row.id,
    couple_id: row.couple_id,
    game_type: row.game_type,
    status: row.status as SessionStatus,
    current_round: typeof row.current_round === "number" ? row.current_round : 0,
    player_ids: playerIds,
  };
}

export function gameSessionPath(gameType: GameType, sessionId: string) {
  if (gameType === "this_or_that") {
    return `/games/this-or-that?session=${sessionId}`;
  }
  return `/games/know-me?session=${sessionId}`;
}

export function gameTitle(gameType: GameType) {
  if (gameType === "this_or_that") {
    return "This or That";
  }
  return "How Well Do You Know Me?";
}
