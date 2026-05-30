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

const automations = await prisma.emailAutomation.findMany();
return NextResponse.json({ automations });
}

export async function PATCH(req: NextRequest) {
const admin = await requireAdmin();
if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

const body = await req.json();
const { type, name, subject, htmlContent, isActive } = body;

const automation = await prisma.emailAutomation.upsert({
  where: { type },
  update: { 
    subject: subject !== undefined ? subject : undefined,
    htmlContent: htmlContent !== undefined ? htmlContent : undefined,
    isActive: isActive !== undefined ? isActive : undefined,
  },
  create: {
    type,
    name: name || type,
    subject: subject || "Notificación de NOIR LOVERS",
    htmlContent: htmlContent || "",
    isActive: isActive || false,
  }
});

return NextResponse.json({ automation });
}