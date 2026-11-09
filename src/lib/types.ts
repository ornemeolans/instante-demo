// Modelo de datos de Firestore.
//
// photographers/{uid}
// events/{eventId}
// events/{eventId}/photos/{photoId}
// orders/{orderId}

export interface Photographer {
  displayName: string;
  email: string;
  /** Texto de la marca de agua. Por defecto, el nombre del fotógrafo. */
  watermarkText: string;
  createdAt: number;
}

export interface PhotoEvent {
  id: string;
  photographerId: string;
  photographerName: string;
  title: string;
  slug: string;
  /** Fecha del evento en formato YYYY-MM-DD. */
  date: string;
  description: string;
  /** Precio por foto en la moneda indicada (enteros, sin centavos). */
  pricePerPhoto: number;
  currency: "ARS";
  published: boolean;
  photoCount: number;
  coverThumbUrl: string | null;
  createdAt: number;
}

export interface Photo {
  id: string;
  /** Ruta privada en Storage. Nunca se envía al navegador. */
  originalPath: string;
  previewUrl: string;
  thumbUrl: string;
  width: number;
  height: number;
  fileName: string;
  createdAt: number;
}

/** Lo único que se envía al navegador de cada foto. */
export type PublicPhoto = Pick<Photo, "id" | "previewUrl" | "thumbUrl" | "width" | "height">;

export type OrderStatus = "pending" | "paid" | "rejected";

export interface OrderItem {
  photoId: string;
  thumbUrl: string;
  unitPrice: number;
  /** Copia de la ruta del original: la entrega no depende de que la foto siga en la galería. */
  originalPath: string;
  fileName: string;
}

export interface Order {
  id: string;
  eventId: string;
  eventTitle: string;
  photographerId: string;
  items: OrderItem[];
  total: number;
  currency: "ARS";
  buyerEmail: string;
  buyerName: string;
  status: OrderStatus;
  mpPreferenceId: string | null;
  mpPaymentId: string | null;
  /** SHA-256 del token de descarga. El token en claro solo viaja por correo. */
  downloadTokenHash: string | null;
  downloadExpiresAt: number | null;
  emailSentAt: number | null;
  /** Marca para que webhook y página de retorno no envíen el correo dos veces. */
  emailClaimedAt: number | null;
  paidAt: number | null;
  createdAt: number;
}
