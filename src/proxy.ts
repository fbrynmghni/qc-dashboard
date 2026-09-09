import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

const PUBLIC_ROUTES = new Set(["/login"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.has(pathname);
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const userId = verifySessionToken(token);

  if (!userId && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (userId && isPublicRoute) {
    return NextResponse.redirect(new URL("/inspections", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
