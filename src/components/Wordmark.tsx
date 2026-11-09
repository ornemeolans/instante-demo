import Link from "next/link";

/** Logotipo: "Instante" en Bodoni itálica, con el punto en azul de Prusia. */
export function Wordmark({ className = "", href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={`wordmark display-type ${className}`} aria-label="Instante, inicio">
      Instante<span className="dot" aria-hidden>.</span>
    </Link>
  );
}
