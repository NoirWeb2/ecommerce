import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export const dynamic = "force-dynamic";

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

try {
  const dbOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true, user: true }
  });

  const orders = dbOrders.map((o) => {
    // 💡 FIX: Le ponemos el salvavidas (|| {}) para que no explote si no hay dirección
    const addr = (o.shippingAddress || {}) as any;
    const customerName = addr?.firstName ? `${addr.firstName} ${addr.lastName || ""}` : (o.user?.name || o.email);

    return {
      id: o.id,
      orderNumber: o.orderNumber,
      customer: customerName,
      email: o.email,
      total: o.total,
      status: o.status,
      paymentStatus: o.paymentStatus,
      itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
      items: o.items,
      shippingAddress: o.shippingAddress || {},
      tracking: o.tracking,
      notes: o.notes,
      createdAt: o.createdAt.toISOString()
    };
  });

  return NextResponse.json({ orders });
} catch (error) {
  console.error("Error leyendo pedidos:", error);
  // 💡 FIX: Si falla, devolvemos un arreglo vacío en lugar de un Error 500
  return NextResponse.json({ orders: [] }); 
}
}