import "server-only";

import { db } from "@/lib/firebase/admin";
import type { Order } from "@/lib/types";

export interface EventSales {
  eventId: string;
  eventTitle: string;
  orders: number;
  photosSold: number;
  revenue: number;
  lastSaleAt: number | null;
}

export async function listPaidOrders(photographerId: string, eventId?: string): Promise<Order[]> {
  let q = db()
    .collection("orders")
    .where("photographerId", "==", photographerId)
    .where("status", "==", "paid");
  if (eventId) q = q.where("eventId", "==", eventId);
  const snap = await q.orderBy("paidAt", "desc").limit(1000).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order);
}

export function summarizeByEvent(orders: Order[]): EventSales[] {
  const map = new Map<string, EventSales>();
  for (const o of orders) {
    const s = map.get(o.eventId) ?? {
      eventId: o.eventId,
      eventTitle: o.eventTitle,
      orders: 0,
      photosSold: 0,
      revenue: 0,
      lastSaleAt: null,
    };
    s.orders += 1;
    s.photosSold += o.items.length;
    s.revenue += o.total;
    s.lastSaleAt = Math.max(s.lastSaleAt ?? 0, o.paidAt ?? 0);
    map.set(o.eventId, s);
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue);
}

/** Cuántas veces se vendió cada foto: útil para ver las más compradas. */
export function salesPerPhoto(orders: Order[]): Map<string, number> {
  const count = new Map<string, number>();
  for (const o of orders) for (const it of o.items) count.set(it.photoId, (count.get(it.photoId) ?? 0) + 1);
  return count;
}
