export function toShopError(error: { message: string } | null) {
  if (!error) {
    return "Something went wrong. Try again in a moment.";
  }

  const message = error.message.toLowerCase();

  if (message.includes("not enough hearts")) {
    return "Not enough Hearts for that piece.";
  }
  if (message.includes("not authenticated")) {
    return "Please log in first.";
  }
  if (message.includes("not paired")) {
    return "Pair with someone before shopping.";
  }
  if (message.includes("item not found")) {
    return "That piece is no longer in the shop.";
  }

  return error.message;
}
