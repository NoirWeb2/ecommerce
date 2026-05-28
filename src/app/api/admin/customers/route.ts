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

function getSegment(orderCount: number, totalSpent: number, lastOrderDate: Date | null): string {
  if (!lastOrderDate) return "INACTIVE";
  const daysSince = (Date.now() - new Date(lastOrderDate).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince > 180) return "INACTIVE";
  if (totalSpent >= 800000 || orderCount >= 4) return "VIP";
  if (orderCount >= 2) return "FREQUENT";
  if (orderCount === 1) return "NEW";
  return "INACTIVE";
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const users = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      orders: {
        select: { total: true, createdAt: true, status: true },
        orderBy: { createdAt: "desc" },
      },
      addresses: { take: 1, where: { isDefault: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const customers = users.map((u) => {
    const completedOrders = u.orders.filter((o) =>
      !["CANCELLED", "REFUNDED"].includes(o.status)
    );
    const totalSpent = completedOrders.reduce((sum, o) => sum + o.total, 0);
    const lastOrder = u.orders[0]?.createdAt ?? null;
    const city = u.addresses[0]?.city ?? "";

    return {
      id: u.id,
      name: u.name ?? (`${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.email),
      email: u.email,
      phone: u.phone ?? "",
      orders: completedOrders.length,
      total: totalSpent,
      segment: getSegment(completedOrders.length, totalSpent, lastOrder),
      lastPurchase: lastOrder ? new Date(lastOrder).toISOString().split("T")[0] : null,
      city,
      createdAt: u.createdAt,
    };
  });

  return NextResponse.json({ customers });
}
