import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { subject, html, segment, name, testEmail } = await req.json();

    if (!subject || !html) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: subject, html" },
        { status: 400 }
      );
    }

    const transporter = getTransporter();

    if (!transporter) {
      return NextResponse.json(
        {
          error:
            "SMTP no configurado. Agrega SMTP_HOST, SMTP_USER y SMTP_PASS en las variables de entorno.",
        },
        { status: 503 }
      );
    }

    // Verify connection
    await transporter.verify();

    const fromAddress = `NOIR LOVERS <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;

    // If testEmail provided, send only to that address
    // Otherwise send to STORE_EMAIL (in production you'd query your DB for real subscribers)
    const toAddress = testEmail || process.env.STORE_EMAIL || process.env.SMTP_USER;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: toAddress,
      subject,
      html,
      headers: {
        "X-Campaign-Name": name || "campaign",
        "X-Campaign-Segment": segment || "all",
      },
    });

    return NextResponse.json({
      ok: true,
      messageId: info.messageId,
      message: `Email enviado correctamente a ${toAddress}`,
    });
  } catch (err) {
    console.error("[marketing/send]", err);
    const message = err instanceof Error ? err.message : "Error interno del servidor";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
