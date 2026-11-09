import "server-only";

import { db } from "@/lib/firebase/admin";
import type { Photo, PhotoEvent, PublicPhoto } from "@/lib/types";

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Slug único: "boda-ana-y-juan", "boda-ana-y-juan-2", ... */
export async function uniqueSlug(title: string): Promise<string> {
  const base = slugify(title) || "evento";
  for (let i = 1; i < 50; i++) {
    const candidate = i === 1 ? base : `${base}-${i}`;
    const taken = await db().collection("events").where("slug", "==", candidate).limit(1).get();
    if (taken.empty) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function getEventForOwner(eventId: string, uid: string): Promise<PhotoEvent | null> {
  const snap = await db().collection("events").doc(eventId).get();
  if (!snap.exists) return null;
  const event = { id: snap.id, ...snap.data() } as PhotoEvent;
  return event.photographerId === uid ? event : null;
}

export async function listEventsForOwner(uid: string): Promise<PhotoEvent[]> {
  const snap = await db()
    .collection("events")
    .where("photographerId", "==", uid)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as PhotoEvent);
}

export async function getPublishedEventBySlug(slug: string): Promise<PhotoEvent | null> {
  const snap = await db()
    .collection("events")
    .where("slug", "==", slug)
    .where("published", "==", true)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as PhotoEvent;
}

export async function listPhotos(eventId: string): Promise<Photo[]> {
  const snap = await db()
    .collection("events")
    .doc(eventId)
    .collection("photos")
    .orderBy("createdAt", "asc")
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Photo);
}

/** Proyección segura para el navegador: sin la ruta del original. */
export function toPublicPhoto(p: Photo): PublicPhoto {
  return { id: p.id, previewUrl: p.previewUrl, thumbUrl: p.thumbUrl, width: p.width, height: p.height };
}

export interface ShowcaseItem {
  photoId: string;
  thumbUrl: string;
  eventTitle: string;
  slug: string;
  price: number;
  /** Número de toma dentro de su evento (mismo orden que la galería). */
  take: number;
}

/** Fotos para la vidriera de la landing: las últimas de los eventos publicados. */
export async function listShowcase(limit = 8): Promise<ShowcaseItem[]> {
  const events = await db()
    .collection("events")
    .where("published", "==", true)
    .orderBy("createdAt", "desc")
    .limit(4)
    .get();
  const perEvent = await Promise.all(
    events.docs.map(async (e) => {
      const photos = await e.ref.collection("photos").orderBy("createdAt", "asc").limit(4).get();
      return photos.docs.map((p, j) => ({
        photoId: p.id,
        thumbUrl: p.get("thumbUrl") as string,
        eventTitle: e.get("title") as string,
        slug: e.get("slug") as string,
        price: e.get("pricePerPhoto") as number,
        take: j + 1,
      }));
    }),
  );
  // Intercala eventos para que la vidriera no muestre un solo evento seguido.
  const out: ShowcaseItem[] = [];
  for (let i = 0; out.length < limit && i < 4; i++) for (const list of perEvent) if (list[i] && out.length < limit) out.push(list[i]);
  return out;
}
