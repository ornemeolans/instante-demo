import Link from "next/link";
import { PaperNotice } from "@/components/PaperNotice";
import { fulfillPayment, type FulfillResult } from "@/lib/fulfillment";

export const dynamic = "force-dynamic";
export const metadata = { title: "Resultado del pago", robots: { index: false } };

type Props = { searchParams: Promise<Record<string, string | undefined>> };

function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  return `${user.slice(0, 2)}${"•".repeat(Math.max(1, user.length - 2))}@${domain}`;
}

/**
 * back_url de Checkout Pro. Mercado Pago agrega `payment_id`, `status`,
 * `external_reference`, etc. No se confía en esos valores: se vuelve a
 * consultar el pago a la API (fulfillPayment). Si el webhook todavía no
 * llegó, esta página dispara la entrega igual (es idempotente).
 * El enlace de descarga NO se muestra acá: solo viaja por correo.
 */
export default async function PaymentResultPage({ searchParams }: Props) {
  const sp = await searchParams;
  const paymentId = sp.payment_id ?? sp.collection_id;

  let result: FulfillResult | null = null;
  let failed = false;
  if (paymentId && paymentId !== "null") {
    try {
      result = await fulfillPayment(paymentId);
    } catch (err) {
      console.error("[resultado] error", err);
      failed = true;
    }
  }

  const order = result?.order;
  const state = result?.state ?? (sp.status === "rejected" ? "rejected" : "unknown");

  const home = (
    <Link href="/" className="btn">
      Volver al inicio
    </Link>
  );

  if (state === "paid" && order) {
    return (
      <PaperNotice stamp="Pagado" tone="ok" title="Tus fotos están en camino">
        <p>
          Te mandamos el enlace de descarga a <strong>{maskEmail(order.buyerEmail)}</strong>. Si no lo ves
          en unos minutos, revisá la carpeta de spam.
        </p>
        <div>
          <div className="sobre-field">
            <span>Evento</span>
            <strong>{order.eventTitle}</strong>
          </div>
          <div className="sobre-field">
            <span>Copias</span>
            <strong>{order.items.length} en alta resolución</strong>
          </div>
          <div className="sobre-field">
            <span>Enlace</span>
            <strong>vale 48 horas</strong>
          </div>
        </div>
        {home}
      </PaperNotice>
    );
  }
  if (state === "pending") {
    return (
      <PaperNotice stamp="En proceso" tone="pending" title="Mercado Pago está confirmando el pago">
        <p>Cuando se apruebe, te llega el correo con el enlace de descarga. No hace falta que hagas nada más.</p>
        {home}
      </PaperNotice>
    );
  }
  if (state === "rejected") {
    return (
      <PaperNotice stamp="Sin cobrar" tone="bad" title="El pago no se completó">
        <p>No se hizo ningún cobro. Volvé a la galería: tus fotos siguen elegidas y podés probar con otro medio de pago.</p>
        {home}
      </PaperNotice>
    );
  }
  return (
    <PaperNotice title={failed ? "No pudimos verificar el pago" : "No encontramos datos del pago"}>
      <p>
        Si pagaste, en unos minutos te llega el correo con el enlace de descarga. Si no llega, escribile al
        fotógrafo con el número de operación de Mercado Pago.
      </p>
      {home}
    </PaperNotice>
  );
}
