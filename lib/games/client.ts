import { createClient } from "@/lib/supabase/client";
import { toGameError } from "@/lib/games/errors";
import { asGameSessionPayload } from "@/lib/games/session";
import { asHeartClaim, type HeartClaim } from "@/lib/games/hearts";
import type { QuizDefinition, QuizPlayState } from "@/lib/games/quiz";
import type { GameType } from "@/types/database";
import type { GameActionResult } from "@/lib/games/actions";

export type QuizActionResult =
  | { ok: true; state: QuizPlayState }
  | { ok: false; error: string };

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

export async function quitGameSession(
  sessionId: string,
): Promise<GameActionResult> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("quit_game_session", {
    p_session_id: sessionId,
  });

  if (error) {
    return { ok: false, error: toGameError(error) };
  }

  const session = asGameSessionPayload(data);
  if (!session) {
    return { ok: false, error: "Could not leave that game." };
  }

  return { ok: true, session };
}

export async function claimGameHearts(
  sessionId: string,
): Promise<{ ok: true; claim: HeartClaim } | { ok: false; error: string }> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("claim_game_hearts", {
    p_session_id: sessionId,
  });

  if (error) {
    return { ok: false, error: toGameError(error) };
  }

  const claim = asHeartClaim(data);
  if (!claim) {
    return { ok: false, error: "Could not tuck those Hearts into the apartment." };
  }

  return { ok: true, claim };
}

export async function loadQuizState(
  quiz: QuizDefinition,
  sessionId: string,
): Promise<QuizActionResult> {
  return callQuizRpc(quiz, quiz.stateRpc, { p_session_id: sessionId }, "Could not load this round.");
}

export async function submitQuizAnswer(
  quiz: QuizDefinition,
  sessionId: string,
  answer: string,
): Promise<QuizActionResult> {
  return callQuizRpc(
    quiz,
    quiz.submitRpc,
    { p_session_id: sessionId, p_answer: answer },
    "Could not lock that answer.",
  );
}

export async function nextQuizRound(
  quiz: QuizDefinition,
  sessionId: string,
): Promise<QuizActionResult> {
  return callQuizRpc(
    quiz,
    quiz.nextRpc,
    { p_session_id: sessionId },
    "Could not open the next round.",
  );
}

async function callQuizRpc(
  quiz: QuizDefinition,
  rpcName: string,
  params: Record<string, string>,
  emptyError: string,
): Promise<QuizActionResult> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc(rpcName, params);

  if (error) {
    return { ok: false, error: toGameError(error) };
  }

  const state = quiz.parseState(data);
  if (!state) {
    return { ok: false, error: emptyError };
  }

  return { ok: true, state };
}
