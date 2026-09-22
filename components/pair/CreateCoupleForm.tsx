"use client";

import { useActionState } from "react";
import { AuthError } from "@/components/auth/AuthError";
import { Button } from "@/components/ui/Button";
import { createCoupleAction, type PairingState } from "@/lib/couple/actions";

const initialState: PairingState = { error: null };

export function CreateCoupleForm() {
  const [state, action, pending] = useActionState(
    createCoupleAction,
    initialState,
  );

  return (
    <form action={action} className="space-y-4">
      <div className="rounded-2xl bg-blush/40 px-4 py-6 text-center font-display text-3xl tracking-[0.2em] text-rose-deep">
        LOVE-····
      </div>
      <AuthError message={state.error} />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Making your nest…" : "Create a couple"}
      </Button>
    </form>
  );
}
