import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/firebase/admin";
import { appUrl, isPublicHttps, mpPreference } from "@/lib/mercadopago";
import type { Order, Photo, PhotoEvent } from "@/lib/types";

export const runtime = "nodejs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_PHOTOS = 200;

/**
 * Crea el pedido (pending) y la preferencia de Checkout Pro.
 * El precio SIEMPRE se calcula en el servidor a partir del evento: el
 * navegador solo manda qué fotos quiere.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    eventId?: string;
    photoIds?: unknown;
    buyerName?: string;
    buyerEmail?: string;
  };

  const buyerName = String(body.buyerName ?? "").trim().slice(0, 80);
  const buyerEmail = String(body.buyerEmail ?? "").trim().toLowerCase().slice(0, 120);
  const photoIds = Array.isArray(body.photoIds)
    ? [...new Set(body.photoIds.filter((x): x is string => typeof x === "string"))]
    : [];

  if (!body.eventId || !buyerName || !EMAIL.test(buyerEmail)) {
    return NextResponse.json({ error: "Completá tu nombre y un correo válido." }, { status: 400 });
  }
  if (photoIds.length === 0 || photoIds.length > MAX_PHOTOS) {
    return NextResponse.json({ error: "Elegí entre 1 y 200 fotos." }, { status: 400 });
  }

  const eventRef = db().collection("events").doc(body.eventId);
  const eventSnap = await eventRef.get();
  const event = eventSnap.exists ? ({ id: eventSnap.id, ...eventSnap.data() } as PhotoEvent) : null;
  if (!event || !event.published) {
    return NextResponse.json({ error: "La galería no está disponible." }, { status: 404 });
  }

  const photoSnaps = await db().getAll(...photoIds.map((id) => eventRef.collection("photos").doc(id)));
  const photos = photoSnaps.filter((s) => s.exists).map((s) => ({ id: s.id, ...s.data() }) as Photo);
  if (photos.length !== photoIds.length) {
    return NextResponse.json(
      { error: "Algunas fotos ya no están disponibles. Recargá la página." },
      { status: 409 },
    );
  }

  const unitPrice = event.pricePerPhoto;
  const orderRef = db().collection("orders").doc();
  const order: Omit<Order, "id"> = {
    eventId: event.id,
    eventTitle: event.title,
    photographerId: event.photographerId,
    items: photos.map((p) => ({
      photoId: p.id,
      thumbUrl: p.thumbUrl,
      unitPrice,
      originalPath: p.originalPath,
      fileName: p.fileName,
    })),
    total: unitPrice * photos.length,
    currency: "ARS",
    buyerEmail,
    buyerName,
    status: "pending",
    mpPreferenceId: null,
    mpPaymentId: null,
    downloadTokenHash: null,
    downloadExpiresAt: null,
    emailSentAt: null,
    emailClaimedAt: null,
    paidAt: null,
    createdAt: Date.now(),
  };
  await orderRef.set(order);

  const base = appUrl();
  const returnUrl = `${base}/pago/resultado`;
  try {
    const pref = await mpPreference().create({
      body: {
        items: [
          {
            id: event.id,
            title: `${photos.length} foto${photos.length > 1 ? "s" : ""} · ${event.title}`.slice(0, 250),
            description: `Fotos digitales en alta resolución de ${event.photographerName}`,
            quantity: photos.length,
            unit_price: unitPrice,
            currency_id: "ARS",
          },
        ],
        payer: { name: buyerName, email: buyerEmail },
        external_reference: orderRef.id,
        back_urls: { success: returnUrl, pending: returnUrl, failure: returnUrl },
        ...(isPublicHttps(base)
          ? { auto_return: "approved", notification_url: `${base}/api/webhooks/mercadopago` }
          : {}),
        statement_descriptor: "FOTOVENTA",
        // Un pago aprobado o rechazado, sin estados intermedios largos (efectivo, etc.).
        binary_mode: true,
        expires: true,
        expiration_date_to: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        metadata: { order_id: orderRef.id },
      },
      requestOptions: { idempotencyKey: orderRef.id },
    });

    await orderRef.update({ mpPreferenceId: pref.id ?? null });
    return NextResponse.json({ orderId: orderRef.id, initPoint: pref.init_point });
  } catch (err) {
    console.error("[checkout] error creando preferencia", err);
    await orderRef.update({ status: "rejected" });
    return NextResponse.json({ error: "No pudimos conectar con Mercado Pago. Probá de nuevo." }, { status: 502 });
  }
}
