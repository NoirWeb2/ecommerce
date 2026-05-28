import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

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

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://noirlovers.com";

  if (!token) return NextResponse.redirect(new URL("/login?error=token_missing", appUrl));

  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record) return NextResponse.redirect(new URL("/login?error=token_invalid", appUrl));

  if (record.expiresAt < new Date()) {
    await prisma.verificationToken.delete({ where: { token } });
    return NextResponse.redirect(new URL("/login?error=token_expired", appUrl));
  }

  // Mark verified
  const user = await prisma.user.update({
    where: { email: record.email },
    data: { emailVerified: new Date() },
  });

  await prisma.verificationToken.delete({ where: { token } });

  // Assign welcome coupon to user
  const coupon = await prisma.coupon.findUnique({ where: { code: "BIENVENIDA10" } });
  if (coupon) {
    await prisma.userCoupon.upsert({
      where: { userId_couponId: { userId: user.id, couponId: coupon.id } },
      update: {},
      create: { userId: user.id, couponId: coupon.id },
    });
  }

  // Send welcome email (non-blocking)
  sendWelcomeEmail(record.email, user.firstName || user.name || "amigo").catch(console.error);

  return NextResponse.redirect(new URL("/login?verified=1", appUrl));
}
