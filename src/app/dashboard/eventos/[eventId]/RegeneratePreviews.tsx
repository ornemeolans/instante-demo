"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

const CONCURRENCY = 3;

/** Regenera las vistas previas de todo el evento con la marca de agua actual. */
export function RegeneratePreviews({ eventId, photoIds }: { eventId: string; photoIds: string[] }) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const [failed, setFailed] = useState(0);
  const [finished, setFinished] = useState(false);

  async function run() {
    if (!confirm(`Se van a regenerar las ${photoIds.length} vistas previas con la marca de agua actual. ¿Continuar?`)) return;
    setRunning(true);
    setFinished(false);
    setDone(0);
    setFailed(0);

    let next = 0;
    const worker = async () => {
      while (next < photoIds.length) {
        const id = photoIds[next++];
        try {
          const res = await fetch(`/api/events/${eventId}/photos/${id}/regenerate`, { method: "POST" });
          if (!res.ok) throw new Error();
          setDone((n) => n + 1);
        } catch {
          setFailed((n) => n + 1);
        }
      }
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    setRunning(false);
    setFinished(true);
    router.refresh();
  }

  if (photoIds.length === 0) return null;
  const pct = Math.round(((done + failed) / photoIds.length) * 100);

  return (
    <div className="regen">
      <button className="btn btn-small" onClick={run} disabled={running}>
        <RefreshCw aria-hidden />
        {running ? `Regenerando… ${done + failed}/${photoIds.length}` : "Regenerar vistas previas"}
      </button>
      {running && (
        <span className="regen-bar" aria-hidden>
          <span style={{ width: `${pct}%` }} />
        </span>
      )}
      {finished && (
        <span className={failed ? "form-error" : "form-ok"} role="status">
          {failed ? `${done} listas, ${failed} con error` : `Listo: ${done} vistas previas actualizadas`}
        </span>
      )}
    </div>
  );
}
