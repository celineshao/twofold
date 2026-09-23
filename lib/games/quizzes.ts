import { HOW_WELL_QUIZ } from "@/lib/games/how-well";
import { THIS_OR_THAT_QUIZ } from "@/lib/games/this-or-that";
import type { QuizDefinition } from "@/lib/games/quiz";
import type { GameType } from "@/types/database";

export const QUIZ_GAMES: QuizDefinition[] = [THIS_OR_THAT_QUIZ, HOW_WELL_QUIZ];

export function quizFor(gameType: GameType): QuizDefinition {
  const quiz = QUIZ_GAMES.find((item) => item.gameType === gameType);
  if (!quiz) {
    throw new Error(`Unknown quiz game: ${gameType}`);
  }
  return quiz;
}
