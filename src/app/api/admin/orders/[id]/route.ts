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
const { status, tracking, notes } = body;

const updateData: any = {};
if (status !== undefined) updateData.status = status;
if (tracking !== undefined) updateData.tracking = tracking;
if (notes !== undefined) updateData.notes = notes;

try {
  const order = await prisma.order.update({
    where: { id },
    data: updateData,
  });
  return NextResponse.json({ order });
} catch (error) {
  console.error("Error actualizando pedido:", error);
  return NextResponse.json({ error: "Error interno" }, { status: 500 });
}
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
const admin = await requireAdmin();
if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

const { id } = await params;
try {
  await prisma.order.delete({ where: { id } });
  return NextResponse.json({ ok: true });
} catch (error) {
  console.error("Error borrando pedido:", error);
  return NextResponse.json({ error: "Error interno" }, { status: 500 });
}
}