"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { FieldValue } from "firebase-admin/firestore";
import { requirePhotographer } from "@/lib/auth/session";
import { getEventForOwner, uniqueSlug } from "@/lib/events";
import { db } from "@/lib/firebase/admin";
import { deleteFiles } from "@/lib/storage";
import { LIMITS } from "@/lib/demo";
import { listEventsForOwner } from "@/lib/events";
import { resendDownloadEmail } from "@/lib/fulfillment";
import type { PhotoEvent } from "@/lib/types";

export interface FormState {
  error?: string;
  ok?: string;
}

function parsePrice(value: FormDataEntryValue | null): number | null {
  const n = Math.round(Number(String(value ?? "").replace(",", ".")));
  return Number.isFinite(n) && n > 0 && n <= 10_000_000 ? n : null;
}

export async function createEvent(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requirePhotographer();
  const title = String(form.get("title") ?? "").trim().slice(0, 120);
  const date = String(form.get("date") ?? "");
  const description = String(form.get("description") ?? "").trim().slice(0, 1000);
  const price = parsePrice(form.get("pricePerPhoto"));

  if (!title) return { error: "Poné un nombre al evento." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Fecha inválida." };
  if (!price) return { error: "El precio por foto tiene que ser mayor a 0." };
  if ((await listEventsForOwner(user.uid)).length >= LIMITS.maxEventsPerPhotographer) {
    return { error: `En la demo se pueden crear hasta ${LIMITS.maxEventsPerPhotographer} eventos.` };
  }

  const event: Omit<PhotoEvent, "id"> = {
    photographerId: user.uid,
    photographerName: user.photographer.displayName,
    title,
    slug: await uniqueSlug(title),
    date,
    description,
    pricePerPhoto: price,
    currency: "ARS",
    published: false,
    photoCount: 0,
    coverThumbUrl: null,
    createdAt: Date.now(),
  };
  const ref = await db().collection("events").add(event);
  redirect(`/dashboard/eventos/${ref.id}`);
}

export async function updateEvent(eventId: string, _prev: FormState, form: FormData): Promise<FormState> {
  const user = await requirePhotographer();
  const event = await getEventForOwner(eventId, user.uid);
  if (!event) return { error: "Evento no encontrado." };

  const title = String(form.get("title") ?? "").trim().slice(0, 120);
  const description = String(form.get("description") ?? "").trim().slice(0, 1000);
  const price = parsePrice(form.get("pricePerPhoto"));
  if (!title) return { error: "El nombre no puede quedar vacío." };
  if (!price) return { error: "Precio inválido." };

  await db().collection("events").doc(eventId).update({ title, description, pricePerPhoto: price });
  revalidatePath(`/dashboard/eventos/${eventId}`);
  revalidatePath(`/e/${event.slug}`);
  return { ok: "Cambios guardados." };
}

export async function setPublished(eventId: string, published: boolean): Promise<void> {
  const user = await requirePhotographer();
  const event = await getEventForOwner(eventId, user.uid);
  if (!event) return;
  await db().collection("events").doc(eventId).update({ published });
  revalidatePath(`/dashboard/eventos/${eventId}`);
  revalidatePath(`/e/${event.slug}`);
}

export async function deletePhoto(eventId: string, photoId: string): Promise<void> {
  const user = await requirePhotographer();
  const event = await getEventForOwner(eventId, user.uid);
  if (!event) return;

  const ref = db().collection("events").doc(eventId).collection("photos").doc(photoId);
  const snap = await ref.get();
  if (!snap.exists) return;

  // Se borran vista previa y miniatura, pero el ORIGINAL se conserva: puede
  // haber compras con enlaces de descarga todavía vigentes.
  await deleteFiles([`previews/${eventId}/${photoId}.jpg`, `thumbs/${eventId}/${photoId}.jpg`]).catch(() => {});
  await ref.delete();
  await db()
    .collection("events")
    .doc(eventId)
    .update({ photoCount: FieldValue.increment(-1) });
  revalidatePath(`/dashboard/eventos/${eventId}`);
  revalidatePath(`/e/${event.slug}`);
}

export async function updateProfile(_prev: FormState, form: FormData): Promise<FormState> {
  const user = await requirePhotographer();
  const displayName = String(form.get("displayName") ?? "").trim().slice(0, 60);
  const watermarkText = String(form.get("watermarkText") ?? "").trim().slice(0, 40);
  if (!displayName || !watermarkText) return { error: "Completá ambos campos." };
  await db().collection("photographers").doc(user.uid).update({ displayName, watermarkText });
  revalidatePath("/dashboard");
  return { ok: "Perfil actualizado. La nueva marca se aplica a las fotos que subas desde ahora." };
}

export async function resendOrderEmail(orderId: string): Promise<FormState> {
  const user = await requirePhotographer();
  const snap = await db().collection("orders").doc(orderId).get();
  if (!snap.exists || snap.get("photographerId") !== user.uid) return { error: "Pedido no encontrado." };
  try {
    await resendDownloadEmail(orderId);
    return { ok: "Enlace reenviado." };
  } catch (err) {
    console.error("[resend]", err);
    return { error: "No se pudo reenviar." };
  }
}
