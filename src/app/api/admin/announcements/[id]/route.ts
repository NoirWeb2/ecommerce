import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    const item = await prisma.announcementBar.update({
      where: { id },
      data: {
        ...(data.text !== undefined && { text: data.text }),
        ...(data.link !== undefined && { link: data.link }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });
    return NextResponse.json(item);
  } catch (err) {
    console.error("[announcements PATCH]", err);
    return NextResponse.json({ error: "Error al actualizar anuncio" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.announcementBar.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[announcements DELETE]", err);
    return NextResponse.json({ error: "Error al eliminar anuncio" }, { status: 500 });
  }
}
