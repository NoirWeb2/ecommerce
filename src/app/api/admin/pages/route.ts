import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { revalidatePath } from "next/cache";

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

// GET /api/admin/pages — fetch all page content from SiteSetting
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const settings = await prisma.siteSetting.findMany({
    where: { section: { in: ["banners", "texts", "header", "footer", "filosofia", "contacto", "seo"] } },
  });

  const result: Record<string, Record<string, string>> = {};
  for (const s of settings) {
    if (!result[s.section]) result[s.section] = {};
    result[s.section][s.key] = s.value;
  }
  return NextResponse.json({ data: result });
}

// POST /api/admin/pages — save page content and revalidate frontend
export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  // body: { section: string, data: Record<string, string> }
  const { section, data } = body as { section: string; data: Record<string, string> };

  if (!section || !data) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }

  // Upsert all fields for this section
  for (const [key, value] of Object.entries(data)) {
    await prisma.siteSetting.upsert({
      where: { section_key: { section, key } },
      create: { section, key, value: String(value) },
      update: { value: String(value) },
    });
  }

  // Revalidate all store pages so changes appear immediately
  revalidatePath("/");
  revalidatePath("/tienda");
  revalidatePath("/nosotros");
  revalidatePath("/filosofia");
  revalidatePath("/contacto");

  return NextResponse.json({ ok: true });
}
