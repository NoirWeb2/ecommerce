import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export const dynamic = "force-dynamic";

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

const products = await prisma.product.findMany({
  where: { status: { notIn: ["ARCHIVED"] } },
  include: { variants: true },
  orderBy: { createdAt: "desc" }
});

return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
const admin = await requireAdmin();
if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

const body = await req.json();
const { stock } = body; 

// Guardamos cada talla en la base de datos
for (const [productId, sizes] of Object.entries(stock)) {
  for (const [size, qty] of Object.entries(sizes as Record<string, number>)) {
    const existing = await prisma.variant.findFirst({ where: { productId, size } });
    if (existing) {
      if (existing.stock !== qty) {
        await prisma.variant.update({ where: { id: existing.id }, data: { stock: qty } });
      }
    } else {
      if (qty > 0) {
        await prisma.variant.create({ data: { productId, size, stock: qty } });
      }
    }
  }
}

return NextResponse.json({ ok: true });
}