import type { AvatarFacing, AvatarLook, AvatarPose } from "@/lib/avatar/look";

export type RoomPerson = {
  id: string;
  name: string;
  look: AvatarLook;
  self: boolean;
};

export const AVATAR_SPOTS: Record<
  "self" | "partner",
  { left: string; top: string; facing: AvatarFacing; pose: AvatarPose }
> = {
  self: { left: "16%", top: "56%", facing: "right", pose: "idle" },
  partner: { left: "70%", top: "50%", facing: "left", pose: "idle" },
};
