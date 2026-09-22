"use client";

import { useEffect, useState, useTransition } from "react";
import { furnitureGraphic } from "@/lib/apartment/graphic";
import { purchaseFurnitureAction } from "@/lib/shop/actions";
import { itemsForSection, SHOP_SECTIONS } from "@/lib/shop/sections";
import { cn } from "@/lib/cn";
import type { FurnitureCatalogItem } from "@/types/database";

type ShopViewProps = {
  items: FurnitureCatalogItem[];
  initialHearts: number;
};

export function ShopView({ items, initialHearts }: ShopViewProps) {
  const [hearts, setHearts] = useState(initialHearts);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setHearts(initialHearts);
  }, [initialHearts]);

  useEffect(() => {
    if (!notice) {
      return;
    }
    const timer = window.setTimeout(() => setNotice(null), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function buy(item: FurnitureCatalogItem) {
    if (hearts < item.price || pending) {
      return;
    }

    setError(null);
    setBuyingId(item.id);
    startTransition(async () => {
      const result = await purchaseFurnitureAction(item.id);
      setBuyingId(null);

      if (!result.ok) {
        setError(result.error);
        return;
      }

      setHearts(result.hearts);
      setNotice("Added to your apartment ♡");
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sage-deep">
            Shared boutique
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
            Furniture shop
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Spend Hearts on pieces for the nest. Buys land in the apartment so
            you can slide them around.
          </p>
        </div>
        <div className="rounded-full bg-[#f7efe4] px-5 py-2.5 text-sm font-semibold text-ink ring-1 ring-[#ead9c8]">
          ♡ {hearts} Hearts
        </div>
      </div>

      {notice ? (
        <p
          role="status"
          className="rounded-2xl bg-sage/50 px-4 py-3 text-sm font-semibold text-sage-deep ring-1 ring-sage-deep/20"
        >
          {notice}
        </p>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="rounded-2xl bg-blush/70 px-4 py-3 text-sm font-semibold text-rose-deep"
        >
          {error}
        </p>
      ) : null}

      {SHOP_SECTIONS.map((section) => {
        const sectionItems = itemsForSection(items, section.categories);
        if (sectionItems.length === 0) {
          return null;
        }

        return (
          <section key={section.title} className="space-y-4">
            <div>
              <h2 className="font-display text-2xl font-semibold text-ink">
                {section.title}
              </h2>
              <div className="mt-1 h-1 w-16 rounded-full bg-peach/80" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sectionItems.map((item) => (
                <ShopCard
                  key={item.id}
                  item={item}
                  hearts={hearts}
                  busy={pending && buyingId === item.id}
                  disabled={pending || hearts < item.price}
                  onBuy={() => buy(item)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function ShopCard({
  item,
  hearts,
  busy,
  disabled,
  onBuy,
}: {
  item: FurnitureCatalogItem;
  hearts: number;
  busy: boolean;
  disabled: boolean;
  onBuy: () => void;
}) {
  const { emoji, tone } = furnitureGraphic(item.image_key, item.category);
  const short = hearts < item.price ? item.price - hearts : 0;

  return (
    <article className="flex flex-col overflow-hidden rounded-[1.75rem] bg-card/95 shadow-[0_12px_28px_rgba(90,70,50,0.08)] ring-1 ring-[#ead9c8]">
      <div
        className={cn(
          "grid h-36 place-items-center sm:h-40",
          tone,
        )}
      >
        <span className="text-5xl" aria-hidden>
          {emoji}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink">
            {item.name}
          </h3>
          <p className="mt-1 text-sm font-semibold text-rose-deep">
            ♡ {item.price}
          </p>
        </div>
        <button
          type="button"
          onClick={onBuy}
          disabled={disabled}
          className="mt-auto rounded-full bg-sage-deep px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#d7c8b8] disabled:text-white/80"
        >
          {busy ? "Buying…" : hearts < item.price ? `Need ${short} more` : "Buy"}
        </button>
      </div>
    </article>
  );
}
