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
    return "The game lobby is not in the database yet. Run the game lobby SQL in Supabase, then try again.";
  }

  return error.message;
}
