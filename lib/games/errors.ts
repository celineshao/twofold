export function toGameError(error: { message: string } | null) {
  if (!error) {
    return "Something went wrong. Try again in a moment.";
  }

  const message = error.message.toLowerCase();

  if (message.includes("not authenticated")) {
    return "Please log in first.";
  }
  if (message.includes("not paired")) {
    return "Pair with someone before playing.";
  }
  if (message.includes("session not found")) {
    return "That game table is gone.";
  }
  if (message.includes("already started")) {
    return "This game already started without you.";
  }
  if (message.includes("session finished")) {
    return "This game already finished.";
  }
  if (message.includes("schema cache") || message.includes("could not find the function")) {
    return "This game is not in the database yet. Run the latest game SQL in Supabase, then try again.";
  }
  if (message.includes("wrong game")) {
    return "That table belongs to a different game. Start How Well from the games page as a new table.";
  }
  if (message.includes("invalid answer")) {
    return "That choice is not on this card.";
  }
  if (message.includes("round not finished")) {
    return "Wait until you both have answered.";
  }
  if (message.includes("not in this game")) {
    return "You are not at this table.";
  }
  if (message.includes("game is not finished")) {
    return "Finish the last round before claiming Hearts.";
  }

  return error.message;
}
