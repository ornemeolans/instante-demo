import { Download } from "lucide-react";
import { Plate } from "@/components/Cyanotype";
import { PaperNotice } from "@/components/PaperNotice";
import { Wordmark } from "@/components/Wordmark";
import { findOrderByToken } from "@/lib/fulfillment";
import { formatDateTime } from "@/lib/format";
import { signedDownloadUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const metadata = { title: "Descargá tus fotos", robots: { index: false, follow: false } };

type Props = { params: Promise<{ token: string }> };

/**
 * Página de descarga segura. El token (que solo viaja por correo) identifica
 * el pedido; acá se generan URLs firmadas de Storage que vencen junto con el
 * enlace (24–48 h). Los originales nunca son públicos.
 */
export default async function DownloadPage({ params }: Props) {
  const { token } = await params;
  const order = await findOrderByToken(token);
  const now = Date.now();

  if (!order || order.status !== "paid" || !order.downloadExpiresAt) {
    return (
      <PaperNotice stamp="Inválido" tone="bad" title="Este enlace no es válido">
        <p>Revisá que hayas copiado el enlace completo del correo, o abrilo directamente desde el botón del mail.</p>
      </PaperNotice>
    );
  }

  if (order.downloadExpiresAt <= now) {
    return (
      <PaperNotice stamp="Vencido" tone="pending" title="El enlace venció">
        <p>
          Venció el {formatDateTime(order.downloadExpiresAt)}. Respondé el correo de compra y el fotógrafo te
          manda uno nuevo.
        </p>
      </PaperNotice>
    );
  }

  const files = await Promise.all(
    order.items.map(async (it, i) => {
      const ext = it.originalPath.split(".").pop() ?? "jpg";
      const name = `${order.eventTitle} - ${String(i + 1).padStart(3, "0")}.${ext}`;
      return { ...it, url: await signedDownloadUrl(it.originalPath, order.downloadExpiresAt!, name) };
    }),
  );

  return (
    <div className="gallery-page" style={{ paddingBottom: 0 }}>
      <header className="topbar">
        <Wordmark />
      </header>
      <section aria-labelledby="descarga-title">
        <Plate className="event-plate">
          <h1 id="descarga-title" className="display-type">
            Tus fotos de {order.eventTitle}
          </h1>
          <p className="event-meta">
            <span>{files.length} en resolución original, sin marca de agua</span>
            <span>Disponibles hasta el {formatDateTime(order.downloadExpiresAt)}</span>
          </p>
        </Plate>
      </section>
      <div className="descarga">
        <ul className="descarga-list">
          {files.map((f, i) => (
            <li key={f.photoId}>
              <img src={f.thumbUrl} alt={`Foto ${i + 1} de ${order.eventTitle}`} loading="lazy" />
              <a className="btn btn-primary" href={f.url} rel="noreferrer">
                <Download aria-hidden /> Descargar foto {i + 1}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
