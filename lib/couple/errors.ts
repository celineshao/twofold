export function toPairingError(error: { message: string } | null) {
  if (!error) {
    return "Something went wrong. Try again in a moment.";
  }

  const message = error.message.toLowerCase();

  if (message.includes("invalid invite")) {
    return "We could not find that invite code.";
  }
  if (message.includes("already full") || message.includes("only have two")) {
    return "That couple already has two people.";
  }
  if (message.includes("already in this couple")) {
    return "You are already in this couple.";
  }
  if (message.includes("already paired")) {
    return "You already belong to a couple.";
  }
  if (message.includes("not authenticated")) {
    return "Please log in first.";
  }

  return error.message;
}
