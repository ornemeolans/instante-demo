import "server-only";

import nodemailer from "nodemailer";
import { formatMoney } from "@/lib/format";
import type { Order } from "@/lib/types";

function transport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) throw new Error("Faltan variables SMTP_*");
  const port = Number(SMTP_PORT ?? 465);
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS.replace(/\s+/g, "") }, // Gmail muestra la clave con espacios
  });
}

const esc = (s: string) =>
  s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function sendDownloadEmail(order: Order, downloadUrl: string, expiresAt: number) {
  const hours = Math.round((expiresAt - Date.now()) / 3_600_000);
  const n = order.items.length;
  const subject = `Tus fotos de ${order.eventTitle} están listas`;

  const text = [
    `¡Hola ${order.buyerName}!`,
    ``,
    `Recibimos tu pago de ${formatMoney(order.total)} por ${n} foto${n > 1 ? "s" : ""} de "${order.eventTitle}".`,
    `Descargalas desde este enlace (vale ${hours} horas):`,
    downloadUrl,
    ``,
    `Si el enlace vence, respondé este correo y te mandamos uno nuevo.`,
  ].join("\n");

  const html = `
  <div style="font-family:system-ui,Segoe UI,Roboto,sans-serif;max-width:520px;margin:auto;color:#1c1917">
    <h2 style="margin:0 0 12px">¡Tus fotos están listas!</h2>
    <p>Hola ${esc(order.buyerName)}, recibimos tu pago de <strong>${formatMoney(order.total)}</strong>
       por ${n} foto${n > 1 ? "s" : ""} de <strong>${esc(order.eventTitle)}</strong>.</p>
    <p style="margin:24px 0">
      <a href="${esc(downloadUrl)}" style="background:#1d4ed8;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">
        Descargar mis fotos
      </a>
    </p>
    <p style="color:#78716c;font-size:14px">El enlace vence en ${hours} horas. Las fotos se descargan en alta resolución y sin marca de agua.</p>
  </div>`;

  // Modo prueba: sin SMTP configurado y fuera de producción, el "correo" se
  // muestra en la terminal de `npm run dev` en lugar de enviarse.
  const smtpReady = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  if (!smtpReady && process.env.NODE_ENV !== "production") {
    console.log(`\n📧 [correo de prueba] Para: ${order.buyerEmail}\n   ${subject}\n   Enlace: ${downloadUrl}\n   (también guardado en dev-emails.log)\n`);
    // La terminal corta los enlaces largos en dos renglones: en el archivo quedan enteros.
    const { appendFile } = await import("node:fs/promises");
    await appendFile(
      "dev-emails.log",
      `[${new Date().toLocaleString("es-AR")}] Para: ${order.buyerEmail} | ${subject}\n${downloadUrl}\n\n`,
    ).catch(() => {});
    return;
  }

  await transport().sendMail({
    from: process.env.EMAIL_FROM ?? process.env.SMTP_USER,
    to: order.buyerEmail,
    subject,
    text,
    html,
  });
}
