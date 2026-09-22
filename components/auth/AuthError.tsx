export function AuthError({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <p
      role="alert"
      className="rounded-2xl bg-blush/70 px-4 py-3 text-sm font-medium text-rose-deep"
    >
      {message}
    </p>
  );
}
