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
  const { name, subject, html, status, segment, scheduledAt, sentCount } = body;

  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (subject !== undefined) updateData.subject = subject;
  if (html !== undefined) updateData.htmlContent = html;
  if (status !== undefined) updateData.status = status;
  if (segment !== undefined) updateData.segment = segment || null;
  if (scheduledAt !== undefined) updateData.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
  if (sentCount !== undefined) updateData.sentCount = sentCount;
  if (status === "SENT") updateData.sentAt = new Date();

  const campaign = await prisma.emailCampaign.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({ campaign });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  await prisma.emailCampaign.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
