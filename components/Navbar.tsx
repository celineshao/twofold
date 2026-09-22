import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { NavLinks } from "@/components/NavLinks";
import { getSignedInUser } from "@/lib/auth/session";

export async function Navbar() {
  const user = await getSignedInUser();

  return (
    <header className="sticky top-0 z-20 border-b border-blush/60 bg-cream/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href={user ? "/home" : "/"}
          className="flex items-center gap-2"
        >
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-rose text-sm text-white shadow-sm">
            ♥
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink">
            Twofold
          </span>
        </Link>

        <div className="hidden min-h-8 flex-1 items-center justify-center sm:flex">
          {user ? <NavLinks className="flex items-center gap-1" /> : null}
        </div>

        <div className="flex min-h-9 items-center justify-end gap-2">
          {user ? (
            <>
              <span className="hidden max-w-[10rem] truncate text-sm font-semibold text-muted sm:inline">
                {user.displayName}
              </span>
              <LogoutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-rose px-4 py-2 text-sm font-semibold text-white"
            >
              Log in
            </Link>
          )}
        </div>
      </div>

      {user ? (
        <NavLinks className="flex gap-1 overflow-x-auto px-4 pb-3 sm:hidden" />
      ) : null}
    </header>
  );
}
