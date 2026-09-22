export const ROOM_COLS = 10;
export const ROOM_ROWS = 8;

export type PlacedFurniture = {
  id: string;
  name: string;
  category: string;
  imageKey: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};
