import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function PATCH(req: NextRequest) {
try {
  // 1. Verificamos quién es el usuario
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const secret = new TextEncoder().encode(process.env.JWT_SECRET || "noir-lovers-secret");
  const { payload } = await jwtVerify(token, secret);
  const userId = payload.sub as string;

  // 2. Recibimos los datos
  const body = await req.json();
  const { firstName, lastName, phone, city } = body;

  // 3. Actualizamos al usuario en BD
  await prisma.user.update({
    where: { id: userId },
    data: { firstName, lastName, phone },
  });

  // 4. Si mandó ciudad, le creamos/actualizamos una dirección
  if (city) {
    const existingAddress = await prisma.address.findFirst({ where: { userId } });
    if (existingAddress) {
      await prisma.address.update({
        where: { id: existingAddress.id },
        data: { city },
      });
    } else {
      await prisma.address.create({
        data: {
          userId, city,
          firstName: firstName || "", lastName: lastName || "",
          address1: "Por definir", country: "CO"
        }
      });
    }
  }

  return NextResponse.json({ ok: true });
} catch (error) {
  console.error("Error al actualizar perfil:", error);
  return NextResponse.json({ error: "Error interno" }, { status: 500 });
}
}