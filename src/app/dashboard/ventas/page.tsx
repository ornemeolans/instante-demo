import Link from "next/link";
import { requirePhotographer } from "@/lib/auth/session";
import { listEventsForOwner } from "@/lib/events";
import { reconcilePendingOrders } from "@/lib/fulfillment";
import { formatDateTime, formatMoney } from "@/lib/format";
import { listPaidOrders, summarizeByEvent } from "@/lib/sales";

export const metadata = { title: "Ventas" };

export default async function SalesPage() {
  const user = await requirePhotographer();
  // Confirma pagos aprobados cuyo webhook no llegó (siempre en local).
  await reconcilePendingOrders(user.uid);
  const [orders, events] = await Promise.all([listPaidOrders(user.uid), listEventsForOwner(user.uid)]);
  const byEvent = summarizeByEvent(orders);
  const photoCount = new Map(events.map((e) => [e.id, e.photoCount]));

  const total = orders.reduce((s, o) => s + o.total, 0);
  const photos = orders.reduce((s, o) => s + o.items.length, 0);
  const avgTicket = orders.length ? Math.round(total / orders.length) : 0;

  return (
    <div className="stack-lg">
      <h1 className="display-type">Ventas</h1>
      <section className="caja" aria-label="Caja total">
        <div><span>Recaudado</span><strong>{formatMoney(total)}</strong></div>
        <div><span>Pedidos pagos</span><strong>{orders.length}</strong></div>
        <div><span>Fotos vendidas</span><strong>{photos}</strong></div>
        <div><span>Ticket promedio</span><strong>{formatMoney(avgTicket)}</strong></div>
      </section>

      <section>
        <h2>Por evento</h2>
        {byEvent.length === 0 ? (
          <p className="muted">Todavía no hay ventas. Publicá un evento y compartí el enlace.</p>
        ) : (
          <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Evento</th><th>Pedidos</th><th>Fotos vendidas</th><th>Conversión*</th><th>Recaudado</th><th>Última venta</th>
              </tr>
            </thead>
            <tbody>
              {byEvent.map((s) => {
                const inGallery = photoCount.get(s.eventId) ?? 0;
                return (
                  <tr key={s.eventId}>
                    <td><Link href={`/dashboard/eventos/${s.eventId}`}>{s.eventTitle}</Link></td>
                    <td>{s.orders}</td>
                    <td>{s.photosSold}</td>
                    <td>{inGallery ? `${Math.round((s.photosSold / inGallery) * 100)}%` : "—"}</td>
                    <td><strong>{formatMoney(s.revenue)}</strong></td>
                    <td className="small">{s.lastSaleAt ? formatDateTime(s.lastSaleAt) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
        <p className="muted small">* Fotos vendidas sobre fotos publicadas en la galería.</p>
      </section>
    </div>
  );
}
