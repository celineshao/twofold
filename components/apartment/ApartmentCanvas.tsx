"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { ApartmentRoom } from "@/components/apartment/ApartmentRoom";
import { ROOM_COLS, ROOM_ROWS, type PlacedFurniture } from "@/lib/apartment/grid";
import {
  APARTMENT_ITEM_SELECT,
  mapApartmentItems,
  type ApartmentItemRow,
} from "@/lib/apartment/map-items";
import { clampToGrid, nextRotation } from "@/lib/apartment/placement";
import { SAMPLE_FURNITURE } from "@/lib/apartment/sample";
import { lookFromProfile } from "@/lib/avatar/look";
import type { RoomPerson } from "@/lib/avatar/spots";
import { createClient } from "@/lib/supabase/client";

type ApartmentCanvasProps = {
  apartmentId: string;
  initialItems: PlacedFurniture[];
  people: RoomPerson[];
};

type DragState = {
  id: string;
  grabCol: number;
  grabRow: number;
  startX: number;
  startY: number;
};

type ItemChange = {
  id: string;
  x: number;
  y: number;
  rotation: number;
};

export function ApartmentCanvas({
  apartmentId,
  initialItems,
  people: initialPeople,
}: ApartmentCanvasProps) {
  const [editing, setEditing] = useState(false);
  const [items, setItems] = useState(initialItems);
  const [people, setPeople] = useState(initialPeople);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const floorRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const itemsRef = useRef(items);
  const editingRef = useRef(editing);
  const selectedIdRef = useRef(selectedId);
  itemsRef.current = items;
  editingRef.current = editing;
  selectedIdRef.current = selectedId;

  const selected = items.find((item) => item.id === selectedId) ?? null;

  const persist = useCallback(
    async (id: string, patch: { x?: number; y?: number; rotation?: number }) => {
      setSaving(true);
      const supabase = createClient();
      await supabase.from("apartment_items").update(patch).eq("id", id);
      setSaving(false);
    },
    [],
  );

  useEffect(() => {
    const ids = initialPeople.map((person) => person.id);
    if (ids.length === 0) {
      return;
    }
    const supabase = createClient();
    const channel = supabase.channel(`avatars:${apartmentId}`);
    for (const id of ids) {
      channel.on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          const row = payload.new as { id?: string; avatar?: string | null };
          if (!row.id) {
            return;
          }
          setPeople((list) =>
            list.map((item) =>
              item.id === row.id
                ? { ...item, look: lookFromProfile(row.avatar, row.id) }
                : item,
            ),
          );
        },
      );
    }
    channel.subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [apartmentId, initialPeople]);

  const pointToCell = useCallback((clientX: number, clientY: number) => {
    const floor = floorRef.current;
    if (!floor) {
      return { col: 0, row: 0 };
    }
    const rect = floor.getBoundingClientRect();
    const col = Math.floor(((clientX - rect.left) / rect.width) * ROOM_COLS);
    const row = Math.floor(((clientY - rect.top) / rect.height) * ROOM_ROWS);
    return {
      col: Math.min(Math.max(0, col), ROOM_COLS - 1),
      row: Math.min(Math.max(0, row), ROOM_ROWS - 1),
    };
  }, []);

  const moveItem = useCallback(
    (id: string, x: number, y: number, shouldPersist: boolean) => {
      const current = itemsRef.current.find((item) => item.id === id);
      if (!current) {
        return;
      }
      const next = clampToGrid(
        x,
        y,
        current.width,
        current.height,
        current.rotation,
      );
      if (next.x === current.x && next.y === current.y) {
        return;
      }
      setItems((list) =>
        list.map((item) => (item.id === id ? { ...item, ...next } : item)),
      );
      if (shouldPersist) {
        void persist(id, next);
      }
    },
    [persist],
  );

  useEffect(() => {
    const supabase = createClient();

    async function refetchItems() {
      const { data } = await supabase
        .from("apartment_items")
        .select(APARTMENT_ITEM_SELECT)
        .eq("apartment_id", apartmentId);
      setItems(mapApartmentItems(data as ApartmentItemRow[] | null));
    }

    const channel = supabase
      .channel(`apartment-items:${apartmentId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "apartment_items",
          filter: `apartment_id=eq.${apartmentId}`,
        },
        (payload) => {
          const draggingId = dragRef.current?.id;

          if (payload.eventType === "DELETE") {
            const id = (payload.old as { id?: string }).id;
            if (!id) {
              return;
            }
            setItems((list) => list.filter((item) => item.id !== id));
            setSelectedId((current) => (current === id ? null : current));
            return;
          }

          if (payload.eventType === "UPDATE") {
            const next = payload.new as ItemChange;
            if (draggingId === next.id) {
              return;
            }
            setItems((list) =>
              list.map((item) =>
                item.id === next.id
                  ? {
                      ...item,
                      x: next.x,
                      y: next.y,
                      rotation: next.rotation,
                    }
                  : item,
              ),
            );
            return;
          }

          if (payload.eventType === "INSERT") {
            void refetchItems();
          }
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [apartmentId]);

  useEffect(() => {
    function onMove(event: PointerEvent) {
      const drag = dragRef.current;
      if (!drag) {
        return;
      }
      const { col, row } = pointToCell(event.clientX, event.clientY);
      moveItem(drag.id, col - drag.grabCol, row - drag.grabRow, false);
    }

    function onUp() {
      const drag = dragRef.current;
      if (!drag) {
        return;
      }
      dragRef.current = null;
      const current = itemsRef.current.find((item) => item.id === drag.id);
      if (
        current &&
        (current.x !== drag.startX || current.y !== drag.startY)
      ) {
        void persist(drag.id, { x: current.x, y: current.y });
      }
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [moveItem, persist, pointToCell]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!editingRef.current || !selectedIdRef.current) {
        return;
      }
      const key = event.key;
      if (
        key !== "ArrowUp" &&
        key !== "ArrowDown" &&
        key !== "ArrowLeft" &&
        key !== "ArrowRight"
      ) {
        return;
      }
      event.preventDefault();
      const id = selectedIdRef.current;
      const current = itemsRef.current.find((item) => item.id === id);
      if (!current) {
        return;
      }
      const dx = key === "ArrowLeft" ? -1 : key === "ArrowRight" ? 1 : 0;
      const dy = key === "ArrowUp" ? -1 : key === "ArrowDown" ? 1 : 0;
      moveItem(id, current.x + dx, current.y + dy, true);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [moveItem]);

  function startDrag(event: ReactPointerEvent<HTMLDivElement>, id: string) {
    const item = itemsRef.current.find((piece) => piece.id === id);
    if (!item) {
      return;
    }
    setSelectedId(id);
    const { col, row } = pointToCell(event.clientX, event.clientY);
    dragRef.current = {
      id,
      grabCol: col - item.x,
      grabRow: row - item.y,
      startX: item.x,
      startY: item.y,
    };
  }

  function nudge(dx: number, dy: number) {
    if (!selected) {
      return;
    }
    moveItem(selected.id, selected.x + dx, selected.y + dy, true);
  }

  async function rotateSelected() {
    if (!selected) {
      return;
    }
    const rotation = nextRotation(selected.rotation);
    const next = clampToGrid(
      selected.x,
      selected.y,
      selected.width,
      selected.height,
      rotation,
    );
    setItems((list) =>
      list.map((item) =>
        item.id === selected.id ? { ...item, ...next, rotation } : item,
      ),
    );
    await persist(selected.id, { ...next, rotation });
  }

  async function removeSelected() {
    if (!selected) {
      return;
    }
    const id = selected.id;
    setItems((list) => list.filter((item) => item.id !== id));
    setSelectedId(null);
    setSaving(true);
    const supabase = createClient();
    await supabase.from("apartment_items").delete().eq("id", id);
    setSaving(false);
  }

  async function placeSampleFurniture() {
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaving(false);
      return;
    }

    const { data: catalog } = await supabase
      .from("furniture_catalog")
      .select("id, image_key");

    const rows = SAMPLE_FURNITURE.flatMap((sample) => {
      const piece = catalog?.find((item) => item.image_key === sample.imageKey);
      if (!piece) {
        return [];
      }
      return [
        {
          apartment_id: apartmentId,
          furniture_id: piece.id,
          x: sample.x,
          y: sample.y,
          rotation: sample.rotation,
          placed_by: user.id,
        },
      ];
    });

    if (rows.length > 0) {
      await supabase.from("apartment_items").insert(rows);
      const { data } = await supabase
        .from("apartment_items")
        .select(APARTMENT_ITEM_SELECT)
        .eq("apartment_id", apartmentId);
      setItems(mapApartmentItems(data as ApartmentItemRow[] | null));
    }

    setSaving(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setEditing((value) => !value);
            setSelectedId(null);
            dragRef.current = null;
          }}
          className="inline-flex shrink-0 appearance-none items-center justify-center whitespace-nowrap rounded-full border-0 bg-sage-deep px-4 py-2 text-sm font-semibold leading-none text-white outline-none focus-visible:ring-2 focus-visible:ring-sage-deep/50 focus-visible:ring-offset-2"
        >
          {editing ? "Done editing" : "Edit apartment"}
        </button>
        {items.length === 0 ? (
          <button
            type="button"
            onClick={() => void placeSampleFurniture()}
            className="inline-flex shrink-0 appearance-none items-center justify-center whitespace-nowrap rounded-full border-0 bg-card px-4 py-2 text-sm font-semibold leading-none text-ink ring-1 ring-[#ead9c8]"
          >
            Place sample furniture
          </button>
        ) : null}
        {saving ? (
          <p className="text-xs font-semibold text-muted">Saving…</p>
        ) : null}
      </div>

      <ApartmentRoom
        items={items}
        people={people}
        editing={editing}
        selectedId={selectedId}
        floorRef={floorRef}
        onSelect={(id) => {
          if (!id) {
            setSelectedId(null);
          }
        }}
        onItemPointerDown={editing ? startDrag : undefined}
      />

      {editing && selected ? (
        <div className="rounded-[1.5rem] bg-card/95 p-4 ring-1 ring-[#ead9c8]">
          <p className="mb-3 text-sm font-semibold text-ink">{selected.name}</p>
          <div className="flex flex-wrap items-center gap-2">
            <div className="grid grid-cols-3 gap-1">
              <span />
              <button
                type="button"
                className="rounded-xl bg-[#f7efe4] px-3 py-2 text-sm font-semibold"
                onClick={() => nudge(0, -1)}
                aria-label="Move up"
              >
                ↑
              </button>
              <span />
              <button
                type="button"
                className="rounded-xl bg-[#f7efe4] px-3 py-2 text-sm font-semibold"
                onClick={() => nudge(-1, 0)}
                aria-label="Move left"
              >
                ←
              </button>
              <button
                type="button"
                className="rounded-xl bg-[#f7efe4] px-3 py-2 text-sm font-semibold"
                onClick={() => nudge(0, 1)}
                aria-label="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                className="rounded-xl bg-[#f7efe4] px-3 py-2 text-sm font-semibold"
                onClick={() => nudge(1, 0)}
                aria-label="Move right"
              >
                →
              </button>
            </div>
            <button
              type="button"
              onClick={() => void rotateSelected()}
              className="rounded-full bg-[#f4e6d6] px-4 py-2 text-sm font-semibold text-ink ring-1 ring-[#e2c9b0]"
            >
              Rotate
            </button>
            <button
              type="button"
              onClick={() => void removeSelected()}
              className="rounded-full bg-blush/80 px-4 py-2 text-sm font-semibold text-rose-deep"
            >
              Remove from room
            </button>
          </div>
          <p className="mt-3 text-xs text-muted">
            Drag on desktop. Use arrows on a phone. Changes save when you let go.
          </p>
        </div>
      ) : null}

      {items.length === 0 ? (
        <p className="text-center text-sm text-muted">
          Buy a piece in the shop, or place a sample set to try moving things.
        </p>
      ) : null}
    </div>
  );
}
