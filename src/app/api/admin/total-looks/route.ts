export async function POST(req: NextRequest) {
try {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();

  // Validamos que realmente vengan los looks del frontend
  if (!body || !body.looks) {
    return NextResponse.json({ error: "Faltan los datos de los looks" }, { status: 400 });
  }

  // Upsert a la base de datos
  await prisma.siteSetting.upsert({
    where: { 
      // 👇 IMPORTANTE: Esto asume que en schema.prisma tienes @@unique([section, key])
      section_key: { section: "total-looks", key: "data" } 
    },
    update: { value: JSON.stringify(body.looks) },
    create: { section: "total-looks", key: "data", value: JSON.stringify(body.looks) }
  });

  return NextResponse.json({ ok: true });

} catch (error: any) {
  // 👇 ESTO ES CLAVE: Imprimirá en tu terminal de VS Code la razón exacta del fallo
  console.error("🔥 ERROR PRISMA AL GUARDAR TOTAL LOOKS:", error.message || error);
  return NextResponse.json({ error: "Error interno guardando en BD" }, { status: 500 });
}
}