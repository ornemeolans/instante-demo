import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { Plate } from "@/components/Cyanotype";
import { Wordmark } from "@/components/Wordmark";
import { listShowcase, type ShowcaseItem } from "@/lib/events";
import { formatMoney } from "@/lib/format";

// La vidriera muestra fotos reales de los eventos publicados (render por request).
export const dynamic = "force-dynamic";

async function showcase(): Promise<ShowcaseItem[]> {
  try {
    return await listShowcase(8);
  } catch {
    return []; // sin base de datos (p. ej. durante el build) la vidriera queda vacía
  }
}

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [items, sp] = await Promise.all([showcase(), searchParams]);
  const emptySearch = sp.buscar === "vacio";

  return (
    <div className="landing">
      <header className="topbar">
        <Wordmark />
        <Link href="/login" className="btn btn-small">
          Soy fotógrafo
        </Link>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <Plate className="hero-plate">
          <h1 id="hero-title" className="display-type">
            Instante
          </h1>
          <p className="hero-promise">Tus fotos del evento, reveladas para vos.</p>
        </Plate>

        <form action="/buscar" method="get" className="hero-search">
          <label className="field">
            <span>Pegá el enlace o el código que te pasó el fotógrafo</span>
            <div className="search-row">
              <input
                className="input"
                name="q"
                required
                placeholder="instante.app/e/maraton-rosario"
                autoComplete="off"
                aria-invalid={emptySearch || undefined}
              />
              <button className="btn btn-primary">
                <Search aria-hidden /> Buscar mis fotos
              </button>
            </div>
          </label>
          {emptySearch && (
            <p className="form-error" style={{ textAlign: "center" }}>
              Pegá el enlace o escribí el código del evento.
            </p>
          )}
        </form>
      </section>

      <section className="vidriera" aria-labelledby="vidriera-title">
        <h2 id="vidriera-title" className="section-title display-type">
          Recién reveladas
        </h2>
        {items.length > 0 ? (
          <>
            <p className="section-sub">Vistas previas de los últimos eventos publicados.</p>
            <div className="vidriera-strip">
              {items.map((it, i) => (
                <figure key={it.photoId} className="vidriera-photo">
                  <Link href={`/e/${it.slug}`} aria-label={`Ver la galería ${it.eventTitle}`}>
                    <img src={it.thumbUrl} alt="" loading={i < 4 ? "eager" : "lazy"} draggable={false} />
                  </Link>
                  <figcaption>
                    <span className="annot">
                      Toma {String(it.take).padStart(3, "0")} · {it.eventTitle}
                    </span>
                    <span className="sticker">{formatMoney(it.price)}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </>
        ) : (
          <p className="vidriera-empty">
            Todavía no hay galerías publicadas. Cuando un fotógrafo publique su primer evento, sus vistas
            previas aparecen acá.
          </p>
        )}
      </section>

      <section className="pasos" aria-label="Cómo funciona">
        <ol>
          <li>
            <strong>Elegí</strong>
            <p>Mirá las vistas previas y marcá las que querés.</p>
          </li>
          <li>
            <strong>Pagá</strong>
            <p>Con Mercado Pago: tarjeta, débito o dinero en cuenta.</p>
          </li>
          <li>
            <strong>Descargá</strong>
            <p>Te llega un correo con los originales sin marca. El enlace vale 48 horas.</p>
          </li>
        </ol>
      </section>

      <section className="trastienda" aria-labelledby="pros-title">
        <h2 id="pros-title" className="display-type">
          ¿Sos fotógrafo?
        </h2>
        <p>
          Creá el evento, arrastrá las fotos y armamos la galería: vistas previas con tu marca de agua en
          capas, distinta en cada foto. Tus originales nunca quedan expuestos.
        </p>
        <Link href="/login" className="btn btn-primary">
          Empezar a vender <ArrowRight aria-hidden />
        </Link>
      </section>

      <footer className="site-foot">Instante · {new Date().getFullYear()}</footer>
    </div>
  );
}
