import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { randomBytes } from "crypto";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "465");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host, port, secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { email, isAdmin } = await req.json();
    if (!email) return NextResponse.json({ error: "Email requerido" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    // Always return success to prevent email enumeration
    if (!user) return NextResponse.json({ success: true });

    const token = randomBytes(32).toString("hex");
    await prisma.verificationToken.upsert({
      where: { token },
      update: {},
      create: { token, email, expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) }, // 2h
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://noirlovers.com";
    const resetUrl = `${appUrl}/restablecer-contrasena?token=${token}`;
    const from = `NOIR LOVERS <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;

    const transporter = getTransporter();
    if (transporter) {
      const bgColor = isAdmin ? "#0a0a0a" : "#0a0a0a";
      await transporter.sendMail({
        from,
        to: email,
        subject: "Restablecer contraseña — NOIR LOVERS",
        html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:${bgColor};color:#fafafa;padding:48px 32px;">
          <h1 style="font-size:26px;font-weight:900;letter-spacing:-0.02em;margin:0 0 4px;">NOIR LOVERS</h1>
          <p style="font-size:10px;letter-spacing:0.4em;text-transform:uppercase;color:#666;margin:0 0 40px;">BOGOTÁ, COLOMBIA</p>
          <h2 style="font-size:18px;font-weight:700;margin:0 0 12px;">Restablecer contraseña</h2>
          <p style="font-size:14px;line-height:1.8;color:#aaa;margin:0 0 32px;">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta.<br>
            Haz clic en el botón para crear una nueva contraseña. Este enlace expira en 2 horas.
          </p>
          <a href="${resetUrl}" style="display:inline-block;background:#fafafa;color:#0a0a0a;text-decoration:none;padding:16px 40px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;">RESTABLECER CONTRASEÑA</a>
          <p style="font-size:12px;color:#555;margin-top:32px;line-height:1.7;">Si no solicitaste este cambio, ignora este mensaje.</p>
          <hr style="border:none;border-top:1px solid #222;margin:40px 0;" />
          <p style="font-size:10px;color:#444;text-transform:uppercase;letter-spacing:0.1em;">El negro lo es todo. — Equipo NOIR LOVERS</p>
        </div>`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
