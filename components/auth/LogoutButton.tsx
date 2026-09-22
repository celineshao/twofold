"use client";

import { useTransition } from "react";
import { logoutAction } from "@/lib/auth/actions";

export function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => logoutAction())}
      className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-ink ring-1 ring-blush transition hover:bg-blush/50 disabled:opacity-60"
    >
      {pending ? "Bye…" : "Log out"}
    </button>
  );
}
