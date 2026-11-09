import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Plate } from "@/components/Cyanotype";
import { Wordmark } from "@/components/Wordmark";
import { getPublishedEventBySlug, listPhotos, toPublicPhoto } from "@/lib/events";
import { formatDate, formatMoney } from "@/lib/format";
import { Gallery } from "./Gallery";

// Galería pública renderizada en el servidor en cada request (SSR): siempre
// muestra las fotos y el precio vigentes, y es indexable por buscadores.
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPublishedEventBySlug(slug);
  if (!event) return { title: "Galería no encontrada" };
  return {
    title: event.title,
    description: `Fotos de ${event.title} por ${event.photographerName}. ${formatMoney(event.pricePerPhoto)} cada una.`,
    openGraph: { images: event.coverThumbUrl ? [event.coverThumbUrl] : [] },
  };
}

export default async function PublicGalleryPage({ params }: Props) {
  const { slug } = await params;
  const event = await getPublishedEventBySlug(slug);
  if (!event) notFound();
  const photos = (await listPhotos(event.id)).map(toPublicPhoto);

  return (
    <div className="gallery-page">
      <header className="topbar">
        <Wordmark />
      </header>

      <section aria-labelledby="event-title">
        <Plate className="event-plate">
          <h1 id="event-title" className="display-type">
            {event.title}
          </h1>
          <p className="event-meta">
            <span>{formatDate(event.date)}</span>
            <span>Fotos de {event.photographerName}</span>
            <span>
              {photos.length} {photos.length === 1 ? "toma" : "tomas"}
            </span>
            <span className="sticker">{formatMoney(event.pricePerPhoto)} c/u</span>
          </p>
        </Plate>
      </section>

      {event.description && <p className="event-desc">{event.description}</p>}

      <Gallery eventId={event.id} eventTitle={event.title} price={event.pricePerPhoto} photos={photos} />
    </div>
  );
}
