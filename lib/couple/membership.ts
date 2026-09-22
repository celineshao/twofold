import { createClient } from "@/lib/supabase/server";

export type CoupleMembership = {
  coupleId: string;
  inviteCode: string;
  memberCount: number;
  partnerName: string | null;
  hearts: number;
};

export async function getCoupleMembership(
  userId: string,
): Promise<CoupleMembership | null> {
  const supabase = await createClient();

  const { data: membership, error } = await supabase
    .from("couple_members")
    .select("couple_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !membership) {
    return null;
  }

  const [{ data: couple }, { data: members }, { data: apartment }] =
    await Promise.all([
      supabase
        .from("couples")
        .select("invite_code")
        .eq("id", membership.couple_id)
        .maybeSingle(),
      supabase
        .from("couple_members")
        .select("user_id")
        .eq("couple_id", membership.couple_id),
      supabase
        .from("apartments")
        .select("hearts")
        .eq("couple_id", membership.couple_id)
        .maybeSingle(),
    ]);

  if (!couple) {
    return null;
  }

  const partnerId = members?.find((member) => member.user_id !== userId)?.user_id;
  let partnerName: string | null = null;

  if (partnerId) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", partnerId)
      .maybeSingle();
    partnerName = profile?.display_name ?? null;
  }

  return {
    coupleId: membership.couple_id,
    inviteCode: couple.invite_code,
    memberCount: members?.length ?? 0,
    partnerName,
    hearts: apartment?.hearts ?? 0,
  };
}
