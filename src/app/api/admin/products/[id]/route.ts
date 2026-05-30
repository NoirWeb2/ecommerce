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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
const admin = await requireAdmin();
if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

const { id } = await params;
const body = await req.json();
const { name, sku, price, stock, status, categoryName, description, images, isFeatured } = body;

const updateData: Record<string, unknown> = {};

if (name !== undefined) updateData.name = name;
if (sku !== undefined) updateData.sku = sku;
if (price !== undefined) updateData.price = Number(price);
if (status !== undefined) updateData.status = status;
if (description !== undefined) updateData.description = description;
if (isFeatured !== undefined) updateData.isFeatured = isFeatured;

// 💡 FIX EXACTO: Si envían categoría, revisamos bien qué enviaron
if (categoryName !== undefined) {
  if (categoryName === "" || categoryName === "— Sin categoría —") {
    updateData.categoryId = null; // Lo desvincula de cualquier categoría
  } else {
    const cat = await prisma.category.findFirst({ where: { name: categoryName } });
    if (cat) updateData.categoryId = cat.id;
  }
}

await prisma.product.update({
  where: { id },
  data: updateData,
});

// 💡 FIX STOCK: Actualiza el stock principal en la variante UNICO por defecto
if (stock !== undefined) {
  const existing = await prisma.variant.findFirst({ where: { productId: id, size: "UNICO" } });
  if (existing) {
    await prisma.variant.update({ where: { id: existing.id }, data: { stock: Number(stock) } });
  } else {
    await prisma.variant.create({ data: { productId: id, size: "UNICO", stock: Number(stock) } });
  }
}

// 💡 FIX IMÁGENES: Reemplaza todo de forma limpia
if (images !== undefined) {
  await prisma.productImage.deleteMany({ where: { productId: id } });
  if (images.length > 0) {
    await prisma.productImage.createMany({
      data: images.map((url: string, i: number) => ({ productId: id, url, order: i })),
    });
  }
}

const updated = await prisma.product.findUnique({
  where: { id },
  include: { images: { orderBy: { order: "asc" } }, category: true, variants: true },
});

return NextResponse.json({ product: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
const admin = await requireAdmin();
if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

const { id } = await params;
await prisma.product.delete({ where: { id } });
return NextResponse.json({ ok: true });
}