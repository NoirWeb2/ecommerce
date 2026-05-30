import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
const { pathname } = req.nextUrl;
const token = req.cookies.get("auth-token")?.value;

// 1. Verificamos y decodificamos el token (si existe)
let payload = null;
if (token) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "noir-lovers-secret");
    const decoded = await jwtVerify(token, secret);
    payload = decoded.payload;
  } catch (error) {
    payload = null;
  }
}

// =========================
// RUTAS DEL ADMINISTRADOR
// =========================
if (pathname.startsWith("/admin")) {
  
  if (pathname === "/admin/login") {
    if (payload && (payload.role === "ADMIN" || payload.role === "SUPER_ADMIN")) {
      const res = NextResponse.redirect(new URL("/admin", req.url));
      res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      return res;
    }
    const res = NextResponse.next();
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return res;
  }

  // Exigimos token válido Y que el rol sea ADMIN
  if (!payload || (payload.role !== "ADMIN" && payload.role !== "SUPER_ADMIN")) {
    const res = NextResponse.redirect(new URL("/admin/login", req.url));
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return res;
  }
}

// =========================
// RUTAS DE LA CUENTA DEL CLIENTE
// =========================
if (pathname.startsWith("/cuenta")) {
  if (!payload) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    const res = NextResponse.redirect(loginUrl);
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    return res;
  }
}

// 💡 BALA DE PLATA: Le prohibimos estrictamente a Vercel cachear estas rutas
const response = NextResponse.next();
if (pathname.startsWith("/admin") || pathname.startsWith("/cuenta")) {
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
}

return response;
}

// 💡 MATCHER CORREGIDO: Cubre exactamente /admin a secas y todo lo que esté adentro
export const config = {
matcher: ["/admin", "/admin/:path*", "/cuenta", "/cuenta/:path*"],
};