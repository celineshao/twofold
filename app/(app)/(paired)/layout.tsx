import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/session";
import { getCoupleMembership } from "@/lib/couple/membership";

export default async function PairedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const membership = await getCoupleMembership(user.id);

  if (!membership || membership.memberCount < 2) {
    redirect("/pair");
  }

  return children;
}
