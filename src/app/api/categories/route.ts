import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 🚀 Bala de plata contra el caché
export const dynamic = "force-dynamic";

export async function GET() {
try {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" }, // O order: "asc" si tienes ese campo
    include: {
      _count: { select: { products: true } }
    }
  });

  return NextResponse.json({ categories });
} catch (error) {
  console.error("Error cargando categorías:", error);
  return NextResponse.json({ error: "Error interno" }, { status: 500 });
}
}