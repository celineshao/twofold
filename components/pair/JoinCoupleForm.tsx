"use client";

import { useActionState } from "react";
import { AuthError } from "@/components/auth/AuthError";
import { Button } from "@/components/ui/Button";
import { joinCoupleAction, type PairingState } from "@/lib/couple/actions";

const initialState: PairingState = { error: null };

export function JoinCoupleForm() {
  const [state, action, pending] = useActionState(
    joinCoupleAction,
    initialState,
  );

  return (
    <form action={action} className="space-y-4">
      <label className="block text-sm font-semibold">
        Invite code
        <input
          name="invite_code"
          type="text"
          placeholder="LOVE-7K2F"
          autoComplete="off"
          spellCheck={false}
          className="mt-1 w-full rounded-2xl border border-blush bg-white px-4 py-3 text-center font-display text-lg tracking-[0.2em] uppercase outline-none focus:ring-2 focus:ring-rose/40 disabled:opacity-60"
          disabled={pending}
          required
        />
      </label>
      <AuthError message={state.error} />
      <Button
        type="submit"
        variant="secondary"
        className="w-full"
        disabled={pending}
      >
        {pending ? "Finding your person…" : "Join couple"}
      </Button>
    </form>
  );
}
