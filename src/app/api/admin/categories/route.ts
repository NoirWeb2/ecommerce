import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

async function requireAdmin() {
const cookieStore = await cookies();
const token = cookieStore.get("auth-token")?.value;
if (!token) return null;
try {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || "noir-lovers-secret");
  const { payload } = await jwtVerify(token, secret);
  if (!["ADMIN", "SUPER_ADMIN"].includes(payload.role as string)) return null;
  return payload;
} catch {
  return null;
}
}

export async function GET() {
const admin = await requireAdmin();
if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

const categories = await prisma.category.findMany({
  include: { _count: { select: { products: true } } },
  orderBy: { order: "asc" },
});

return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
const admin = await requireAdmin();
if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

// 💡 NUEVO: Ahora también recibe "image"
const { name, image } = await req.json();
const slug = name
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9\s-]/g, "")
  .trim()
  .replace(/\s+/g, "-");

const existing = await prisma.category.findUnique({ where: { slug } });
if (existing) return NextResponse.json({ error: "Ya existe esa categoría" }, { status: 409 });

const category = await prisma.category.create({
  // 💡 NUEVO: Guarda la imagen en la base de datos
  data: { name, slug, image },
  include: { _count: { select: { products: true } } },
});

return NextResponse.json({ category }, { status: 201 });
}