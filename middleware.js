import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/login"];

export function middleware(req) {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const sessionSecret = process.env.SESSION_SECRET;
  const cookie = req.cookies.get("dashboard_session");

  // No SESSION_SECRET configured means login can never succeed either —
  // fail closed rather than falling back to a guessable default.
  if (!sessionSecret || !cookie || cookie.value !== sessionSecret) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.png|logo.png).*)"],
};
