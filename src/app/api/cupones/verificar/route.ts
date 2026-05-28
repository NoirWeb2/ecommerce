import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { code, cartTotal } = await req.json();

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) return NextResponse.json({ error: "Cupón no encontrado" }, { status: 404 });
    if (!coupon.isActive) return NextResponse.json({ error: "Cupón inactivo" }, { status: 400 });
    if (coupon.endDate && new Date() > coupon.endDate) return NextResponse.json({ error: "Cupón expirado" }, { status: 400 });
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return NextResponse.json({ error: "Cupón agotado" }, { status: 400 });
    if (coupon.minCartValue && cartTotal < coupon.minCartValue) {
      return NextResponse.json({ error: `Mínimo de compra: $${coupon.minCartValue.toLocaleString("es-CO")}` }, { status: 400 });
    }

    let discount = 0;
    if (coupon.type === "PERCENTAGE") discount = (cartTotal * coupon.value) / 100;
    else if (coupon.type === "FIXED") discount = Math.min(coupon.value, cartTotal);
    else if (coupon.type === "FREE_SHIPPING") discount = 15000; // shipping cost

    return NextResponse.json({ coupon, discount });
  } catch {
    return NextResponse.json({ error: "Error al verificar cupón" }, { status: 500 });
  }
}
