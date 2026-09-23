import { AvatarStudio } from "@/components/avatar/AvatarStudio";
import { PageHeader } from "@/components/ui/PageHeader";
import { requireUser } from "@/lib/auth/session";
import { lookFromProfile } from "@/lib/avatar/look";
import { createClient } from "@/lib/supabase/server";

export default async function AvatarPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="Your look"
        title="Dress up"
        description="Pick a face, hair, and outfit. Your person will see you standing in the apartment."
      />
      <AvatarStudio
        userId={user.id}
        initialLook={lookFromProfile(profile?.avatar, user.id)}
      />
    </div>
  );
}
