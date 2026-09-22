export type FurnitureCategory = "bed" | "seating" | "decor" | "plant" | "floor";

export type GameType = "this_or_that" | "how_well";

export type SessionStatus = "waiting" | "playing" | "finished" | "abandoned";

export type Profile = {
  id: string;
  display_name: string;
  avatar: string | null;
  created_at: string;
};

export type Couple = {
  id: string;
  invite_code: string;
  created_at: string;
};

export type CoupleMember = {
  couple_id: string;
  user_id: string;
  joined_at: string;
};

export type Apartment = {
  id: string;
  couple_id: string;
  hearts: number;
  created_at: string;
};

export type FurnitureCatalogItem = {
  id: string;
  name: string;
  category: FurnitureCategory;
  image_key: string;
  price: number;
  width: number;
  height: number;
};

export type ApartmentItem = {
  id: string;
  apartment_id: string;
  furniture_id: string;
  x: number;
  y: number;
  rotation: 0 | 90 | 180 | 270;
  placed_by: string;
  created_at: string;
};

export type GameSession = {
  id: string;
  couple_id: string;
  game_type: GameType;
  status: SessionStatus;
  current_round: number;
  player1_score: number;
  player2_score: number;
  created_at: string;
};

export type GameAnswer = {
  id: string;
  session_id: string;
  round_number: number;
  user_id: string;
  answer: string;
  created_at: string;
};
