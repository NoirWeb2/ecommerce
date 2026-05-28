import { NextResponse } from "next/server";
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

  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          product: { select: { name: true, images: { take: 1, orderBy: { order: "asc" } } } },
        },
      },
      user: { select: { name: true, firstName: true, lastName: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const formatted = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customer: o.user
      ? (o.user.name ?? (`${o.user.firstName ?? ""} ${o.user.lastName ?? ""}`.trim() || o.email))
      : o.email,
    email: o.email,
    total: o.total,
    status: o.status,
    paymentStatus: o.paymentStatus,
    itemCount: o.items.length,
    items: o.items,
    shippingAddress: o.shippingAddress,
    tracking: o.tracking,
    notes: o.notes,
    createdAt: o.createdAt,
    shippedAt: o.shippedAt,
    deliveredAt: o.deliveredAt,
  }));

  return NextResponse.json({ orders: formatted });
}
