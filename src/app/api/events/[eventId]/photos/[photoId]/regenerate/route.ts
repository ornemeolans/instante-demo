import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "@/lib/auth/session";
import { getEventForOwner } from "@/lib/events";
import { db } from "@/lib/firebase/admin";
import { generateAndStorePreviews } from "@/lib/previews";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Vuelve a generar vista previa y miniatura de UNA foto con la marca de agua
 * actual. El panel la llama foto por foto para mostrar el progreso y no
 * chocar con el tiempo máximo de una función serverless.
 */
export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ eventId: string; photoId: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { eventId, photoId } = await ctx.params;
  const event = await getEventForOwner(eventId, user.uid);
  if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });

  const photoRef = db().collection("events").doc(eventId).collection("photos").doc(photoId);
  const snap = await photoRef.get();
  if (!snap.exists) return NextResponse.json({ error: "Foto no encontrada" }, { status: 404 });

  try {
    const stored = await generateAndStorePreviews(
      eventId,
      photoId,
      snap.get("originalPath"),
      user.photographer.watermarkText,
    );
    await photoRef.update({ ...stored });

    // Si era la portada del evento, también se actualiza.
    const cover = event.coverThumbUrl?.split("?")[0];
    if (cover && cover === stored.thumbUrl.split("?")[0]) {
      await db().collection("events").doc(eventId).update({ coverThumbUrl: stored.thumbUrl });
    }
    revalidatePath(`/e/${event.slug}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[regenerate]", eventId, photoId, err);
    return NextResponse.json({ error: "No se pudo procesar la foto" }, { status: 422 });
  }
}
