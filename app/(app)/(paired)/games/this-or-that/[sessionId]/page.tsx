import { redirect } from "next/navigation";

export default async function ThisOrThatSessionRedirect({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  redirect(`/games/this-or-that?session=${sessionId}`);
}
