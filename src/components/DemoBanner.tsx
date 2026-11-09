import { DEMO_MODE } from "@/lib/demo";

/** Franja fija que aclara que el sitio es una demo de portfolio. */
export function DemoBanner() {
  if (!DEMO_MODE) return null;
  return (
    <div className="demo-banner" role="note">
      <strong>Demo de portfolio.</strong> No es un servicio real: los pagos son de prueba y las fotos
      que subas pueden borrarse en cualquier momento.
    </div>
  );
}
