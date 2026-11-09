"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Plus, Trash2, X } from "lucide-react";
import type { PublicPhoto } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { useCart } from "./useCart";
import { DemoPaymentHelp } from "./DemoPaymentHelp";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const toma = (i: number) => `Toma ${String(i + 1).padStart(3, "0")}`;

interface Props {
  eventId: string;
  eventTitle: string;
  price: number;
  photos: PublicPhoto[];
}

export function Gallery({ eventId, eventTitle, price, photos }: Props) {
  const validIds = useMemo(() => new Set(photos.map((p) => p.id)), [photos]);
  const indexOf = useMemo(() => new Map(photos.map((p, i) => [p.id, i])), [photos]);
  const cart = useCart(eventId, validIds);
  const [open, setOpen] = useState<number | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [bump, setBump] = useState(0);

  const toggle = (id: string) => {
    if (!cart.has(id)) setBump((n) => n + 1);
    cart.toggle(id);
  };

  // Teclado en el visor: flechas para recorrer, espacio para elegir o quitar la foto.
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : Math.min(photos.length - 1, i + 1)));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : Math.max(0, i - 1)));
      if (e.key === " ") {
        e.preventDefault();
        toggle(photos[open].id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const total = cart.ids.length * price;
  const current = open !== null ? photos[open] : null;

  if (photos.length === 0) {
    return <p className="vidriera-empty" style={{ margin: "32px var(--gutter)" }}>El fotógrafo todavía no subió fotos a esta galería.</p>;
  }

  return (
    <>
      <ul className="vitrina" aria-label={`Fotos de ${eventTitle}`}>
        {photos.map((p, i) => {
          const picked = cart.has(p.id);
          return (
            <li key={p.id} className={`toma ${picked ? "is-picked" : ""}`}>
              <button className="toma-photo" onClick={() => setOpen(i)} aria-label={`Ver ${toma(i)} en grande`}>
                <img
                  src={p.thumbUrl}
                  alt={`${toma(i)} de ${eventTitle}`}
                  loading={i < 8 ? "eager" : "lazy"}
                  width={p.width}
                  height={p.height}
                  draggable={false}
                />
              </button>
              <div className="toma-foot">
                <span className="toma-label annot">
                  <span>{toma(i)}</span>
                </span>
                <button
                  className="toma-pick"
                  aria-pressed={picked}
                  onClick={() => toggle(p.id)}
                  aria-label={picked ? `Quitar ${toma(i)} de tus copias` : `Elegir ${toma(i)} por ${formatMoney(price)}`}
                >
                  {picked ? <Check aria-hidden /> : <Plus aria-hidden />}
                  {picked ? "Elegida" : formatMoney(price)}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {current && open !== null && (
        <div className="visor" role="dialog" aria-modal="true" aria-label={toma(open)} onClick={() => setOpen(null)}>
          <div className="visor-img" onClick={(e) => e.stopPropagation()}>
            <img src={current.previewUrl} alt={`${toma(open)} de ${eventTitle}`} draggable={false} onContextMenu={(e) => e.preventDefault()} />
          </div>
          <div className="visor-bar" onClick={(e) => e.stopPropagation()}>
            <button className="icon-btn" disabled={open === 0} onClick={() => setOpen(open - 1)} aria-label="Foto anterior">
              <ChevronLeft aria-hidden />
            </button>
            <span className="visor-count">
              {open + 1} / {photos.length}
            </span>
            <button className="icon-btn" disabled={open === photos.length - 1} onClick={() => setOpen(open + 1)} aria-label="Foto siguiente">
              <ChevronRight aria-hidden />
            </button>
            <button className={`btn ${cart.has(current.id) ? "" : "btn-primary"}`} onClick={() => toggle(current.id)}>
              {cart.has(current.id) ? "Quitar de mis copias" : `Elegir · ${formatMoney(price)}`}
            </button>
            <button className="icon-btn" onClick={() => setOpen(null)} aria-label="Cerrar">
              <X aria-hidden />
            </button>
          </div>
        </div>
      )}

      {cart.ids.length > 0 && (
        <div className="sobre-bar" role="region" aria-label="Tus copias">
          <span key={bump} className={`sobre-count ${bump ? "bump" : ""}`} aria-hidden>
            {cart.ids.length}
          </span>
          <span className="sobre-label">
            {formatMoney(total)}
            <small>
              {cart.ids.length} {cart.ids.length === 1 ? "copia elegida" : "copias elegidas"}
            </small>
          </span>
          <span className="sobre-actions">
            <button className="icon-btn sobre-clear" onClick={cart.clear} aria-label="Quitar todas" title="Quitar todas">
              <Trash2 aria-hidden />
            </button>
            <button className="btn btn-sign" onClick={() => setCheckoutOpen(true)}>
              Ver mis copias
            </button>
          </span>
        </div>
      )}

      {checkoutOpen && (
        <Checkout
          eventId={eventId}
          eventTitle={eventTitle}
          photoIds={cart.ids}
          photos={photos}
          indexOf={indexOf}
          total={total}
          onRemove={cart.toggle}
          onClose={() => setCheckoutOpen(false)}
        />
      )}
    </>
  );
}

function Checkout(props: {
  eventId: string;
  eventTitle: string;
  photoIds: string[];
  photos: PublicPhoto[];
  indexOf: Map<string, number>;
  total: number;
  onRemove: (id: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLFormElement>(null);
  const byId = new Map(props.photos.map((p) => [p.id, p]));

  useEffect(() => {
    // Foco en el diálogo (no en un campo): en el celular no levanta el teclado sobre el resumen.
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && props.onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [props]);

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: props.eventId, photoIds: props.photoIds, buyerName: name, buyerEmail: email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo iniciar el pago");
      window.location.href = data.initPoint; // Mercado Pago Checkout Pro
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className="sheet-backdrop" onClick={props.onClose}>
      <form
        ref={dialogRef}
        tabIndex={-1}
        className="checkout sobre paper"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sobre-title"
        onClick={(e) => e.stopPropagation()}
        onSubmit={pay}
      >
        <div className="sobre-head">
          <span id="sobre-title" className="sobre-brand display-type">
            Tus copias
          </span>
          <button type="button" className="icon-btn" style={{ background: "transparent", color: "var(--ink)", borderColor: "var(--thread)" }} onClick={props.onClose} aria-label="Seguir eligiendo">
            <X aria-hidden />
          </button>
        </div>
        <div className="checkout-body">
          <div>
            <div className="sobre-field">
              <span>Evento</span>
              <strong>{props.eventTitle}</strong>
            </div>
            <div className="sobre-field">
              <span>Copias</span>
              <strong>{props.photoIds.length} en alta resolución</strong>
            </div>
          </div>
          <ul className="checkout-thumbs">
            {props.photoIds.map((id) => {
              const p = byId.get(id);
              const i = props.indexOf.get(id) ?? 0;
              return p ? (
                <li key={id}>
                  <img src={p.thumbUrl} alt={toma(i)} />
                  <button type="button" onClick={() => props.onRemove(id)} aria-label={`Sacar ${toma(i)}`}>
                    <X aria-hidden />
                  </button>
                </li>
              ) : null;
            })}
          </ul>
          <div className="checkout-total">
            <span className="sobre-label">
              Total a pagar
              <small>Te llegan sin marca de agua, por correo.</small>
            </span>
            <span className="sticker">{formatMoney(props.total)}</span>
          </div>
          <label className="field">
            <span>Tu nombre</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} autoComplete="name" />
          </label>
          <label className="field">
            <span>Correo (ahí te mandamos el enlace)</span>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" inputMode="email" />
          </label>
          {DEMO_MODE && <DemoPaymentHelp />}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </div>
        <div className="checkout-actions">
          <button className="btn btn-primary" disabled={busy || props.photoIds.length === 0}>
            {busy ? "Abriendo Mercado Pago…" : `Pagar ${formatMoney(props.total)} con Mercado Pago`}
          </button>
          <button type="button" className="btn btn-ghost" onClick={props.onClose}>
            Seguir eligiendo
          </button>
        </div>
      </form>
    </div>
  );
}
