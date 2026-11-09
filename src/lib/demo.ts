/**
 * Modo demo (portfolio): la app está publicada para que cualquiera la pruebe,
 * pero NO es un servicio real. Se activa con NEXT_PUBLIC_DEMO_MODE=true.
 * Los límites evitan que el almacenamiento gratuito se llene o se abuse.
 */
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export const LIMITS = DEMO_MODE
  ? { maxEventsPerPhotographer: 3, maxPhotosPerEvent: 20, maxUploadBytes: 15 * 1024 * 1024 }
  : { maxEventsPerPhotographer: 500, maxPhotosPerEvent: 3000, maxUploadBytes: 60 * 1024 * 1024 };

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/tiff"];

/** Cuenta de fotógrafo compartida para que cualquiera pruebe el panel sin registrarse. */
export const DEMO_UID = "fotografo-demo";
export const DEMO_NAME = "Fotógrafo demo";
