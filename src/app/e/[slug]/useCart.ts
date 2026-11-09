"use client";

import { useCallback, useEffect, useState } from "react";

/** Carrito por evento, persistido en localStorage (sobrevive recargas). */
export function useCart(eventId: string, validIds: Set<string>) {
  const key = `cart:${eventId}`;
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) ?? "[]") as string[];
      // Descarta fotos que el fotógrafo haya quitado desde la última visita.
      setIds(saved.filter((id) => validIds.has(id)));
    } catch {
      setIds([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const persist = useCallback(
    (next: string[]) => {
      setIds(next);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // modo privado / almacenamiento lleno: el carrito sigue en memoria
      }
    },
    [key],
  );

  const toggle = useCallback(
    (id: string) => persist(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]),
    [ids, persist],
  );
  const clear = useCallback(() => persist([]), [persist]);

  return { ids, has: (id: string) => ids.includes(id), toggle, clear, set: persist };
}
