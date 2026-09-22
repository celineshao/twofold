export function GameLobby({ partnerName }: { partnerName?: string | null }) {
  return (
    <div className="mx-auto max-w-md rounded-[2rem] bg-card/95 px-6 py-12 text-center shadow-[0_12px_28px_rgba(90,70,50,0.08)] ring-1 ring-[#ead9c8]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage-deep">
        Game lobby
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ink">
        Waiting for your partner ♡
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        {partnerName
          ? `${partnerName} will see a Join Game invite at home.`
          : "Your person will see a Join Game invite at home."}
      </p>
      <div className="mx-auto mt-8 h-3 w-3 animate-pulse rounded-full bg-rose" />
    </div>
  );
}
