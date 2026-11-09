import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { DEMO_MODE, DEMO_NAME, DEMO_UID } from "@/lib/demo";

export const runtime = "nodejs";

/**
 * Solo en modo demo: devuelve un custom token de Firebase para la cuenta
 * demo. El navegador lo canjea con signInWithCustomToken y después sigue el
 * flujo normal (/api/auth/session → cookie httpOnly). No hay contraseña
 * pública: el token lo firma el servidor con la cuenta de servicio y vence en 1 h.
 */
export async function POST() {
  if (!DEMO_MODE) return NextResponse.json({ error: "No disponible" }, { status: 404 });

  try {
    await adminAuth().getUser(DEMO_UID);
  } catch {
    await adminAuth().createUser({ uid: DEMO_UID, displayName: DEMO_NAME });
  }

  const token = await adminAuth().createCustomToken(DEMO_UID);
  return NextResponse.json({ token, displayName: DEMO_NAME });
}
