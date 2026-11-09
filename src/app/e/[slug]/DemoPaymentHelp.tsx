"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const BUYER_USER = process.env.NEXT_PUBLIC_DEMO_MP_BUYER_USER;
const BUYER_PASS = process.env.NEXT_PUBLIC_DEMO_MP_BUYER_PASS;
// Código que Mercado Pago pide al iniciar sesión con un usuario de prueba:
// los últimos 6 dígitos del ID de usuario de esa cuenta.
const BUYER_CODE = process.env.NEXT_PUBLIC_DEMO_MP_BUYER_CODE;

// Tarjetas de prueba públicas de Mercado Pago Argentina (no son tarjetas reales).
const CARDS = [
  { brand: "Visa", number: "4509 9535 6623 3704" },
  { brand: "Mastercard", number: "5031 7557 3453 0604" },
];

function Copy({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      className="link-btn"
      onClick={() => {
        navigator.clipboard?.writeText(text.replace(/\s/g, "")).then(() => {
          setOk(true);
          setTimeout(() => setOk(false), 1200);
        });
      }}
    >
      {ok ? "copiado" : "copiar"}
    </button>
  );
}

/** Instrucciones para pagar en el sandbox de Mercado Pago (solo en modo demo). */
export function DemoPaymentHelp() {
  return (
    <details className="demo-help" open>
      <summary>
        Cómo pagar en esta demo <ChevronDown aria-hidden />
      </summary>
      <ol>
        {BUYER_USER && BUYER_PASS ? (
          <li>
            En Mercado Pago, iniciá sesión con la <strong>cuenta compradora de prueba</strong>:
            <br />
            Usuario <code>{BUYER_USER}</code> <Copy text={BUYER_USER} /> · Contraseña{" "}
            <code>{BUYER_PASS}</code> <Copy text={BUYER_PASS} />
            {BUYER_CODE && (
              <>
                <br />
                Si te pide un código de verificación: <code>{BUYER_CODE}</code> <Copy text={BUYER_CODE} />
              </>
            )}
          </li>
        ) : (
          <li>En Mercado Pago, iniciá sesión con una cuenta compradora de prueba.</li>
        )}
        <li>
          Pagá con tarjeta de prueba:
          {CARDS.map((c) => (
            <span key={c.number} className="demo-card">
              {c.brand} <code>{c.number}</code> <Copy text={c.number} />
            </span>
          ))}
          CVV <code>123</code> · vencimiento <code>11/30</code> · titular <code>APRO</code> (aprobado) ·
          DNI <code>12345678</code>
        </li>
        <li>Al terminar te llega un correo con el enlace de descarga del original.</li>
      </ol>
      <p className="small" style={{ color: "var(--ink-soft)" }}>
        Ningún pago es real: es el modo de prueba de Mercado Pago.
        {!BUYER_CODE && " Si pide un código de verificación, son los últimos 6 dígitos del ID de usuario de la cuenta de prueba."}
      </p>
    </details>
  );
}
