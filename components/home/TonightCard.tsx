import Link from "next/link";
import { cn } from "@/lib/cn";

type TonightCardProps = {
  title: string;
  description: string;
  accent: string;
  href?: string;
  comingSoon?: boolean;
};

export function TonightCard({
  title,
  description,
  accent,
  href,
  comingSoon,
}: TonightCardProps) {
  const body = (
    <>
      <div
        className={cn(
          "mb-4 grid h-20 place-items-center rounded-2xl text-lg font-semibold",
          accent,
        )}
      >
        {comingSoon ? "Soon" : "Play"}
      </div>
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
      {comingSoon ? (
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          Coming soon
        </p>
      ) : (
        <p className="mt-4 text-sm font-semibold text-sage-deep">Open table →</p>
      )}
    </>
  );

  const className = cn(
    "home-fade rounded-[1.75rem] border border-[#ead9c8] bg-card/95 p-5 shadow-[0_10px_28px_rgba(74,59,62,0.06)] transition duration-300",
    comingSoon
      ? "opacity-80"
      : "hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(74,59,62,0.1)]",
  );

  if (comingSoon || !href) {
    return <article className={className}>{body}</article>;
  }

  return (
    <Link href={href} className={cn(className, "block")}>
      {body}
    </Link>
  );
}
