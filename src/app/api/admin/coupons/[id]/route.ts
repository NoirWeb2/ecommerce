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
  
  const updateData: any = {};
  if (body.code !== undefined) updateData.code = body.code;
  if (body.type !== undefined) updateData.type = body.type;
  if (body.value !== undefined) updateData.value = Number(body.value || 0);
  if (body.maxUses !== undefined) updateData.maxUses = body.maxUses ? Number(body.maxUses) : null;
  if (body.endDate !== undefined) updateData.endDate = body.endDate ? new Date(body.endDate) : null;
  if (body.isActive !== undefined) updateData.isActive = body.isActive;

  const coupon = await prisma.coupon.update({
    where: { id },
    data: updateData,
  });
  return NextResponse.json({ coupon });
} catch (error) {
  return NextResponse.json({ error: "Error interno" }, { status: 500 });
}
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
const admin = await requireAdmin();
if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

try {
  const { id } = await params;
  await prisma.coupon.delete({ where: { id } });
  return NextResponse.json({ ok: true });
} catch (error) {
  return NextResponse.json({ error: "Error interno al borrar" }, { status: 500 });
}
}