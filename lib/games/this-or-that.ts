import type { SessionStatus } from "@/types/database";
import {
  asNumber,
  asRecord,
  asString,
  asStringOrNull,
  type QuizDefinition,
  type QuizPlayState,
} from "@/lib/games/quiz";

export const THIS_OR_THAT_ROUNDS = 10;

export const THIS_OR_THAT_QUIZ: QuizDefinition = {
  gameType: "this_or_that",
  title: "This or That",
  lobbyDescription:
    "Same prompt, two options. We will wait for your person, then start together.",
  cardDescription:
    "Same prompt, two options. Match with your person and earn Hearts.",
  href: "/games/this-or-that",
  recapTitle: "That was sweet.",
  countLabel: (count) => `${count} ${count === 1 ? "match" : "matches"}`,
  stateRpc: "this_or_that_state",
  submitRpc: "submit_this_or_that_answer",
  nextRpc: "next_this_or_that_round",
  parseState: asThisOrThatPlayState,
};

export function asThisOrThatPlayState(data: unknown): QuizPlayState | null {
  const row = asRecord(data);
  if (!row || typeof row.session_id !== "string" || typeof row.status !== "string") {
    return null;
  }

  const optionA = asString(row.option_a);
  const optionB = asString(row.option_b);
  const myAnswer = asStringOrNull(row.my_answer);
  const revealed = Boolean(row.revealed);
  const isMatch = typeof row.is_match === "boolean" ? row.is_match : null;
  const locked = Boolean(myAnswer) && !revealed;

  return {
    sessionId: row.session_id,
    status: row.status as SessionStatus,
    round: {
      number: asNumber(row.current_round),
      total: asNumber(row.total_rounds, THIS_OR_THAT_ROUNDS),
      prompt: asString(row.prompt),
      choices: [optionA, optionB].filter(Boolean),
    },
    secret: { myAnswer, revealed },
    canChoose: !myAnswer && !revealed,
    waitingMessage: locked ? "Waiting for your partner..." : null,
    waitingLocked: locked,
    roleLabel: null,
    hint: null,
    answers: [
      { label: "You chose", value: myAnswer },
      {
        label: `${asString(row.partner_name, "your person")} chose`,
        value: asStringOrNull(row.partner_answer),
      },
    ],
    outcomeHeadline: revealed
      ? isMatch
        ? "♡ MATCH!"
        : "Different picks — still cute."
      : null,
    outcomeHit: isMatch,
    score: {
      count: asNumber(row.matches),
      heartsEarned: asNumber(row.hearts_earned),
      heartsThisRound:
        typeof row.hearts_this_round === "number" ? row.hearts_this_round : null,
    },
  };
}
