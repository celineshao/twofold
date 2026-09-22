import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

type GamePreviewProps = {
  title: string;
  description: string;
  href: string;
};

export function GamePreview({ title, description, href }: GamePreviewProps) {
  return (
    <Card className="flex h-full flex-col gap-4">
      <div className="grid h-28 place-items-center rounded-2xl bg-blush/50 text-3xl">
        ♥
      </div>
      <div className="flex-1">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
      </div>
      <Button href={href}>Open lobby</Button>
    </Card>
  );
}
