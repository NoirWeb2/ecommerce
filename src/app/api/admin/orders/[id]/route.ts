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

  const updateData: Record<string, unknown> = {};
  if (status) updateData.status = status;
  if (tracking !== undefined) updateData.tracking = tracking;
  if (notes !== undefined) updateData.notes = notes;

  // Set timestamps automatically
  if (status === "SHIPPED") updateData.shippedAt = new Date();
  if (status === "DELIVERED") updateData.deliveredAt = new Date();

  const order = await prisma.order.update({
    where: { id },
    data: updateData,
    include: {
      items: {
        include: {
          product: { select: { name: true, images: { take: 1, orderBy: { order: "asc" } } } },
        },
      },
      user: { select: { name: true, firstName: true, lastName: true, email: true } },
    },
  });

  return NextResponse.json({ order });
}
