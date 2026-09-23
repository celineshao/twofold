import { AvatarFigure } from "@/components/avatar/AvatarFigure";
import { AVATAR_SPOTS, type RoomPerson } from "@/lib/avatar/spots";

export function ApartmentPeople({ people }: { people: RoomPerson[] }) {
  return (
    <>
      {people.map((person) => {
        const spot = person.self ? AVATAR_SPOTS.self : AVATAR_SPOTS.partner;
        return (
          <div
            key={person.id}
            className="pointer-events-none absolute z-[200] flex w-[18%] justify-center sm:w-[14%]"
            style={{ left: spot.left, top: spot.top }}
          >
            <AvatarFigure
              look={person.look}
              pose={spot.pose}
              facing={spot.facing}
              size="md"
              name={person.self ? "You" : person.name}
            />
          </div>
        );
      })}
    </>
  );
}
