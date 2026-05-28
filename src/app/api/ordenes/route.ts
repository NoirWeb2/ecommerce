import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";
import { z } from "zod";

const orderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string().optional(),
    quantity: z.number().min(1),
    price: z.number(),
    name: z.string(),
    image: z.string().optional(),
    size: z.string().optional(),
  })),
  shippingAddress: z.object({
    firstName: z.string(),
    lastName: z.string(),
    address1: z.string(),
    city: z.string(),
    country: z.string().default("CO"),
    phone: z.string().optional(),
  }),
  couponCode: z.string().optional(),
  paymentMethod: z.enum(["STRIPE", "MERCADOPAGO", "PSE", "NEQUI", "BANCOLOMBIA", "COD"]),
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    const body = await req.json();
    const data = orderSchema.parse(body);

    const subtotal = data.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shipping = subtotal >= 250000 ? 0 : 15000;
    const total = subtotal + shipping;

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: user?.userId,
        email: data.email,
        subtotal,
        shipping,
        total,
        paymentMethod: data.paymentMethod,
        shippingAddress: data.shippingAddress,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            name: item.name,
            image: item.image,
            size: item.size,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ order });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos", details: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Error al crear la orden" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const orders = await prisma.order.findMany({
      where: { userId: user.userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error al obtener órdenes" }, { status: 500 });
  }
}
