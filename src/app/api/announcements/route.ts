import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.announcementBar.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      select: { id: true, text: true, link: true },
    });
    return NextResponse.json(items, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
    });
  } catch {
    return NextResponse.json([]);
  }
}
