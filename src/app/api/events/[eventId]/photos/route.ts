import { NextResponse, type NextRequest } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getSessionUser } from "@/lib/auth/session";
import { getEventForOwner } from "@/lib/events";
import { db } from "@/lib/firebase/admin";
import { fileExists } from "@/lib/storage";
import { LIMITS } from "@/lib/demo";
import { generateAndStorePreviews } from "@/lib/previews";
import type { Photo } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const PHOTO_ID = /^[A-Za-z0-9-]{8,64}$/;

/**
 * Paso 2 de la carga. El navegador ya subió el ORIGINAL directo a Storage
 * (`originals/{uid}/{eventId}/{photoId}.{ext}`, permitido solo al dueño por
 * storage.rules). Acá el servidor lo lee con el Admin SDK, genera la vista
 * previa y la miniatura con marca de agua, y registra la foto en Firestore.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ eventId: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { eventId } = await ctx.params;
  const event = await getEventForOwner(eventId, user.uid);
  if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });

  const body = (await req.json().catch(() => ({}))) as {
    photoId?: string;
    storagePath?: string;
    fileName?: string;
  };
  const { photoId, storagePath } = body;
  const fileName = (body.fileName ?? "foto.jpg").slice(0, 200);

  // La ruta tiene que ser exactamente la del dueño y el evento: nadie puede
  // "reclamar" originales ajenos pasando otra ruta.
  const prefix = `originals/${user.uid}/${eventId}/${photoId}.`;
  if (!photoId || !PHOTO_ID.test(photoId) || !storagePath?.startsWith(prefix)) {
    return NextResponse.json({ error: "Ruta inválida" }, { status: 400 });
  }

  if (event.photoCount >= LIMITS.maxPhotosPerEvent) {
    return NextResponse.json({ error: `Límite de ${LIMITS.maxPhotosPerEvent} fotos por evento` }, { status: 409 });
  }

  const photoRef = db().collection("events").doc(eventId).collection("photos").doc(photoId);
  if ((await photoRef.get()).exists) {
    return NextResponse.json({ ok: true, duplicated: true });
  }

  if (!(await fileExists(storagePath))) return NextResponse.json({ error: "El original no está en Storage" }, { status: 404 });

  let stored;
  try {
    stored = await generateAndStorePreviews(eventId, photoId, storagePath, user.photographer.watermarkText);
  } catch (err) {
    console.error("[photos] error procesando", storagePath, err);
    return NextResponse.json({ error: "No se pudo procesar la imagen" }, { status: 422 });
  }
  const { previewUrl, thumbUrl } = stored;

  const photo: Omit<Photo, "id"> = {
    originalPath: storagePath,
    previewUrl,
    thumbUrl,
    width: stored.width,
    height: stored.height,
    fileName,
    createdAt: Date.now(),
  };

  const eventRef = db().collection("events").doc(eventId);
  await db().runTransaction(async (tx) => {
    const ev = await tx.get(eventRef);
    tx.set(photoRef, photo);
    tx.update(eventRef, {
      photoCount: FieldValue.increment(1),
      ...(ev.get("coverThumbUrl") ? {} : { coverThumbUrl: thumbUrl }),
    });
  });

  return NextResponse.json({ ok: true, photo: { id: photoId, thumbUrl } });
}
