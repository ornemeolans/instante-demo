import { NextResponse, type NextRequest } from "next/server";
import { InvalidWebhookSignatureError, WebhookSignatureValidator } from "mercadopago";
import { fulfillPayment } from "@/lib/fulfillment";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Webhook de Mercado Pago (configurado en Tus integraciones > Webhooks,
 * evento "Pagos", o vía notification_url de la preferencia).
 *
 * - Verifica la firma `x-signature` (HMAC-SHA256 con MP_WEBHOOK_SECRET).
 * - Solo procesa notificaciones de tipo `payment`.
 * - Responde 200 si se procesó (o si no aplica) y 500 si falló algo
 *   transitorio, para que Mercado Pago reintente.
 */
export async function POST(req: NextRequest) {
  const url = req.nextUrl;
  const body = (await req.json().catch(() => ({}))) as {
    type?: string;
    action?: string;
    data?: { id?: string | number };
  };

  const type = body.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const dataId = url.searchParams.get("data.id") ?? (body.data?.id != null ? String(body.data.id) : null);

  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhook] falta MP_WEBHOOK_SECRET");
    return NextResponse.json({ error: "misconfigured" }, { status: 500 });
  }

  try {
    WebhookSignatureValidator.validate({
      xSignature: req.headers.get("x-signature"),
      xRequestId: req.headers.get("x-request-id"),
      dataId,
      secret,
      toleranceSeconds: 600,
    });
  } catch (err) {
    if (err instanceof InvalidWebhookSignatureError) {
      console.warn("[webhook] firma inválida", err.reason, err.requestId);
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }
    throw err;
  }

  if (type !== "payment" || !dataId) {
    return NextResponse.json({ ignored: true });
  }

  try {
    const result = await fulfillPayment(dataId);
    return NextResponse.json({ state: result.state });
  } catch (err) {
    console.error("[webhook] error procesando pago", dataId, err);
    return NextResponse.json({ error: "retry" }, { status: 500 });
  }
}
