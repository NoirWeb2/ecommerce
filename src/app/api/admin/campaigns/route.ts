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

  const campaigns = await prisma.emailCampaign.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ campaigns });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { name, subject, html, status, segment, scheduledAt } = body;

  if (!name || !subject) {
    return NextResponse.json({ error: "Nombre y asunto son requeridos" }, { status: 400 });
  }

  const campaign = await prisma.emailCampaign.create({
    data: {
      name,
      subject,
      htmlContent: html || "",
      status: status || "DRAFT",
      segment: segment || null,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    },
  });

  return NextResponse.json({ campaign }, { status: 201 });
}
