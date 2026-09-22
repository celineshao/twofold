"use client";

import { useActionState } from "react";
import { signupAction, type AuthState } from "@/lib/auth/actions";
import { AuthError } from "@/components/auth/AuthError";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";

const initialState: AuthState = { error: null };

export function SignupForm() {
  const [state, action, pending] = useActionState(signupAction, initialState);

  if (state.needsEmailConfirm) {
    return (
      <div className="space-y-3 text-center">
        <p className="font-display text-xl font-semibold">Check your inbox</p>
        <p className="text-sm text-muted">
          We sent a confirmation link. After you tap it, come back and log in.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <Field
        label="Display name"
        name="display_name"
        placeholder="Your name"
        autoComplete="nickname"
        required
        maxLength={40}
      />
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
        placeholder="At least 6 characters"
        autoComplete="new-password"
        required
        minLength={6}
      />
      <AuthError message={state.error} />
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Making your room key…" : "Sign up"}
      </Button>
    </form>
  );
}
