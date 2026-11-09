import "server-only";

import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { bucket, EMULATOR_STORAGE_HOST, USE_EMULATORS } from "@/lib/firebase/admin";

/**
 * Capa de almacenamiento con dos implementaciones:
 *
 *  - "firebase": Firebase Storage (emuladores en local, o plan Blaze).
 *  - "supabase": Supabase Storage (plan gratuito, sin tarjeta) para la demo.
 *
 * Las rutas son siempre las mismas: `originals/{uid}/{eventId}/{photoId}.ext`
 * (privado) y `previews/...` / `thumbs/...` (públicos con marca de agua).
 * En Supabase, `originals/` va al bucket privado "originals" y el resto al
 * bucket público "media".
 */
export type StorageDriver = "firebase" | "supabase";
export const STORAGE_DRIVER: StorageDriver =
  process.env.NEXT_PUBLIC_STORAGE_DRIVER === "supabase" ? "supabase" : "firebase";

// ───────────────────────────── Supabase ─────────────────────────────

let supa: SupabaseClient | null = null;
function supabase(): SupabaseClient {
  if (supa) return supa;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  supa = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  return supa;
}

function supaTarget(path: string): { bucket: string; key: string } {
  return path.startsWith("originals/")
    ? { bucket: "originals", key: path.slice("originals/".length) }
    : { bucket: "media", key: path };
}

// ───────────────────────────── Firebase ─────────────────────────────

const firebaseBase = () =>
  USE_EMULATORS ? `http://${EMULATOR_STORAGE_HOST}` : "https://firebasestorage.googleapis.com";

const firebaseTokenUrl = (path: string, token: string) =>
  `${firebaseBase()}/v0/b/${bucket().name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;

// ───────────────────────────── API común ─────────────────────────────

/**
 * Sube un JPEG público (vista previa con marca de agua) y devuelve su URL.
 * Si el archivo ya existía (regeneración) se sobrescribe; la URL devuelta es
 * nueva para saltear la caché, y las anteriores siguen mostrando la imagen.
 */
export async function uploadPublicJpeg(path: string, data: Buffer): Promise<string> {
  if (STORAGE_DRIVER === "supabase") {
    const { bucket: b, key } = supaTarget(path);
    const { error } = await supabase()
      .storage.from(b)
      .upload(key, data, { contentType: "image/jpeg", upsert: true, cacheControl: "86400" });
    if (error) throw new Error(`Supabase upload: ${error.message}`);
    const { data: pub } = supabase().storage.from(b).getPublicUrl(key);
    return `${pub.publicUrl}?v=${Date.now().toString(36)}`;
  }

  const file = bucket().file(path);
  const token = randomUUID();
  // En Firebase se conservan los tokens viejos para que las URLs ya guardadas sigan valiendo.
  let previous: string[] = [];
  const [exists] = await file.exists();
  if (exists) {
    const [meta] = await file.getMetadata();
    previous = String(meta.metadata?.firebaseStorageDownloadTokens ?? "")
      .split(",")
      .filter(Boolean)
      .slice(-4);
  }
  await file.save(data, {
    resumable: false,
    contentType: "image/jpeg",
    metadata: {
      cacheControl: "public, max-age=86400",
      metadata: { firebaseStorageDownloadTokens: [...previous, token].join(",") },
    },
  });
  return firebaseTokenUrl(path, token);
}

export async function fileExists(path: string): Promise<boolean> {
  if (STORAGE_DRIVER === "supabase") {
    const { bucket: b, key } = supaTarget(path);
    const { data } = await supabase().storage.from(b).exists(key);
    return Boolean(data);
  }
  const [exists] = await bucket().file(path).exists();
  return exists;
}

export async function downloadFile(path: string): Promise<Buffer> {
  if (STORAGE_DRIVER === "supabase") {
    const { bucket: b, key } = supaTarget(path);
    const { data, error } = await supabase().storage.from(b).download(key);
    if (error || !data) throw new Error(`Supabase download: ${error?.message}`);
    return Buffer.from(await data.arrayBuffer());
  }
  const [buf] = await bucket().file(path).download();
  return buf;
}

export async function deleteFiles(paths: string[]): Promise<void> {
  if (STORAGE_DRIVER === "supabase") {
    const byBucket = new Map<string, string[]>();
    for (const p of paths) {
      const { bucket: b, key } = supaTarget(p);
      byBucket.set(b, [...(byBucket.get(b) ?? []), key]);
    }
    await Promise.all([...byBucket].map(([b, keys]) => supabase().storage.from(b).remove(keys)));
    return;
  }
  await Promise.allSettled(paths.map((p) => bucket().file(p).delete()));
}

/**
 * Solo Supabase: URL firmada para que el navegador suba el ORIGINAL directo
 * al bucket privado, sin pasar por el servidor (vale 2 h y un solo archivo).
 * Con Firebase el navegador sube con el SDK y lo controlan las storage.rules.
 */
export async function createOriginalUploadUrl(path: string): Promise<string> {
  const { bucket: b, key } = supaTarget(path);
  const { data, error } = await supabase().storage.from(b).createSignedUploadUrl(key);
  if (error || !data) throw new Error(`Supabase signed upload: ${error?.message}`);
  return data.signedUrl;
}

/**
 * URL temporal para descargar un original privado. Caduca en `expiresAt`
 * (máx. 7 días) y fuerza la descarga con el nombre indicado.
 */
export async function signedDownloadUrl(path: string, expiresAt: number, fileName: string) {
  const safeName = fileName.replace(/["\\\r\n/]/g, "_");

  if (STORAGE_DRIVER === "supabase") {
    const { bucket: b, key } = supaTarget(path);
    const seconds = Math.max(60, Math.floor((expiresAt - Date.now()) / 1000));
    const { data, error } = await supabase()
      .storage.from(b)
      .createSignedUrl(key, seconds, { download: safeName });
    if (error || !data) throw new Error(`Supabase signed url: ${error?.message}`);
    return data.signedUrl;
  }

  const file = bucket().file(path);
  if (USE_EMULATORS) {
    // El emulador no firma URLs (no hay clave privada). SOLO en pruebas locales
    // se usa una URL con token; la caducidad la sigue controlando /descarga.
    const [meta] = await file.getMetadata();
    let token = String(meta.metadata?.firebaseStorageDownloadTokens ?? "").split(",")[0];
    if (!token) {
      token = randomUUID();
      await file.setMetadata({ metadata: { firebaseStorageDownloadTokens: token } });
    }
    return firebaseTokenUrl(path, token);
  }

  const [url] = await file.getSignedUrl({
    version: "v4",
    action: "read",
    expires: expiresAt,
    responseDisposition: `attachment; filename="${safeName}"`,
  });
  return url;
}
