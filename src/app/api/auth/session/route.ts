import { NextResponse, type NextRequest } from "next/server";
import { adminAuth, db } from "@/lib/firebase/admin";
import { SESSION_COOKIE, SESSION_MAX_AGE_MS } from "@/lib/auth/session";
import type { Photographer } from "@/lib/types";

export const runtime = "nodejs";

/**
 * Intercambia el ID token de Firebase Auth (obtenido en el navegador) por una
 * cookie de sesión httpOnly, y crea el perfil del fotógrafo si no existe.
 */
export async function POST(req: NextRequest) {
  const { idToken, displayName } = (await req.json().catch(() => ({}))) as {
    idToken?: string;
    displayName?: string;
  };
  if (!idToken) return NextResponse.json({ error: "Falta idToken" }, { status: 400 });

  let decoded;
  try {
    decoded = await adminAuth().verifyIdToken(idToken, true);
  } catch {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  // Exige un inicio de sesión reciente (5 min) para emitir la cookie.
  if (Date.now() / 1000 - decoded.auth_time > 5 * 60) {
    return NextResponse.json({ error: "Volvé a iniciar sesión" }, { status: 401 });
  }

  const ref = db().collection("photographers").doc(decoded.uid);
  const snap = await ref.get();
  if (!snap.exists) {
    const name = (displayName || decoded.name || decoded.email?.split("@")[0] || "Fotógrafo")
      .toString()
      .trim()
      .slice(0, 60);
    const profile: Photographer = {
      displayName: name,
      email: decoded.email ?? "",
      watermarkText: name,
      createdAt: Date.now(),
    };
    await ref.set(profile);
  }

  const sessionCookie = await adminAuth().createSessionCookie(idToken, {
    expiresIn: SESSION_MAX_AGE_MS,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_MS / 1000,
  });
  return res;
}

export async function DELETE(req: NextRequest) {
  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  if (cookie) {
    try {
      const decoded = await adminAuth().verifySessionCookie(cookie);
      await adminAuth().revokeRefreshTokens(decoded.sub);
    } catch {
      // cookie ya inválida: igual la borramos
    }
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
