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

try {
  const { id } = await params;
  const body = await req.json();
  
  const { name, sku, price, stock, status, categoryName, description, images, isFeatured, isAddon, isNew, hasAddon } = body;

  const updateData: Record<string, unknown> = {};

  if (name !== undefined) updateData.name = name;
  if (sku !== undefined) updateData.sku = sku;
  if (price !== undefined) updateData.price = Number(price);
  if (status !== undefined) updateData.status = status;
  if (description !== undefined) updateData.description = description;
  
  // 👇 AQUÍ ESTÁ LA MAGIA DE LOS SWITCHES
  if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
  if (isNew !== undefined) updateData.isNew = isNew;
  if (isAddon !== undefined) updateData.isAddon = isAddon; // ¡ESTO FALTABA!

  // Actualizamos las etiquetas (tags) para compatibilidad
  if (isAddon !== undefined || hasAddon !== undefined) {
    const tags = [];
    if (isAddon) tags.push("ADDON");
    if (hasAddon) tags.push("HAS_ADDON");
    updateData.tags = tags;
  }

  if (categoryName !== undefined) {
    if (categoryName === "" || categoryName === "— Sin categoría —") {
      updateData.categoryId = null;
    } else {
      const cat = await prisma.category.findFirst({ where: { name: categoryName } });
      if (cat) updateData.categoryId = cat.id;
    }
  }

  await prisma.product.update({
    where: { id },
    data: updateData,
  });

  // 👇 FIX ZOMBIE: Si actualizan el stock desde esta pantalla, se lo asignamos a la talla "M" en vez de "UNICO"
  if (stock !== undefined) {
    const existingM = await prisma.variant.findFirst({ where: { productId: id, size: "M" } });
    if (existingM) {
      await prisma.variant.update({ where: { id: existingM.id }, data: { stock: Number(stock) } });
    } else {
      // Por si acaso es un producto viejísimo que no tenía variantes, le creamos la M
      await prisma.variant.create({ data: { productId: id, size: "M", stock: Number(stock) } });
    }
  }

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
} catch (error) {
  console.error("Error al actualizar producto:", error);
  return NextResponse.json({ error: "Error interno al actualizar" }, { status: 500 });
}
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
const admin = await requireAdmin();
if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

try {
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
} catch (error) {
  console.error("Error al eliminar producto:", error);
  return NextResponse.json({ error: "Error interno al eliminar" }, { status: 500 });
}
}