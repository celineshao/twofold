import { cn } from "@/lib/cn";
import {
  colorOf,
  HAIR_COLORS,
  PANTS,
  SHIRTS,
  SKIN_TONES,
  type AvatarFacing,
  type AvatarLook,
  type AvatarPose,
} from "@/lib/avatar/look";

type AvatarFigureProps = {
  look: AvatarLook;
  pose?: AvatarPose;
  facing?: AvatarFacing;
  size?: "sm" | "md" | "lg";
  name?: string;
  className?: string;
};

const sizes = {
  sm: "h-16 w-12",
  md: "h-[5.5rem] w-16",
  lg: "h-48 w-36",
};

export function AvatarFigure({
  look,
  pose = "idle",
  facing = "right",
  size = "md",
  name,
  className,
}: AvatarFigureProps) {
  const skin = colorOf(SKIN_TONES, look.skin);
  const hair = colorOf(HAIR_COLORS, look.hairColor);
  const shirt = colorOf(SHIRTS, look.shirt);
  const pants = colorOf(PANTS, look.pants);
  const sitting = pose === "sit";

  return (
    <div
      className={cn("flex flex-col items-center", className)}
      data-pose={pose}
      data-facing={facing}
    >
      <div
        className={cn(
          "relative",
          sizes[size],
          facing === "left" ? "-scale-x-100" : "",
        )}
      >
        <div className="absolute inset-x-[18%] bottom-[4%] h-[10%] rounded-full bg-[#b08968]/35" />

        <div
          className={cn(
            "absolute inset-x-0 top-0 h-full",
            pose === "walk" ? "avatar-walk" : "",
            sitting ? "avatar-sit" : "",
          )}
        >
          {look.hair === "pony" ? (
            <div
              className="absolute left-[58%] top-[18%] h-[22%] w-[22%] rounded-full"
              style={{ background: hair }}
            />
          ) : null}

          <div
            className="avatar-leg avatar-leg-left absolute bottom-[8%] left-[30%] h-[28%] w-[14%] rounded-full"
            style={{ background: pants }}
          />
          <div
            className="avatar-leg avatar-leg-right absolute bottom-[8%] right-[30%] h-[28%] w-[14%] rounded-full"
            style={{ background: pants }}
          />

          <div
            className="absolute left-[24%] top-[42%] h-[32%] w-[52%] rounded-[1.1rem]"
            style={{ background: shirt }}
          />
          <div
            className="absolute left-[16%] top-[46%] h-[10%] w-[16%] rounded-full"
            style={{ background: shirt }}
          />
          <div
            className="absolute right-[16%] top-[46%] h-[10%] w-[16%] rounded-full"
            style={{ background: shirt }}
          />

          <div
            className="absolute left-1/2 top-[16%] h-[32%] w-[42%] -translate-x-1/2 rounded-[1.35rem]"
            style={{ background: skin }}
          >
            <div className="absolute left-[24%] top-[42%] h-[9%] w-[9%] rounded-full bg-[#3d2c28]" />
            <div className="absolute right-[24%] top-[42%] h-[9%] w-[9%] rounded-full bg-[#3d2c28]" />
            <div className="absolute bottom-[22%] left-1/2 h-[8%] w-[22%] -translate-x-1/2 rounded-full bg-[#d6767e]/70" />
          </div>

          <Hair look={look} color={hair} />
          <Accessory look={look} skin={skin} />
        </div>
      </div>
      {name ? (
        <p className="mt-1 max-w-[6.5rem] truncate text-center text-[11px] font-semibold text-ink">
          {name}
        </p>
      ) : null}
    </div>
  );
}

function Hair({ look, color }: { look: AvatarLook; color: string }) {
  if (look.hair === "bun") {
    return (
      <>
        <div
          className="absolute left-1/2 top-[8%] h-[16%] w-[22%] -translate-x-1/2 rounded-full"
          style={{ background: color }}
        />
        <div
          className="absolute left-1/2 top-[12%] h-[18%] w-[46%] -translate-x-1/2 rounded-t-[1.4rem]"
          style={{ background: color }}
        />
      </>
    );
  }

  if (look.hair === "curly") {
    return (
      <>
        <div
          className="absolute left-[16%] top-[10%] h-[22%] w-[28%] rounded-full"
          style={{ background: color }}
        />
        <div
          className="absolute right-[16%] top-[10%] h-[22%] w-[28%] rounded-full"
          style={{ background: color }}
        />
        <div
          className="absolute left-1/2 top-[8%] h-[16%] w-[36%] -translate-x-1/2 rounded-full"
          style={{ background: color }}
        />
      </>
    );
  }

  if (look.hair === "wavy") {
    return (
      <>
        <div
          className="absolute left-1/2 top-[10%] h-[18%] w-[50%] -translate-x-1/2 rounded-t-[1.5rem]"
          style={{ background: color }}
        />
        <div
          className="absolute left-[18%] top-[22%] h-[24%] w-[16%] rounded-full"
          style={{ background: color }}
        />
        <div
          className="absolute right-[18%] top-[22%] h-[24%] w-[16%] rounded-full"
          style={{ background: color }}
        />
      </>
    );
  }

  if (look.hair === "pony") {
    return (
      <div
        className="absolute left-1/2 top-[10%] h-[16%] w-[46%] -translate-x-1/2 rounded-t-[1.4rem]"
        style={{ background: color }}
      />
    );
  }

  return (
    <div
      className="absolute left-1/2 top-[11%] h-[14%] w-[44%] -translate-x-1/2 rounded-t-[1.2rem]"
      style={{ background: color }}
    />
  );
}

function Accessory({ look, skin }: { look: AvatarLook; skin: string }) {
  if (look.accessory === "glasses") {
    return (
      <>
        <div className="absolute left-[32%] top-[27%] h-[8%] w-[14%] rounded-full ring-2 ring-[#3d2c28]" />
        <div className="absolute right-[32%] top-[27%] h-[8%] w-[14%] rounded-full ring-2 ring-[#3d2c28]" />
        <div className="absolute left-1/2 top-[29%] h-[2%] w-[8%] -translate-x-1/2 bg-[#3d2c28]" />
      </>
    );
  }

  if (look.accessory === "bow") {
    return (
      <div className="absolute left-[58%] top-[8%] h-[10%] w-[16%] -rotate-12 rounded-full bg-rose" />
    );
  }

  if (look.accessory === "flower") {
    return (
      <div className="absolute right-[22%] top-[12%] grid h-[12%] w-[12%] place-items-center rounded-full bg-peach text-[0.55em] leading-none">
        ✿
      </div>
    );
  }

  if (look.accessory === "earring") {
    return (
      <div
        className="absolute right-[26%] top-[34%] h-[6%] w-[6%] rounded-full bg-[#e2c16b] ring-1 ring-[#fff6ee]"
        style={{ boxShadow: `0 0 0 1px ${skin}` }}
      />
    );
  }

  return null;
}
