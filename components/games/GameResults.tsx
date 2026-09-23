"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { claimGameHearts } from "@/lib/games/client";
import type { HeartClaim } from "@/lib/games/hearts";

type GameResultsProps = {
  sessionId: string;
  kicker: string;
  title: string;
  countLabel: string;
  heartsEarned: number;
  onPlayAgain: () => void;
};

export function GameResults({
  sessionId,
  kicker,
  title,
  countLabel,
  heartsEarned,
  onPlayAgain,
}: GameResultsProps) {
  const [claim, setClaim] = useState<HeartClaim | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void claimGameHearts(sessionId).then((result) => {
      if (cancelled) {
        return;
      }
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setClaim(result.claim);
    });

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const reward = claim?.heartsEarned ?? heartsEarned;
  const apartmentHearts = claim?.apartmentHearts;

  return (
    <div className="mx-auto max-w-md rounded-[2rem] bg-card/95 p-8 text-center shadow-[0_12px_28px_rgba(90,70,50,0.08)] ring-1 ring-[#ead9c8]">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage-deep">
        {kicker}
      </p>
      <h2 className="mt-3 font-display text-3xl font-semibold text-ink">
        {title}
      </h2>
      <p className="mt-4 text-lg font-semibold text-ink">{countLabel}</p>

      <p className="payout-pop mt-6 font-display text-5xl font-semibold text-rose-deep">
        +{reward} ♡
      </p>
      {apartmentHearts !== undefined ? (
        <p className="payout-follow mt-3 text-base font-semibold text-ink">
          Your apartment now has {apartmentHearts} Hearts.
        </p>
      ) : (
        <p className="mt-3 text-sm text-muted">Tucking Hearts into the apartment…</p>
      )}
      {error ? (
        <p className="mt-3 text-sm font-semibold text-rose-deep">{error}</p>
      ) : null}

      <div className="mt-8 flex flex-col gap-3">
        <Link
          href="/shop"
          className="rounded-full bg-sage-deep px-5 py-2.5 text-sm font-semibold text-white"
        >
          Go Shopping
        </Link>
        <button
          type="button"
          onClick={onPlayAgain}
          className="rounded-full bg-[#f4e6d6] px-5 py-2.5 text-sm font-semibold text-ink ring-1 ring-[#e2c9b0]"
        >
          Play Again
        </button>
        <Link
          href="/home"
          className="text-sm font-semibold text-sage-deep hover:underline"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
