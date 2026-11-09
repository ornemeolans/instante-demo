import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { db } from "@/lib/firebase/admin";
import { sendDownloadEmail } from "@/lib/email";
import { appUrl, mpPayment } from "@/lib/mercadopago";
import type { Order } from "@/lib/types";

const CLAIM_TTL_MS = 2 * 60 * 1000;

export const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

function linkHours(): number {
  const h = Number(process.env.DOWNLOAD_LINK_HOURS ?? 48);
  // 24–48 h según el requisito; las URLs firmadas V4 admiten hasta 7 días.
  return Math.min(Math.max(Number.isFinite(h) ? h : 48, 24), 48);
}

export type FulfillResult =
  | { state: "paid"; order: Order }
  | { state: "pending" | "rejected" | "unknown"; order: Order | null };

/**
 * Punto único de entrega. Lo llaman el webhook y la página de retorno, y es
 * idempotente: se puede ejecutar N veces para el mismo pago.
 *
 *  1. Consulta el pago a la API de Mercado Pago (nunca confía en el body
 *     del webhook ni en los parámetros de la URL de retorno).
 *  2. Si está aprobado y el monto coincide, marca el pedido como pagado.
 *  3. Genera un token de descarga (se guarda solo su hash) y envía el correo.
 */
export async function fulfillPayment(paymentId: string): Promise<FulfillResult> {
  const payment = await mpPayment().get({ id: paymentId });
  const orderId = payment.external_reference;
  if (!orderId) return { state: "unknown", order: null };

  const ref = db().collection("orders").doc(orderId);

  if (payment.status !== "approved") {
    const final = ["rejected", "cancelled", "refunded", "charged_back"].includes(payment.status ?? "");
    const order = await db().runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) return null;
      const o = { id: snap.id, ...snap.data() } as Order;
      if (final && o.status === "pending") tx.update(ref, { status: "rejected", mpPaymentId: String(payment.id) });
      return o;
    });
    return { state: final ? "rejected" : "pending", order };
  }

  // --- Pago aprobado: marcar pagado + reservar el envío del correo (atómico).
  let token: string | null = null;
  const order = await db().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return null;
    const o = { id: snap.id, ...snap.data() } as Order;

    const updates: Partial<Order> = {};
    if (o.status !== "paid") {
      const amountOk =
        payment.currency_id === o.currency && Math.round(payment.transaction_amount ?? 0) >= o.total;
      if (!amountOk) {
        console.error(`[fulfill] monto no coincide en pedido ${o.id}`, payment.transaction_amount, o.total);
        return o;
      }
      updates.status = "paid";
      updates.mpPaymentId = String(payment.id);
      updates.paidAt = Date.now();
    }

    // Reserva el envío: solo un proceso a la vez genera token y manda el correo.
    const claimFree = !o.emailClaimedAt || Date.now() - o.emailClaimedAt > CLAIM_TTL_MS;
    if (!o.emailSentAt && claimFree) {
      token = randomBytes(32).toString("base64url");
      updates.downloadTokenHash = hashToken(token);
      updates.downloadExpiresAt = Date.now() + linkHours() * 3_600_000;
      updates.emailClaimedAt = Date.now();
    }

    if (Object.keys(updates).length) tx.update(ref, updates);
    return { ...o, ...updates } as Order;
  });

  if (!order) return { state: "unknown", order: null };
  if (order.status !== "paid") return { state: "pending", order };

  if (token) {
    try {
      await sendDownloadEmail(order, `${appUrl()}/descarga/${token}`, order.downloadExpiresAt!);
      await ref.update({ emailSentAt: Date.now() });
    } catch (err) {
      // Libera la reserva para que el próximo reintento del webhook lo vuelva a intentar.
      await ref.update({ emailClaimedAt: null });
      throw err;
    }
  }
  return { state: "paid", order };
}

/** Reenvío manual (p. ej. el cliente perdió el correo): emite un token nuevo. */
export async function resendDownloadEmail(orderId: string): Promise<void> {
  const ref = db().collection("orders").doc(orderId);
  const snap = await ref.get();
  const order = { id: snap.id, ...snap.data() } as Order;
  if (!snap.exists || order.status !== "paid") throw new Error("Pedido no pagado");

  const token = randomBytes(32).toString("base64url");
  const downloadExpiresAt = Date.now() + linkHours() * 3_600_000;
  await ref.update({ downloadTokenHash: hashToken(token), downloadExpiresAt });
  await sendDownloadEmail(order, `${appUrl()}/descarga/${token}`, downloadExpiresAt);
  await ref.update({ emailSentAt: Date.now() });
}

export async function findOrderByToken(token: string): Promise<Order | null> {
  if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) return null;
  const snap = await db()
    .collection("orders")
    .where("downloadTokenHash", "==", hashToken(token))
    .limit(1)
    .get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Order;
}

const RECONCILE_WINDOW_MS = 48 * 3_600_000;

/**
 * Red de seguridad para webhooks que no llegan (en local nunca llegan, y en
 * producción pueden perderse): busca en Mercado Pago los pagos de los pedidos
 * pendientes recientes del fotógrafo y los entrega. Se ejecuta al abrir el panel.
 */
export async function reconcilePendingOrders(photographerId: string): Promise<number> {
  const snap = await db()
    .collection("orders")
    .where("photographerId", "==", photographerId)
    .where("status", "==", "pending")
    .limit(30)
    .get();

  const recent = snap.docs.filter((d) => Date.now() - (d.get("createdAt") ?? 0) < RECONCILE_WINDOW_MS);
  let delivered = 0;

  await Promise.all(
    recent.map(async (d) => {
      try {
        const res = await mpPayment().search({
          options: { external_reference: d.id, sort: "date_created", criteria: "desc", limit: 5 },
        });
        const approved = res.results?.find((p) => p.status === "approved");
        const any = approved ?? res.results?.[0];
        if (!any?.id) return;
        const r = await fulfillPayment(String(any.id));
        if (r.state === "paid") delivered++;
      } catch (err) {
        console.error("[reconcile] pedido", d.id, err);
      }
    }),
  );
  return delivered;
}
