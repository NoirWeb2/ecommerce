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

export async function GET(req: NextRequest) {
const admin = await requireAdmin();
if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

try {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";

  const where: Record<string, unknown> = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }
  if (category && category !== "all") {
    where.category = { name: category };
  }

  const products = await prisma.product.findMany({
    where,
    include: {
      images: { orderBy: { order: "asc" } },
      category: true,
      variants: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
} catch (error) {
  console.error("Error cargando productos:", error);
  return NextResponse.json({ products: [] }); 
}
}

export async function POST(req: NextRequest) {
const admin = await requireAdmin();
if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

try {
  const body = await req.json();
  const { name, sku, price, stock, status, categoryName, description, images, isFeatured, isAddon, isNew, hasAddon } = body;

  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  let categoryId: string | undefined;
  if (categoryName) {
    const cat = await prisma.category.findFirst({ where: { name: categoryName } });
    if (cat) categoryId = cat.id;
  }

  const tags = [];
  if (isAddon) tags.push("ADDON");
  if (hasAddon) tags.push("HAS_ADDON");

  const product = await prisma.product.create({
    data: {
      name,
      slug: `${slug}-${Date.now()}`,
      sku,
      price: Number(price),
      status: status || "DRAFT",
      description,
      categoryId,
      isFeatured: isFeatured ?? false,
      isNew: isNew ?? false,
      isAddon: isAddon ?? false, // 👈 Ahora el switch SÍ se guarda en la base de datos
      tags: tags, 
      variants: {  // 👈 Ahora se crean siempre las 4 tallas por defecto
        create: [
          { size: "S", stock: 0 },
          { size: "M", stock: stock > 0 ? Number(stock) : 0 },
          { size: "L", stock: 0 },
          { size: "XL", stock: 0 }
        ]
      },
      images: images?.length
        ? { create: images.map((url: string, i: number) => ({ url, order: i })) }
        : undefined,
    },
    include: { images: true, category: true, variants: true },
  });

  return NextResponse.json({ product }, { status: 201 });
} catch (error) {
  console.error("Error creando producto:", error);
  return NextResponse.json({ error: "Error interno al guardar" }, { status: 500 });
}
}