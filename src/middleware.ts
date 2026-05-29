import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Read auth cookie
  const token = req.cookies.get("auth-token")?.value;

  // =========================
  // ADMIN ROUTES
  // =========================

  if (pathname.startsWith("/admin")) {
    // Allow login page
    if (pathname === "/admin/login") {
      // If already logged in -> redirect to admin
      if (token) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }

      return NextResponse.next();
    }

    // Any other admin route requires auth
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  // =========================
  // CUSTOMER ACCOUNT ROUTES
  // =========================

  if (pathname.startsWith("/cuenta")) {
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);

      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/cuenta/:path*"],
};