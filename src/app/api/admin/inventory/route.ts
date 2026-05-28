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

  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      sku: true,
      variants: {
        select: { id: true, size: true, stock: true },
        orderBy: { size: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { productId, sizes } = await req.json();
  // sizes: Record<string, number> e.g. { XS: 3, S: 10, M: 15, ... }

  const allSizes = ["XS", "S", "M", "L", "XL", "XXL"];

  for (const size of allSizes) {
    const stock = sizes[size] ?? 0;
    const existing = await prisma.variant.findFirst({ where: { productId, size } });
    if (existing) {
      await prisma.variant.update({ where: { id: existing.id }, data: { stock } });
    } else if (stock > 0) {
      await prisma.variant.create({ data: { productId, size, stock } });
    }
  }

  return NextResponse.json({ ok: true });
}
