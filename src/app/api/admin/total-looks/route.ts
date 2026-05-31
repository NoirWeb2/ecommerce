import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export const dynamic = "force-dynamic";

// 1. Verificación de Administrador
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

// 2. Traer los Total Looks
export async function GET() {
const admin = await requireAdmin();
if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

const setting = await prisma.siteSetting.findUnique({
  where: { section_key: { section: "total-looks", key: "data" } }
});

const looks = setting ? JSON.parse(setting.value) : [];
return NextResponse.json({ looks });
}

// 3. Guardar los Total Looks (El que tenía el error de guardado)
export async function POST(req: NextRequest) {
try {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();

  if (!body || !body.looks) {
    return NextResponse.json({ error: "Faltan los datos de los looks" }, { status: 400 });
  }

  await prisma.siteSetting.upsert({
    where: { section_key: { section: "total-looks", key: "data" } },
    update: { value: JSON.stringify(body.looks) },
    create: { section: "total-looks", key: "data", value: JSON.stringify(body.looks) }
  });

  return NextResponse.json({ ok: true });

} catch (error: any) {
  console.error("🔥 ERROR PRISMA AL GUARDAR TOTAL LOOKS:", error.message || error);
  return NextResponse.json({ error: "Error interno guardando en BD" }, { status: 500 });
}
}