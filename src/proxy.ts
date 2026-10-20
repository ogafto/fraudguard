import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  if (!request.cookies.has("fg_session")) return NextResponse.redirect(new URL("/logowanie", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/panel/:path*", "/admin/:path*", "/podglad/:path*"],
};
