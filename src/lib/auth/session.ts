import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { adminAuth, db } from "@/lib/firebase/admin";
import type { Photographer } from "@/lib/types";

export const SESSION_COOKIE = "__session";
export const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 5; // 5 días (máx. de Firebase: 14)

export interface SessionUser {
  uid: string;
  email: string;
  photographer: Photographer;
}

/** Devuelve el fotógrafo con sesión iniciada, o null. Se memoiza por request. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  const cookie = store.get(SESSION_COOKIE)?.value;
  if (!cookie) return null;
  try {
    // checkRevoked=true: si se revoca la sesión (p. ej. cambio de contraseña), deja de valer.
    const decoded = await adminAuth().verifySessionCookie(cookie, true);
    const snap = await db().collection("photographers").doc(decoded.uid).get();
    if (!snap.exists) return null;
    return {
      uid: decoded.uid,
      email: decoded.email ?? "",
      photographer: snap.data() as Photographer,
    };
  } catch {
    return null;
  }
});

/** Para páginas y server actions del panel: redirige al login si no hay sesión. */
export async function requirePhotographer(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}
