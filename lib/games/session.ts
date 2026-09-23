import { quizFor } from "@/lib/games/quizzes";
import { asRecord, quizSessionPath } from "@/lib/games/quiz";
import type { GameType, SessionStatus } from "@/types/database";

export type GameSession = {
  id: string;
  couple_id: string;
  game_type: GameType;
  status: SessionStatus;
  current_round: number;
  player_ids: string[];
};

export type GameSessionPayload = GameSession;

export function asGameSessionPayload(data: unknown): GameSessionPayload | null {
  const row = asRecord(data);
  if (!row) {
    return null;
  }

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
  return quizSessionPath(quizFor(gameType), sessionId);
}

export function gameTitle(gameType: GameType) {
  return quizFor(gameType).title;
}
