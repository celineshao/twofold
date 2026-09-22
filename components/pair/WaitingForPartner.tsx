"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function WaitingForPartner({ coupleId }: { coupleId: string }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`couple-members:${coupleId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "couple_members",
          filter: `couple_id=eq.${coupleId}`,
        },
        () => {
          router.replace("/home");
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [coupleId, router]);

  return (
    <p className="text-sm text-muted">
      Waiting for them to join. This page will open your home when they do.
    </p>
  );
}
