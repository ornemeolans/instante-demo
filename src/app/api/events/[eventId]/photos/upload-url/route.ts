import { NextResponse, type NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { ACCEPTED_TYPES, LIMITS } from "@/lib/demo";
import { getEventForOwner } from "@/lib/events";
import { createOriginalUploadUrl, STORAGE_DRIVER } from "@/lib/storage";

export const runtime = "nodejs";

const PHOTO_ID = /^[A-Za-z0-9-]{8,64}$/;

/**
 * Paso 1 de la carga con Supabase: el servidor valida dueño, tipo, tamaño y
 * cupo del evento, y entrega una URL firmada de un solo uso para que el
 * navegador suba el original directo al bucket privado.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ eventId: string }> }) {
  if (STORAGE_DRIVER !== "supabase") {
    return NextResponse.json({ error: "Solo disponible con Supabase Storage" }, { status: 400 });
  }
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { eventId } = await ctx.params;
  const event = await getEventForOwner(eventId, user.uid);
  if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });

  const { photoId, ext, contentType, size } = (await req.json().catch(() => ({}))) as {
    photoId?: string;
    ext?: string;
    contentType?: string;
    size?: number;
  };

  if (!photoId || !PHOTO_ID.test(photoId) || !ext || !/^[a-z0-9]{2,5}$/.test(ext)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }
  if (!contentType || !ACCEPTED_TYPES.includes(contentType)) {
    return NextResponse.json({ error: "Formato no admitido" }, { status: 415 });
  }
  if (!size || size > LIMITS.maxUploadBytes) {
    return NextResponse.json(
      { error: `Supera ${Math.round(LIMITS.maxUploadBytes / 1024 / 1024)} MB` },
      { status: 413 },
    );
  }
  if (event.photoCount >= LIMITS.maxPhotosPerEvent) {
    return NextResponse.json(
      { error: `Límite de ${LIMITS.maxPhotosPerEvent} fotos por evento` },
      { status: 409 },
    );
  }

  const storagePath = `originals/${user.uid}/${eventId}/${photoId}.${ext}`;
  try {
    const signedUrl = await createOriginalUploadUrl(storagePath);
    return NextResponse.json({ signedUrl, storagePath });
  } catch (err) {
    console.error("[upload-url]", err);
    return NextResponse.json({ error: "No se pudo preparar la subida" }, { status: 502 });
  }
}
