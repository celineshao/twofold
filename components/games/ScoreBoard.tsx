type ScoreBoardProps = {
  round: number;
  total: number;
  heartsEarned: number;
};

export function ScoreBoard({ round, total, heartsEarned }: ScoreBoardProps) {
  return (
    <div className="flex items-center justify-center gap-3 text-sm font-semibold text-rose-deep">
      <span>
        Round {round} of {total}
      </span>
      <span aria-hidden="true">·</span>
      <span>♡ {heartsEarned}</span>
    </div>
  );
}
