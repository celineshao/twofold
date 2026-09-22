import { getCoupleMembership } from "@/lib/couple/membership";

export async function getPostAuthPath(userId: string) {
  const membership = await getCoupleMembership(userId);
  return membership && membership.memberCount >= 2 ? "/home" : "/pair";
}

export function toAuthError(error: { message: string } | null) {
  if (!error) {
    return "Something went wrong. Try again in a moment.";
  }

  const message = error.message.toLowerCase();

  if (message.includes("invalid login")) {
    return "That email and password do not match.";
  }
  if (message.includes("already registered")) {
    return "An account with that email already exists. Try logging in.";
  }
  if (message.includes("password")) {
    return "Use a password with at least 6 characters.";
  }
  if (message.includes("email")) {
    return "Please enter a valid email address.";
  }

  return error.message;
}
