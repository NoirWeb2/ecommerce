import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import nodemailer from "nodemailer";
import { randomBytes } from "crypto";

const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || "465");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
}

async function sendVerificationEmail(email: string, firstName: string, token: string) {
  const transporter = getTransporter();
  if (!transporter) return;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://noirlovers.com";
  const verifyUrl = `${appUrl}/api/auth/verify-email?token=${token}`;
  const from = `NOIR LOVERS <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;
  await transporter.sendMail({
    from,
    to: email,
    subject: "Confirma tu correo — NOIR LOVERS",
    html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0a0a0a;color:#fafafa;padding:48px 32px;">
      <h1 style="font-size:26px;font-weight:900;letter-spacing:-0.02em;margin:0 0 4px;">NOIR LOVERS</h1>
      <p style="font-size:10px;letter-spacing:0.4em;text-transform:uppercase;color:#666;margin:0 0 40px;">BOGOTÁ, COLOMBIA</p>
      <h2 style="font-size:20px;font-weight:700;margin:0 0 12px;">Hola ${firstName},</h2>
      <p style="font-size:14px;line-height:1.8;color:#aaa;margin:0 0 32px;">
        Bienvenido a la comunidad NOIR LOVERS. Solo falta un paso: confirma tu correo electrónico para activar tu cuenta y recibir tu regalo de bienvenida.
      </p>
      <a href="${verifyUrl}" style="display:inline-block;background:#fafafa;color:#0a0a0a;text-decoration:none;padding:16px 40px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;">CONFIRMAR CORREO</a>
      <p style="font-size:12px;color:#555;margin-top:32px;line-height:1.7;">Este enlace expira en 24 horas.<br>Si no creaste una cuenta, ignora este mensaje.</p>
      <hr style="border:none;border-top:1px solid #222;margin:40px 0;" />
      <p style="font-size:10px;color:#444;text-transform:uppercase;letter-spacing:0.1em;">El negro lo es todo. — Equipo NOIR LOVERS</p>
    </div>`,
  });
}

async function sendWelcomeEmail(email: string, firstName: string) {
  const transporter = getTransporter();
  if (!transporter) return;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://noirlovers.com";
  const from = `NOIR LOVERS <${process.env.SMTP_FROM || process.env.SMTP_USER}>`;
  await transporter.sendMail({
    from,
    to: email,
    subject: "Bienvenido a la comunidad 🖤 + 10% de descuento",
    html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0a0a0a;color:#fafafa;padding:48px 32px;">
      <h1 style="font-size:26px;font-weight:900;letter-spacing:-0.02em;margin:0 0 4px;">NOIR LOVERS</h1>
      <p style="font-size:10px;letter-spacing:0.4em;text-transform:uppercase;color:#666;margin:0 0 40px;">BOGOTÁ, COLOMBIA</p>
      <h2 style="font-size:22px;font-weight:900;text-transform:uppercase;letter-spacing:-0.02em;line-height:1.2;margin:0 0 20px;">Bienvenido,<br>${firstName.toUpperCase()}.</h2>
      <p style="font-size:14px;line-height:1.8;color:#aaa;margin:0 0 32px;">
        Ya eres parte de la comunidad NOIR LOVERS. Hombres que entienden que el negro no necesita justificación.<br><br>
        Como regalo de bienvenida, tienes un <strong style="color:#C9A84C;">10% de descuento</strong> en tu primera compra.
      </p>
      <div style="border:1px solid #333;padding:24px;text-align:center;margin:0 0 32px;">
        <p style="font-size:10px;text-transform:uppercase;letter-spacing:0.3em;color:#666;margin:0 0 8px;">Tu cupón exclusivo</p>
        <p style="font-size:28px;font-weight:900;letter-spacing:0.15em;color:#C9A84C;margin:0 0 8px;">BIENVENIDA10</p>
        <p style="font-size:12px;color:#666;margin:0;">10% OFF · Válido en toda la tienda</p>
      </div>
      <a href="${appUrl}/tienda" style="display:inline-block;background:#fafafa;color:#0a0a0a;text-decoration:none;padding:16px 40px;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;">VER COLECCIÓN</a>
      <hr style="border:none;border-top:1px solid #222;margin:40px 0;" />
      <p style="font-size:10px;color:#444;text-transform:uppercase;letter-spacing:0.1em;">El negro lo es todo. — Equipo NOIR LOVERS</p>
    </div>`,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, password } = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Este email ya está registrado" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    await prisma.user.create({
      data: {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email,
        password: hashedPassword,
        role: "CUSTOMER",
      },
    });

    // Verification token (24h)
    const token = randomBytes(32).toString("hex");
    await prisma.verificationToken.create({
      data: { token, email, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    });

    // Send verification email (non-blocking)
    sendVerificationEmail(email, firstName, token).catch(console.error);

    return NextResponse.json({
      success: true,
      message: "Cuenta creada. Revisa tu correo para confirmar tu email.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
