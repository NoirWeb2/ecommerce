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

const setting = await prisma.siteSetting.findUnique({
  where: { section_key: { section: "total-looks", key: "data" } }
});

const looks = setting ? JSON.parse(setting.value) : [];
return NextResponse.json({ looks });
}

export async function POST(req: NextRequest) {
const admin = await requireAdmin();
if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

const body = await req.json();

await prisma.siteSetting.upsert({
  where: { section_key: { section: "total-looks", key: "data" } },
  update: { value: JSON.stringify(body.looks) },
  create: { section: "total-looks", key: "data", value: JSON.stringify(body.looks) }
});

return NextResponse.json({ ok: true });
}