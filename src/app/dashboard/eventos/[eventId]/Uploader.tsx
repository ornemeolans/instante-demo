"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus } from "lucide-react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { ref, uploadBytesResumable } from "firebase/storage";
import { clientAuth, clientStorage } from "@/lib/firebase/client";

type ItemStatus = "en cola" | "subiendo" | "procesando" | "lista" | "error";
interface Item {
  key: string;
  name: string;
  progress: number;
  status: ItemStatus;
  error?: string;
}

// HEIC no: los binarios de sharp no incluyen el códec HEVC. Pedí exportar en JPG.
const ACCEPT = "image/jpeg,image/png,image/webp,image/tiff";
const CONCURRENCY = 3;
const DRIVER = process.env.NEXT_PUBLIC_STORAGE_DRIVER === "supabase" ? "supabase" : "firebase";

/** PUT con XMLHttpRequest para poder mostrar el progreso (fetch no lo informa). */
function putWithProgress(url: string, file: File, onProgress: (sent: number, total: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("content-type", file.type);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded, e.total);
    xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`Subida falló (${xhr.status})`)));
    xhr.onerror = () => reject(new Error("Error de red al subir"));
    xhr.send(file);
  });
}

function currentUser(): Promise<User | null> {
  const auth = clientAuth();
  if (auth.currentUser) return Promise.resolve(auth.currentUser);
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (u) => {
      unsub();
      resolve(u);
    });
  });
}

/**
 * Carga en dos pasos:
 *  1. El original va directo del navegador a Storage (sin pasar por el
 *     servidor de Next: evita el límite de tamaño del body en Vercel).
 *  2. Se avisa al servidor, que genera las vistas previas con marca de agua.
 */
export function Uploader({ eventId, maxBytes }: { eventId: string; maxBytes: number }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [running, setRunning] = useState(false);
  const [dragging, setDragging] = useState(false);

  const patch = (key: string, p: Partial<Item>) =>
    setItems((prev) => prev.map((it) => (it.key === key ? { ...it, ...p } : it)));

  const onProgress = (key: string) => (sent: number, total: number) =>
    patch(key, { progress: Math.round((sent / total) * 100) });

  async function uploadOne(file: File, key: string, uid: string) {
    if (file.size > maxBytes) {
      return patch(key, { status: "error", error: `Supera ${Math.round(maxBytes / 1024 / 1024)} MB` });
    }

    const photoId = crypto.randomUUID();
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    let storagePath = `originals/${uid}/${eventId}/${photoId}.${ext}`;

    patch(key, { status: "subiendo" });
    if (DRIVER === "supabase") {
      // 1a. El servidor valida y entrega una URL firmada de un solo uso.
      const res = await fetch(`/api/events/${eventId}/photos/upload-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, ext, contentType: file.type, size: file.size }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? `Error ${res.status}`);
      storagePath = data.storagePath;
      // 1b. Subida directa al bucket privado de Supabase.
      await putWithProgress(data.signedUrl, file, onProgress(key));
    } else {
      await new Promise<void>((resolve, reject) => {
        const task = uploadBytesResumable(ref(clientStorage(), storagePath), file, {
          contentType: file.type || "image/jpeg",
        });
        task.on("state_changed", (s) => onProgress(key)(s.bytesTransferred, s.totalBytes), reject, () => resolve());
      });
    }

    patch(key, { status: "procesando", progress: 100 });
    const res = await fetch(`/api/events/${eventId}/photos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photoId, storagePath, fileName: file.name }),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `Error ${res.status}`);
    patch(key, { status: "lista" });
  }

  async function start(files: File[]) {
    const images = files.filter((f) => ACCEPT.split(",").includes(f.type));
    if (!images.length) return;

    const user = await currentUser();
    if (!user) {
      alert("Tu sesión de Firebase expiró. Volvé a iniciar sesión.");
      window.location.href = "/login";
      return;
    }

    const queue = images.map((file) => ({ file, key: crypto.randomUUID() }));
    setItems((prev) => [
      ...queue.map(({ file, key }) => ({ key, name: file.name, progress: 0, status: "en cola" as const })),
      ...prev,
    ]);
    setRunning(true);

    let next = 0;
    const worker = async () => {
      while (next < queue.length) {
        const { file, key } = queue[next++];
        try {
          await uploadOne(file, key, user.uid);
        } catch (e) {
          patch(key, { status: "error", error: (e as Error).message });
        }
      }
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    setRunning(false);
    router.refresh();
  }

  const done = items.filter((i) => i.status === "lista").length;

  return (
    <div className="panel stack">
      <h2>Subir fotos</h2>
      <div
        className={`dropzone ${dragging ? "over" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          start(Array.from(e.dataTransfer.files));
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      >
        <ImagePlus aria-hidden />
        <p><strong>Arrastrá las fotos acá</strong> o hacé clic para elegirlas</p>
        <p className="muted small">JPG, PNG, WEBP o TIFF · hasta {Math.round(maxBytes / 1024 / 1024)} MB cada una. El original nunca se muestra en la galería.</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          hidden
          onChange={(e) => {
            start(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      </div>
      {items.length > 0 && (
        <>
          <p className="small muted" role="status">
            {done}/{items.length} listas {running && "· procesando…"}
          </p>
          <ul className="upload-list">
            {items.map((it) => (
              <li key={it.key} className={`st-${it.status}`}>
                <span className="name">{it.name}</span>
                <span className="bar"><span style={{ width: `${it.progress}%` }} /></span>
                <span className="small">{it.error ?? it.status}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
