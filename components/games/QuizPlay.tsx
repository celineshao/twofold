"use client";

import { AnswerReveal } from "@/components/games/AnswerReveal";
import { GameChoiceButton } from "@/components/games/GameChoiceButton";
import { GameResults } from "@/components/games/GameResults";
import { ScoreBoard } from "@/components/games/ScoreBoard";
import { WaitingForPartner } from "@/components/games/WaitingForPartner";
import type { QuizDefinition } from "@/lib/games/quiz";
import { useQuizGame } from "@/lib/games/useQuizGame";

type QuizPlayProps = {
  quiz: QuizDefinition;
  sessionId: string;
  onPlayAgain: () => void;
};

export function QuizPlay({ quiz, sessionId, onPlayAgain }: QuizPlayProps) {
  const {
    state,
    loading,
    error,
    actionError,
    busy,
    submitAnswer,
    nextRound,
  } = useQuizGame(quiz, sessionId);

  if (loading && !state) {
    return (
      <p className="text-center text-sm font-semibold text-muted">
        Shuffling the cards…
      </p>
    );
  }

  if (!state) {
    return (
      <p className="text-center text-sm font-semibold text-rose-deep">
        {error ?? "This round could not load."}
      </p>
    );
  }

  if (state.status === "finished") {
    return (
      <GameResults
        sessionId={sessionId}
        kicker={quiz.title}
        title={quiz.recapTitle}
        countLabel={quiz.countLabel(state.score.count)}
        heartsEarned={state.score.heartsEarned}
        onPlayAgain={onPlayAgain}
      />
    );
  }

  return (
    <div className="mx-auto max-w-xl rounded-[2rem] bg-card/95 p-6 text-center shadow-[0_12px_28px_rgba(90,70,50,0.08)] ring-1 ring-[#ead9c8] sm:p-8">
      <ScoreBoard
        round={state.round.number}
        total={state.round.total}
        heartsEarned={state.score.heartsEarned}
      />
      {state.roleLabel ? (
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-sage-deep">
          {state.roleLabel}
        </p>
      ) : null}
      <h2 className="mt-3 font-display text-2xl font-semibold text-ink sm:text-3xl">
        {state.round.prompt}
      </h2>
      {state.hint ? (
        <p className="mt-2 text-sm text-muted">{state.hint}</p>
      ) : null}

      {state.waitingMessage ? (
        <WaitingForPartner
          message={state.waitingMessage}
          locked={state.waitingLocked}
        />
      ) : null}

      {state.secret.revealed && state.outcomeHeadline ? (
        <AnswerReveal
          answers={state.answers}
          headline={state.outcomeHeadline}
          hit={Boolean(state.outcomeHit)}
          heartsThisRound={state.score.heartsThisRound}
          nextLabel={
            state.round.number >= state.round.total ? "See results" : "Next Round"
          }
          busy={busy}
          onNext={() => void nextRound()}
        />
      ) : null}

      {state.canChoose ? (
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {state.round.choices.map((choice) => (
            <GameChoiceButton
              key={choice}
              label={choice}
              disabled={busy}
              onClick={() => void submitAnswer(choice)}
            />
          ))}
        </div>
      ) : null}

      {actionError || error ? (
        <p className="mt-4 text-sm font-semibold text-rose-deep">
          {actionError ?? error}
        </p>
      ) : null}
    </div>
  );
}
