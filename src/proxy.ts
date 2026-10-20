import { NextResponse, type NextRequest } from "next/server";

// Optimistic check only: without a session cookie there is no point rendering the dashboards.
// The real check (valid session, admin role) happens in DashGuard on the server.
export function proxy(request: NextRequest) {
  if (!request.cookies.has("fg_session")) return NextResponse.redirect(new URL("/logowanie", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/panel/:path*", "/admin/:path*"],
};
