import { createClient } from "@/lib/supabase/server";
import { lookFromProfile } from "@/lib/avatar/look";
import type { RoomPerson } from "@/lib/avatar/spots";

export async function getApartmentPeople(
  coupleId: string,
  userId: string,
): Promise<RoomPerson[]> {
  const supabase = await createClient();
  const { data: members } = await supabase
    .from("couple_members")
    .select("user_id")
    .eq("couple_id", coupleId);

  const ids = members?.map((member) => member.user_id) ?? [];
  if (ids.length === 0) {
    return [];
  }

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name, avatar")
    .in("id", ids);

  return (profiles ?? [])
    .map((profile) => ({
      id: profile.id,
      name: profile.display_name,
      look: lookFromProfile(profile.avatar, profile.id),
      self: profile.id === userId,
    }))
    .sort((a, b) => Number(b.self) - Number(a.self));
}
