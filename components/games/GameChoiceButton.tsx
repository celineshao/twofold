import { cn } from "@/lib/cn";

export function GameChoiceButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-[1.4rem] bg-[#f7efe4] px-4 py-4 text-base font-semibold text-ink ring-1 ring-[#ead9c8] transition hover:bg-[#efe0cc] disabled:opacity-60",
      )}
    >
      {label}
    </button>
  );
}
