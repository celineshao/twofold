import type { GameType, SessionStatus } from "@/types/database";

export type GameRound = {
  number: number;
  total: number;
  prompt: string;
  choices: string[];
};

export type PlayerAnswer = {
  label: string;
  value: string | null;
};

export type SecretAnswer = {
  myAnswer: string | null;
  revealed: boolean;
};

export type ScoreBoard = {
  count: number;
  heartsEarned: number;
  heartsThisRound: number | null;
};

export type GameResults = {
  title: string;
  countLabel: string;
  heartsEarned: number;
  apartmentHearts?: number;
};

export type QuizPlayState = {
  sessionId: string;
  status: SessionStatus;
  round: GameRound;
  secret: SecretAnswer;
  canChoose: boolean;
  waitingMessage: string | null;
  waitingLocked: boolean;
  roleLabel: string | null;
  hint: string | null;
  answers: PlayerAnswer[];
  outcomeHeadline: string | null;
  outcomeHit: boolean | null;
  score: ScoreBoard;
};

export type QuizDefinition = {
  gameType: GameType;
  title: string;
  lobbyDescription: string;
  cardDescription: string;
  href: string;
  recapTitle: string;
  countLabel: (count: number) => string;
  stateRpc: string;
  submitRpc: string;
  nextRpc: string;
  parseState: (data: unknown) => QuizPlayState | null;
};

export function quizSessionPath(quiz: QuizDefinition, sessionId: string) {
  return `${quiz.href}?session=${sessionId}`;
}

export function asRecord(data: unknown): Record<string, unknown> | null {
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

  return value as Record<string, unknown>;
}

export function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

export function asStringOrNull(value: unknown) {
  return typeof value === "string" ? value : null;
}

export function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" ? value : fallback;
}
