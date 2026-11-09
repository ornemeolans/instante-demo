import Link from "next/link";
import { requirePhotographer } from "@/lib/auth/session";
import { listEventsForOwner } from "@/lib/events";
import { formatDate, formatMoney } from "@/lib/format";
import { CreateEventForm } from "./forms";

export const metadata = { title: "Mis eventos" };

export default async function DashboardPage() {
  const user = await requirePhotographer();
  const events = await listEventsForOwner(user.uid);

  return (
    <div className="dash-grid">
      <section className="stack">
        <h1 className="display-type">Mis eventos</h1>
        {events.length === 0 ? (
          <p className="muted">
            Todavía no tenés eventos. Creá el primero con el formulario y después arrastrá las fotos.
          </p>
        ) : (
          <ul className="ledger">
            {events.map((e) => (
              <li key={e.id}>
                <Link href={`/dashboard/eventos/${e.id}`} className="ledger-row">
                  <span className="ledger-thumb">{e.coverThumbUrl ? <img src={e.coverThumbUrl} alt="" /> : null}</span>
                  <span>
                    <strong>{e.title}</strong>
                    <span className="muted small" style={{ display: "block" }}>
                      {formatDate(e.date)} · {e.photoCount} {e.photoCount === 1 ? "foto" : "fotos"} · {formatMoney(e.pricePerPhoto)} c/u
                    </span>
                  </span>
                  <span className={`badge ${e.published ? "on" : ""}`}>{e.published ? "Publicada" : "Borrador"}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <aside>
        <CreateEventForm />
      </aside>
    </div>
  );
}
