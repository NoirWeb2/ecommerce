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
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "noir-lovers-secret"
    );

    const { payload } = await jwtVerify(token, secret);

    if (!["ADMIN", "SUPER_ADMIN"].includes(payload.role as string)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function GET() {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  const settings = await prisma.siteSetting.findMany();

  const result: Record<string, Record<string, string>> = {};

  for (const s of settings) {
    if (!result[s.section]) {
      result[s.section] = {};
    }

    result[s.section][s.key] = s.value;
  }

  return NextResponse.json({ settings: result });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    const section = body.section;
    const fields = body.fields;

    if (!section || !Array.isArray(fields)) {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      );
    }

    for (const field of fields) {
      await prisma.siteSetting.upsert({
        where: {
          section_key: {
            section,
            key: field.key,
          },
        },
        create: {
          section,
          key: field.key,
          value: field.value,
        },
        update: {
          value: field.value,
        },
      });
    }

    // LIMPIAR CACHE DE NEXT
    revalidatePath("/");
    revalidatePath("/tienda");
    revalidatePath("/total-looks");
    revalidatePath("/nosotros");
    revalidatePath("/filosofia");

    return NextResponse.json({
      success: true,
      message: "Contenido actualizado",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}