import { redirect } from "next/navigation";
import { getPostAuthPath } from "@/lib/auth/helpers";
import { getSignedInUser } from "@/lib/auth/session";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSignedInUser();
  if (user) {
    redirect(await getPostAuthPath(user.id));
  }

  return children;
}
