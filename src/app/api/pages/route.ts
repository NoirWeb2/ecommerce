import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  const section = searchParams.get("section");

  if (!key || !section) {
    return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
  }

  const setting = await prisma.siteSetting.findUnique({
    where: { section_key: { section, key } },
  });

  if (!setting) return NextResponse.json({ data: null });

  try {
    return NextResponse.json({ data: JSON.parse(setting.value) });
  } catch {
    return NextResponse.json({ data: setting.value });
  }
}