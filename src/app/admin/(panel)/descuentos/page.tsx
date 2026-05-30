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
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ coupons });
} catch (error) {
  return NextResponse.json({ coupons: [] });
}
}

export async function POST(req: NextRequest) {
const admin = await requireAdmin();
if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

try {
  const body = await req.json();
  const { code, type, value, maxUses, endDate, isActive } = body;

  const existing = await prisma.coupon.findUnique({ where: { code } });
  if (existing) return NextResponse.json({ error: "Este código ya existe" }, { status: 400 });

  const coupon = await prisma.coupon.create({
    data: {
      code,
      type,
      value: Number(value || 0),
      maxUses: maxUses ? Number(maxUses) : null,
      endDate: endDate ? new Date(endDate) : null,
      isActive: isActive ?? true,
    },
  });

  return NextResponse.json({ coupon }, { status: 201 });
} catch (error) {
  return NextResponse.json({ error: "Error interno" }, { status: 500 });
}
}