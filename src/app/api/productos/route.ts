import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("categoria");
    const featured = searchParams.get("destacado");
    const isNew = searchParams.get("nuevo");
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");

    const where: Record<string, unknown> = { status: "ACTIVE" };
    if (category) where.category = { slug: category };
    if (featured === "true") where.isFeatured = true;
    if (isNew === "true") where.isNew = true;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { order: "asc" } },
          variants: true,
          category: true,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({ products, total, page, limit });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 });
  }
}
