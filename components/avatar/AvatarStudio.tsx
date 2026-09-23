"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AvatarFigure } from "@/components/avatar/AvatarFigure";
import { createClient } from "@/lib/supabase/client";
import {
  ACCESSORIES,
  HAIR_COLORS,
  HAIRSTYLES,
  PANTS,
  SHIRTS,
  SKIN_TONES,
  type AvatarLook,
} from "@/lib/avatar/look";

type AvatarStudioProps = {
  userId: string;
  initialLook: AvatarLook;
};

export function AvatarStudio({ userId, initialLook }: AvatarStudioProps) {
  const [look, setLook] = useState(initialLook);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const persist = useCallback(
    async (next: AvatarLook) => {
      setSaving(true);
      setError(null);
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar: JSON.stringify(next) })
        .eq("id", userId);

      if (updateError) {
        setError("Could not save that look. Try again.");
        setSaved(false);
      } else {
        setSaved(true);
      }
      setSaving(false);
    },
    [userId],
  );

  const skipFirstSave = useRef(true);

  useEffect(() => {
    if (skipFirstSave.current) {
      skipFirstSave.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      void persist(look);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [look, persist]);

  function patch(partial: Partial<AvatarLook>) {
    setSaved(false);
    setLook((current) => ({ ...current, ...partial }));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="grid place-items-center rounded-[2rem] bg-card/95 p-8 ring-1 ring-[#ead9c8]">
        <AvatarFigure look={look} size="lg" pose="idle" />
        <p className="mt-4 text-sm font-semibold text-muted">
          {saving ? "Saving…" : saved ? "Saved to your profile" : "Editing…"}
        </p>
        {error ? (
          <p className="mt-2 text-sm font-semibold text-rose-deep">{error}</p>
        ) : null}
      </div>

      <div className="space-y-5 rounded-[2rem] bg-card/95 p-6 ring-1 ring-[#ead9c8]">
        <OptionRow label="Skin tone">
          {SKIN_TONES.map((option) => (
            <Swatch
              key={option.id}
              label={option.label}
              color={option.color}
              selected={look.skin === option.id}
              onClick={() => patch({ skin: option.id })}
            />
          ))}
        </OptionRow>

        <OptionRow label="Hairstyle">
          {HAIRSTYLES.map((option) => (
            <Chip
              key={option.id}
              label={option.label}
              selected={look.hair === option.id}
              onClick={() => patch({ hair: option.id })}
            />
          ))}
        </OptionRow>

        <OptionRow label="Hair color">
          {HAIR_COLORS.map((option) => (
            <Swatch
              key={option.id}
              label={option.label}
              color={option.color}
              selected={look.hairColor === option.id}
              onClick={() => patch({ hairColor: option.id })}
            />
          ))}
        </OptionRow>

        <OptionRow label="Shirt">
          {SHIRTS.map((option) => (
            <Swatch
              key={option.id}
              label={option.label}
              color={option.color}
              selected={look.shirt === option.id}
              onClick={() => patch({ shirt: option.id })}
            />
          ))}
        </OptionRow>

        <OptionRow label="Pants">
          {PANTS.map((option) => (
            <Swatch
              key={option.id}
              label={option.label}
              color={option.color}
              selected={look.pants === option.id}
              onClick={() => patch({ pants: option.id })}
            />
          ))}
        </OptionRow>

        <OptionRow label="Accessory">
          {ACCESSORIES.map((option) => (
            <Chip
              key={option.id}
              label={option.label}
              selected={look.accessory === option.id}
              onClick={() => patch({ accessory: option.id })}
            />
          ))}
        </OptionRow>
      </div>
    </div>
  );
}

function OptionRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-sage-deep">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Swatch({
  label,
  color,
  selected,
  onClick,
}: {
  label: string;
  color: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className={
        selected
          ? "h-9 w-9 rounded-full ring-2 ring-sage-deep ring-offset-2 ring-offset-[#fffbf7]"
          : "h-9 w-9 rounded-full ring-1 ring-[#ead9c8]"
      }
      style={{ background: color }}
      aria-label={label}
    />
  );
}

function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        selected
          ? "rounded-full bg-sage-deep px-3 py-1.5 text-sm font-semibold text-white"
          : "rounded-full bg-[#f7efe4] px-3 py-1.5 text-sm font-semibold text-ink ring-1 ring-[#ead9c8]"
      }
    >
      {label}
    </button>
  );
}
