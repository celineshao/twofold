import type { PlayerAnswer } from "@/lib/games/quiz";

type AnswerRevealProps = {
  answers: PlayerAnswer[];
  headline: string;
  hit: boolean;
  heartsThisRound: number | null;
  nextLabel: string;
  busy: boolean;
  onNext: () => void;
};

export function AnswerReveal({
  answers,
  headline,
  hit,
  heartsThisRound,
  nextLabel,
  busy,
  onNext,
}: AnswerRevealProps) {
  return (
    <div className="mt-8 space-y-3">
      {answers.map((answer) => (
        <p key={answer.label} className="text-base font-semibold text-ink">
          {answer.label}: {answer.value}
        </p>
      ))}
      <p
        className={
          hit
            ? "font-display text-2xl font-semibold text-rose-deep"
            : "font-display text-xl font-semibold text-muted"
        }
      >
        {headline}
      </p>
      {heartsThisRound !== null ? (
        <p className="text-sm font-semibold text-rose-deep">
          +{heartsThisRound} Hearts
        </p>
      ) : null}
      <button
        type="button"
        onClick={onNext}
        disabled={busy}
        className="mt-2 rounded-full bg-sage-deep px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {nextLabel}
      </button>
    </div>
  );
}
