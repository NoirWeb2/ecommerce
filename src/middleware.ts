import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Siempre redirigir /admin al login
  if (pathname === "/admin") {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // Proteger rutas internas del admin
  if (
    pathname.startsWith("/admin/") &&
    pathname !== "/admin/login"
  ) {
    const token = req.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.redirect(
        new URL("/admin/login", req.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};