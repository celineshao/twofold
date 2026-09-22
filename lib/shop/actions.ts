"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { toShopError } from "@/lib/shop/errors";

export type PurchaseResult =
  | { ok: true; hearts: number }
  | { ok: false; error: string };

type PurchasePayload = {
  item_id?: string;
  hearts?: number;
};

export async function purchaseFurnitureAction(
  furnitureId: string,
): Promise<PurchaseResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("purchase_furniture", {
    p_furniture_id: furnitureId,
  });

  if (error) {
    return { ok: false, error: toShopError(error) };
  }

  const payload = data as PurchasePayload | null;
  const hearts = payload?.hearts;

  if (typeof hearts !== "number") {
    return { ok: false, error: "Purchase did not finish. Try again." };
  }

  revalidatePath("/shop");
  revalidatePath("/apartment");
  revalidatePath("/home");

  return { ok: true, hearts };
}
