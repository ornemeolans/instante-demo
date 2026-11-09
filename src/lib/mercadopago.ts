import "server-only";

import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

function config() {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) throw new Error("Falta MP_ACCESS_TOKEN");
  return new MercadoPagoConfig({ accessToken, options: { timeout: 10_000 } });
}

export const mpPreference = () => new Preference(config());
export const mpPayment = () => new Payment(config());

export function appUrl(): string {
  const url = process.env.APP_URL;
  if (!url) throw new Error("Falta APP_URL");
  return url.replace(/\/$/, "");
}

/** Mercado Pago solo acepta notification_url y auto_return con URLs públicas https. */
export const isPublicHttps = (url: string) => url.startsWith("https://");
