"use client";

import { useActionState } from "react";
import { loginAction, type AuthState } from "@/lib/auth/actions";
import { AuthError } from "@/components/auth/AuthError";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";

const initialState: AuthState = { error: null };

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="space-y-4">
      <Field
        label="Email"
        name="email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        required
      />
      <Field
        label="Password"
        name="password"
        type="password"
        placeholder="••••••••"
        autoComplete="current-password"
        required
        minLength={6}
      />
      <AuthError message={state.error} />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Tucking you in…" : "Log in"}
      </Button>
    </form>
  );
}
