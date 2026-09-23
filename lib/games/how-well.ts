import type { SessionStatus } from "@/types/database";
import {
  asNumber,
  asRecord,
  asString,
  asStringOrNull,
  type QuizDefinition,
  type QuizPlayState,
} from "@/lib/games/quiz";

export const HOW_WELL_ROUNDS = 10;

export const HOW_WELL_QUIZ: QuizDefinition = {
  gameType: "how_well",
  title: "How Well Do You Know Me?",
  lobbyDescription:
    "One answers, one guesses. We will wait for your person, then start together.",
  cardDescription:
    "One of you answers as yourself. The other guesses. Reveal together.",
  href: "/games/know-me",
  recapTitle: "You two are a study.",
  countLabel: (count) =>
    `${count} correct ${count === 1 ? "guess" : "guesses"}`,
  stateRpc: "how_well_state",
  submitRpc: "submit_how_well_answer",
  nextRpc: "next_how_well_round",
  parseState: asHowWellPlayState,
};

export function asHowWellPlayState(data: unknown): QuizPlayState | null {
  const row = asRecord(data);
  if (!row || typeof row.session_id !== "string" || typeof row.status !== "string") {
    return null;
  }

  const options = Array.isArray(row.options)
    ? row.options.filter((item): item is string => typeof item === "string")
    : [];
  const myAnswer = asStringOrNull(row.my_answer);
  const revealed = Boolean(row.revealed);
  const iAmAnswerer = Boolean(row.i_am_answerer);
  const answererAnswered = Boolean(row.answerer_answered);
  const isCorrect = typeof row.is_correct === "boolean" ? row.is_correct : null;
  const answererName = asString(row.answerer_name, "your person");
  const waitingForAnswerer = !iAmAnswerer && !answererAnswered && !revealed;
  const locked = Boolean(myAnswer) && !revealed;

  return {
    sessionId: row.session_id,
    status: row.status as SessionStatus,
    round: {
      number: asNumber(row.current_round, 1),
      total: asNumber(row.total_rounds, HOW_WELL_ROUNDS),
      prompt: asString(row.question),
      choices: options,
    },
    secret: { myAnswer, revealed },
    canChoose: !revealed && !myAnswer && (iAmAnswerer || answererAnswered),
    waitingMessage: waitingForAnswerer
      ? `Waiting for ${answererName} to answer…`
      : locked
        ? "Waiting for your partner..."
        : null,
    waitingLocked: locked,
    roleLabel: iAmAnswerer ? "You are answering" : "You are guessing",
    hint: iAmAnswerer
      ? "Pick the true answer. They will try to guess it."
      : `What did ${answererName} pick?`,
    answers: [
      { label: `${answererName} chose`, value: asStringOrNull(row.answerer_answer) },
      {
        label: `${asString(row.guesser_name, "your person")} guessed`,
        value: asStringOrNull(row.guesser_answer),
      },
    ],
    outcomeHeadline: revealed ? (isCorrect ? "Correct!" : "Not quite!") : null,
    outcomeHit: isCorrect,
    score: {
      count: asNumber(row.matches),
      heartsEarned: asNumber(row.hearts_earned),
      heartsThisRound:
        typeof row.hearts_this_round === "number" ? row.hearts_this_round : null,
    },
  };
}
