"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { quitGameSession } from "@/lib/games/client";

export function LeaveGameButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function leave() {
    if (busy) {
      return;
    }
    setBusy(true);
    setError(null);
    const result = await quitGameSession(sessionId);
    if (!result.ok) {
      setError(result.error);
      setBusy(false);
      return;
    }
    router.replace("/games");
  }

  return (
    <div className="mt-6 text-center">
      <button
        type="button"
        onClick={() => void leave()}
        disabled={busy}
        className="text-sm font-semibold text-muted underline decoration-[#ead9c8] underline-offset-4 hover:text-ink disabled:opacity-60"
      >
        {busy ? "Leaving…" : "Quit game"}
      </button>
      {error ? (
        <p className="mt-2 text-sm font-semibold text-rose-deep">{error}</p>
      ) : null}
    </div>
  );
}
