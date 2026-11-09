import Link from "next/link";
import { PaperNotice } from "@/components/PaperNotice";

export default function NotFound() {
  return (
    <PaperNotice stamp="No está" tone="pending" title="No encontramos esta galería">
      <p>
        Puede que el fotógrafo todavía no haya publicado la galería o que el enlace tenga un error. Pedile el
        enlace de nuevo.
      </p>
      <Link href="/" className="btn">
        Buscar otro evento
      </Link>
    </PaperNotice>
  );
}
