import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { requirePhotographer } from "@/lib/auth/session";
import { getEventForOwner, listPhotos } from "@/lib/events";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { reconcilePendingOrders } from "@/lib/fulfillment";
import { listPaidOrders, salesPerPhoto } from "@/lib/sales";
import { LIMITS } from "@/lib/demo";
import { DeletePhotoButton, EditEventForm, PublishToggle, ResendEmailButton } from "../../forms";
import { RegeneratePreviews } from "./RegeneratePreviews";
import { Uploader } from "./Uploader";

export const metadata = { title: "Evento" };

export default async function EventAdminPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const user = await requirePhotographer();
  const event = await getEventForOwner(eventId, user.uid);
  if (!event) notFound();
  await reconcilePendingOrders(user.uid);

  const [photos, orders] = await Promise.all([listPhotos(eventId), listPaidOrders(user.uid, eventId)]);
  const perPhoto = salesPerPhoto(orders);
  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const photosSold = orders.reduce((s, o) => s + o.items.length, 0);
  const publicUrl = `${process.env.APP_URL ?? ""}/e/${event.slug}`;

  return (
    <div className="stack-lg">
      <div className="page-head">
        <div className="stack" style={{ gap: 6 }}>
          <Link href="/dashboard" className="back-link">
            <ArrowLeft aria-hidden /> Eventos
          </Link>
          <h1 className="display-type">{event.title}</h1>
          <p className="muted">
            {formatDate(event.date)} · {event.photoCount} {event.photoCount === 1 ? "foto" : "fotos"} · {formatMoney(event.pricePerPhoto)} por foto
          </p>
        </div>
        <div className="row">
          {event.published && (
            <a className="btn" href={`/e/${event.slug}`} target="_blank" rel="noreferrer">
              <ExternalLink aria-hidden /> Ver galería
            </a>
          )}
          <PublishToggle eventId={event.id} published={event.published} />
        </div>
      </div>

      {event.published ? (
        <p className="share-line">
          <strong>Enlace para compartir</strong>
          <code>{publicUrl}</code>
        </p>
      ) : (
        <p className="share-line">
          <span className="badge">Borrador</span>
          <span className="muted">Nadie ve esta galería hasta que la publiques.</span>
        </p>
      )}

      <section className="caja" aria-label="Caja del evento">
        <div>
          <span>Ventas</span>
          <strong>{orders.length}</strong>
        </div>
        <div>
          <span>Fotos vendidas</span>
          <strong>{photosSold}</strong>
        </div>
        <div>
          <span>Recaudado</span>
          <strong>{formatMoney(revenue)}</strong>
        </div>
      </section>

      <div className="dash-grid">
        <Uploader eventId={event.id} maxBytes={LIMITS.maxUploadBytes} />
        <EditEventForm event={event} />
      </div>

      <section>
        <div className="section-head">
          <h2>Fotos ({photos.length})</h2>
          <RegeneratePreviews eventId={event.id} photoIds={photos.map((p) => p.id)} />
        </div>
        {photos.length === 0 ? (
          <p className="muted">Subí fotos para armar la galería.</p>
        ) : (
          <ul className="admin-grid">
            {photos.map((p) => (
              <li key={p.id}>
                <img src={p.thumbUrl} alt={p.fileName} loading="lazy" />
                <span className="caption" title={p.fileName}>
                  {p.fileName}
                </span>
                {perPhoto.get(p.id) ? (
                  <span className="sold sticker" aria-label={`${perPhoto.get(p.id)} vendidas`}>
                    {perPhoto.get(p.id)} vend.
                  </span>
                ) : null}
                <DeletePhotoButton eventId={event.id} photoId={p.id} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2>Últimas ventas</h2>
        {orders.length === 0 ? (
          <p className="muted">Sin ventas todavía. Cuando alguien compre, aparece acá.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Fotos</th>
                  <th>Total</th>
                  <th>Operación MP</th>
                  <th>
                    <span className="visually-hidden">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 50).map((o) => (
                  <tr key={o.id}>
                    <td>{o.paidAt ? formatDateTime(o.paidAt) : "—"}</td>
                    <td>
                      {o.buyerName}
                      <br />
                      <span className="muted small">{o.buyerEmail}</span>
                    </td>
                    <td>{o.items.length}</td>
                    <td>{formatMoney(o.total)}</td>
                    <td className="small">{o.mpPaymentId}</td>
                    <td>
                      <ResendEmailButton orderId={o.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
