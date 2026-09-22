"use client";

import { useEffect, useState } from "react";

export function CopyInviteCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="w-full rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-ink ring-1 ring-blush transition hover:bg-blush/50"
    >
      {copied ? "Copied to clipboard" : "Copy invite code"}
    </button>
  );
}
