import { asNumber, asRecord } from "@/lib/games/quiz";

export type HeartClaim = {
  sessionId: string;
  heartsEarned: number;
  apartmentHearts: number;
};

export function asHeartClaim(data: unknown): HeartClaim | null {
  const row = asRecord(data);
  if (!row || typeof row.session_id !== "string") {
    return null;
  }

  return {
    sessionId: row.session_id,
    heartsEarned: asNumber(row.hearts_earned),
    apartmentHearts: asNumber(row.apartment_hearts),
  };
}
