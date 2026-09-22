type PageHeaderProps = {
  kicker?: string;
  title: string;
  description?: string;
};

export function PageHeader({ kicker, title, description }: PageHeaderProps) {
  return (
    <header className="mb-8 max-w-2xl">
      {kicker ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-deep">
          {kicker}
        </p>
      ) : null}
      <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 text-base leading-relaxed text-muted">{description}</p>
      ) : null}
    </header>
  );
}
