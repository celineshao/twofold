export function WaitingForPartner({
  message,
  locked = false,
}: {
  message: string;
  locked?: boolean;
}) {
  if (!locked) {
    return (
      <p className="mt-8 text-sm font-semibold text-muted">{message}</p>
    );
  }

  return (
    <div className="mt-8 space-y-2">
      <p className="font-display text-xl font-semibold text-ink">
        Answer locked 🔒
      </p>
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}
