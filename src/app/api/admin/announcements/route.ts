import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.announcementBar.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(items);
  } catch (err) {
    console.error("[announcements GET]", err);
    return NextResponse.json({ error: "Error al obtener anuncios" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { text, link, isActive, order } = await req.json();
    if (!text) return NextResponse.json({ error: "text requerido" }, { status: 400 });

    const item = await prisma.announcementBar.create({
      data: { text, link: link || null, isActive: isActive ?? true, order: order ?? 0 },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error("[announcements POST]", err);
    return NextResponse.json({ error: "Error al crear anuncio" }, { status: 500 });
  }
}
