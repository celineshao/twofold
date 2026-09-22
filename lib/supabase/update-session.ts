import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAuthPath, isProtectedPath } from "@/lib/auth/paths";
import { getSupabaseEnv } from "@/lib/supabase/env";

/**
 * Refresh the Auth session on each matched request and write cookies
 * onto the response. Required for cookie-based SSR auth.
 */
export async function updateSession(request: NextRequest) {
  const env = getSupabaseEnv();

  if (!env) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });

        Object.entries(headers).forEach(([key, value]) => {
          supabaseResponse.headers.set(key, value);
        });
      },
    },
  });

  // Do not add logic between createServerClient and getClaims().
  // getClaims() verifies the JWT; do not use getSession() here.
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;
  const { pathname } = request.nextUrl;

  const redirectWithSession = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    url.search = "";
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  };

  if (!userId && isProtectedPath(pathname)) {
    return redirectWithSession("/login");
  }

  if (userId && isAuthPath(pathname)) {
    const { data: membership } = await supabase
      .from("couple_members")
      .select("couple_id")
      .eq("user_id", String(userId))
      .maybeSingle();

    if (!membership) {
      return redirectWithSession("/pair");
    }

    const { count } = await supabase
      .from("couple_members")
      .select("*", { count: "exact", head: true })
      .eq("couple_id", membership.couple_id);

    return redirectWithSession(count && count >= 2 ? "/home" : "/pair");
  }

  return supabaseResponse;
}
