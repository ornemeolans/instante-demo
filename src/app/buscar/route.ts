import { NextResponse, type NextRequest } from "next/server";
import { slugify } from "@/lib/events";

/**
 * Buscador del mostrador: acepta el enlace completo que compartió el
 * fotógrafo (…/e/maraton-rosario) o solo el código del evento.
 */
export function GET(req: NextRequest) {
  const raw = (req.nextUrl.searchParams.get("q") ?? "").trim();
  const fromUrl = raw.match(/\/e\/([^/?#\s]+)/)?.[1];
  const slug = slugify(decodeURIComponent(fromUrl ?? raw));
  const target = slug ? `/e/${slug}` : "/?buscar=vacio";
  return NextResponse.redirect(new URL(target, req.url));
}
