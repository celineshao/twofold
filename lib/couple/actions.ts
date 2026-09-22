"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { toPairingError } from "@/lib/couple/errors";
import { createClient } from "@/lib/supabase/server";

export type PairingState = {
  error: string | null;
};

export async function createCoupleAction(
  _prev: PairingState,
  _formData: FormData,
): Promise<PairingState> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("create_couple");

  if (error) {
    return { error: toPairingError(error) };
  }

  revalidatePath("/pair");
  revalidatePath("/home");
  redirect("/pair");
}

export async function joinCoupleAction(
  _prev: PairingState,
  formData: FormData,
): Promise<PairingState> {
  const inviteCode = String(formData.get("invite_code") ?? "").trim();

  if (!inviteCode) {
    return { error: "Paste the invite code your person sent." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("join_couple", {
    p_invite_code: inviteCode,
  });

  if (error) {
    return { error: toPairingError(error) };
  }

  revalidatePath("/pair");
  revalidatePath("/home");
  redirect("/home");
}
