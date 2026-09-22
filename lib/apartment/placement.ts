import { ROOM_COLS, ROOM_ROWS } from "@/lib/apartment/grid";

export function rotatedFootprint(
  width: number,
  height: number,
  rotation: number,
) {
  const quarter = ((rotation % 360) + 360) % 360;
  if (quarter === 90 || quarter === 270) {
    return { w: height, h: width };
  }
  return { w: width, h: height };
}

export function clampToGrid(
  x: number,
  y: number,
  width: number,
  height: number,
  rotation: number,
  cols = ROOM_COLS,
  rows = ROOM_ROWS,
) {
  const { w, h } = rotatedFootprint(width, height, rotation);
  return {
    x: Math.min(Math.max(0, Math.round(x)), Math.max(0, cols - w)),
    y: Math.min(Math.max(0, Math.round(y)), Math.max(0, rows - h)),
  };
}

export function nextRotation(rotation: number) {
  return ((rotation + 90) % 360) as 0 | 90 | 180 | 270;
}
