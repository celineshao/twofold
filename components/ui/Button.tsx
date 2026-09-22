import Link from "next/link";
import { cn } from "@/lib/cn";

const variants = {
  primary:
    "bg-rose text-white shadow-sm hover:bg-rose-deep disabled:opacity-50",
  secondary:
    "bg-sage text-ink hover:bg-sage-deep hover:text-white disabled:opacity-50",
  ghost:
    "bg-white/60 text-ink ring-1 ring-blush/80 hover:bg-blush/50 disabled:opacity-50",
};

type CommonProps = {
  variant?: keyof typeof variants;
  className?: string;
};

type ButtonAsButton = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsLink = CommonProps & {
  href: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", className } = props;
  const classes = cn(
    "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold tracking-wide transition",
    variants[variant],
    className,
  );

  if ("href" in props && props.href) {
    const { href, variant: _v, className: _c, ...rest } = props;
    return <Link href={href} className={classes} {...rest} />;
  }

  const { variant: _v, className: _c, ...rest } = props as ButtonAsButton;
  return <button className={classes} {...rest} />;
}
