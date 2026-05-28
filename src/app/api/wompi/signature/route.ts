import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { reference, amountInCents, currency = "COP" } = await req.json();

    if (!reference || !amountInCents) {
      return NextResponse.json(
        { error: "reference y amountInCents son requeridos" },
        { status: 400 }
      );
    }

    const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;
    if (!integritySecret) {
      return NextResponse.json(
        { error: "Clave de integridad no configurada" },
        { status: 500 }
      );
    }

    // Wompi integrity hash: SHA256(reference + amountInCents + currency + integritySecret)
    const cadena = `${reference}${amountInCents}${currency}${integritySecret}`;
    const hash = crypto.createHash("sha256").update(cadena).digest("hex");

    return NextResponse.json({ signature: hash });
  } catch {
    return NextResponse.json({ error: "Error generando firma" }, { status: 500 });
  }
}
