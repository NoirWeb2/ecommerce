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
    // Si el token expiró, fue alterado o es inválido, lo ignoramos
    payload = null;
  }
}

// =========================
// RUTAS DEL ADMINISTRADOR
// =========================
if (pathname.startsWith("/admin")) {
  
  // Si están en la página de login del admin
  if (pathname === "/admin/login") {
    // Si ya están logueados Y son administradores, los pasamos directo al panel
    if (payload && (payload.role === "ADMIN" || payload.role === "SUPER_ADMIN")) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  // Para CUALQUIER OTRA ruta de /admin, exigimos que tengan token válido Y que el rol sea ADMIN
  if (!payload || (payload.role !== "ADMIN" && payload.role !== "SUPER_ADMIN")) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
}

// =========================
// RUTAS DE LA CUENTA DEL CLIENTE
// =========================
if (pathname.startsWith("/cuenta")) {
  // Si intentan entrar a /cuenta pero no hay token válido, al login de la tienda
  if (!payload) {
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