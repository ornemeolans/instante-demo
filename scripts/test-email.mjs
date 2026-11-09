// Prueba la configuración SMTP de .env.local enviando un correo de prueba.
//   npm run test:email -- tu-correo@gmail.com
import nodemailer from "nodemailer";

const to = process.argv[2];
const { SMTP_HOST, SMTP_PORT = "465", SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;

if (!to) {
  console.error("Indicá el destinatario: npm run test:email -- tu-correo@gmail.com");
  process.exit(1);
}
if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.error("Faltan SMTP_HOST, SMTP_USER o SMTP_PASS en .env.local");
  process.exit(1);
}

const port = Number(SMTP_PORT);
const transport = nodemailer.createTransport({
  host: SMTP_HOST,
  port,
  secure: port === 465,
  auth: { user: SMTP_USER, pass: SMTP_PASS.replace(/\s+/g, "") },
});

try {
  await transport.verify();
  console.log("✔ Conexión SMTP correcta");
  const info = await transport.sendMail({
    from: EMAIL_FROM || SMTP_USER,
    to,
    subject: "Prueba de correo · Fotoventa",
    text: "Si recibís esto, el envío de enlaces de descarga ya funciona.",
  });
  console.log("✔ Correo enviado a", to, "| id:", info.messageId);
} catch (err) {
  console.error("✘ Error:", err.message);
  if (/Invalid login|535|Username and Password/i.test(err.message)) {
    console.error("  → Revisá SMTP_USER y que SMTP_PASS sea una CONTRASEÑA DE APLICACIÓN (16 letras).");
  }
  process.exit(1);
}
