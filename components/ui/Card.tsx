import { cn } from "@/lib/cn";

type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-blush/70 bg-card/90 p-6 shadow-[0_8px_30px_rgba(201,107,120,0.08)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
