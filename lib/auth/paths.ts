export const protectedPrefixes = [
  "/home",
  "/pair",
  "/apartment",
  "/games",
  "/shop",
];

export function isProtectedPath(pathname: string) {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isAuthPath(pathname: string) {
  return pathname === "/login" || pathname === "/signup";
}
