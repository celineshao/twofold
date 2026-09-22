import { redirect } from "next/navigation";

export default async function KnowMeSessionRedirect({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  redirect(`/games/know-me?session=${sessionId}`);
}
