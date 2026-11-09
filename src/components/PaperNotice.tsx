import { Wordmark } from "@/components/Wordmark";
import { Plate } from "@/components/Cyanotype";

/** Página centrada con un ticket de papel: avisos, resultados y errores. */
export function PaperNotice({
  stamp,
  tone = "ok",
  title,
  children,
}: {
  stamp?: string;
  tone?: "ok" | "pending" | "bad";
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="center-page">
      <header className="topbar">
        <Wordmark />
      </header>
      <main>
        <div className="ticket sobre paper">
          <Plate className="ticket-plate">
            <span className="wordmark">Instante</span>
          </Plate>
          <div className="ticket-body">
            {stamp && <span className={`status-stamp ${tone}`}>{stamp}</span>}
            <h1 className="display-type">{title}</h1>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
