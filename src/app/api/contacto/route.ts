import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import nodemailer from "nodemailer";

const contactSchema = z.object({
  nombre: z.string().min(1),
  email: z.string().email(),
  mensaje: z.string().min(10),
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = contactSchema.parse(body);

    const transporter = getTransporter();
    const storeEmail = process.env.SMTP_FROM || process.env.SMTP_USER || "hello@noirlovers.com";

    if (transporter) {
      // Email al equipo NOIR LOVERS
      await transporter.sendMail({
        from: `NOIR LOVERS Web <${storeEmail}>`,
        to: storeEmail,
        replyTo: data.email,
        subject: `📩 Nuevo mensaje de ${data.nombre} — NOIR LOVERS`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#fafafa;">
            <h2 style="font-size:18px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:24px;">
              Nuevo mensaje de contacto
            </h2>
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #e5e5e5;font-size:11px;font-weight:700;text-transform:uppercase;color:#888;width:100px;">Nombre</td>
                <td style="padding:10px 0;border-bottom:1px solid #e5e5e5;font-size:14px;">${data.nombre}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #e5e5e5;font-size:11px;font-weight:700;text-transform:uppercase;color:#888;">Email</td>
                <td style="padding:10px 0;border-bottom:1px solid #e5e5e5;font-size:14px;"><a href="mailto:${data.email}" style="color:#0a0a0a;">${data.email}</a></td>
              </tr>
              <tr>
                <td style="padding:10px 0;font-size:11px;font-weight:700;text-transform:uppercase;color:#888;vertical-align:top;">Mensaje</td>
                <td style="padding:10px 0;font-size:14px;line-height:1.7;white-space:pre-wrap;">${data.mensaje}</td>
              </tr>
            </table>
            <p style="margin-top:32px;font-size:11px;color:#aaa;">Enviado desde el formulario de contacto de noirlovers.com</p>
          </div>
        `,
      });

      // Email de confirmación al cliente
      await transporter.sendMail({
        from: `NOIR LOVERS <${storeEmail}>`,
        to: data.email,
        subject: "Recibimos tu mensaje — NOIR LOVERS",
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px;background:#0a0a0a;color:#fafafa;">
            <h1 style="font-size:28px;font-weight:900;text-transform:uppercase;letter-spacing:-0.02em;margin-bottom:8px;">NOIR LOVERS</h1>
            <p style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.3em;margin-bottom:32px;">BOGOTÁ, COLOMBIA</p>
            <h2 style="font-size:16px;font-weight:700;margin-bottom:16px;">Hola ${data.nombre},</h2>
            <p style="font-size:14px;line-height:1.8;color:#ccc;">
              Recibimos tu mensaje y te responderemos en menos de 24 horas.<br>
              Si tu consulta es urgente puedes escribirnos directamente a <a href="mailto:${storeEmail}" style="color:#C9A84C;">${storeEmail}</a>
            </p>
            <div style="margin-top:32px;padding:20px;border:1px solid #333;font-size:13px;color:#999;line-height:1.7;">
              <strong style="color:#fafafa;">Tu mensaje:</strong><br><br>
              ${data.mensaje}
            </div>
            <p style="margin-top:40px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.1em;">El negro lo es todo. — Equipo NOIR LOVERS</p>
          </div>
        `,
      });
    } else {
      // Sin SMTP configurado: solo loguear
      console.log("[contacto] SMTP no configurado. Mensaje recibido:", data);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    console.error("[contacto]", error);
    return NextResponse.json({ error: "Error al enviar mensaje" }, { status: 500 });
  }
}
