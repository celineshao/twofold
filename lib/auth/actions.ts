"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPostAuthPath, toAuthError } from "@/lib/auth/helpers";

export type AuthState = {
  error: string | null;
  needsEmailConfirm?: boolean;
};

export async function loginAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are both needed." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: toAuthError(error) };
  }

  redirect(await getPostAuthPath(data.user.id));
}

export async function signupAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const displayName = String(formData.get("display_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!displayName) {
    return { error: "What should we call you?" };
  }
  if (displayName.length > 40) {
    return { error: "Keep your display name under 40 characters." };
  }
  if (!email || !password) {
    return { error: "Email and password are both needed." };
  }
  if (password.length < 6) {
    return { error: "Use a password with at least 6 characters." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
    },
  });

  if (error) {
    return { error: toAuthError(error) };
  }

  if (!data.session || !data.user) {
    return {
      error: null,
      needsEmailConfirm: true,
    };
  }

  await supabase
    .from("profiles")
    .update({ display_name: displayName })
    .eq("id", data.user.id);

  redirect(await getPostAuthPath(data.user.id));
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
