"use client";

import { useActionState, useState, useTransition } from "react";
import { Eye, EyeOff, Send, Trash2 } from "lucide-react";
import {
  createEvent,
  deletePhoto,
  resendOrderEmail,
  setPublished,
  updateEvent,
  updateProfile,
  type FormState,
} from "./actions";
import type { PhotoEvent } from "@/lib/types";

function Feedback({ state }: { state: FormState }) {
  if (state.error) return <p className="form-error" role="alert">{state.error}</p>;
  if (state.ok) return <p className="form-ok" role="status">{state.ok}</p>;
  return null;
}

export function CreateEventForm() {
  const [state, action, pending] = useActionState(createEvent, {});
  const today = new Date().toISOString().slice(0, 10);
  return (
    <form action={action} className="panel stack">
      <h2>Nuevo evento</h2>
      <label className="field">
        <span>Nombre</span>
        <input className="input" name="title" required maxLength={120} placeholder="Maratón de Rosario 2026" />
      </label>
      <div className="row">
        <label className="field">
          <span>Fecha</span>
          <input className="input" name="date" type="date" defaultValue={today} required />
        </label>
        <label className="field">
          <span>Precio por foto (ARS)</span>
          <input className="input" name="pricePerPhoto" type="number" min={1} step={1} required defaultValue={5000} inputMode="numeric" />
        </label>
      </div>
      <label className="field">
        <span>Descripción (opcional)</span>
        <textarea className="input" name="description" rows={2} maxLength={1000} placeholder="Largada 8 h, Monumento a la Bandera" />
      </label>
      <Feedback state={state} />
      <button className="btn btn-primary" disabled={pending}>
        {pending ? "Creando…" : "Crear evento"}
      </button>
    </form>
  );
}

export function EditEventForm({ event }: { event: PhotoEvent }) {
  const [state, action, pending] = useActionState(updateEvent.bind(null, event.id), {});
  return (
    <form action={action} className="panel stack">
      <h2>Datos del evento</h2>
      <label className="field">
        <span>Nombre</span>
        <input className="input" name="title" required maxLength={120} defaultValue={event.title} />
      </label>
      <label className="field">
        <span>Precio por foto (ARS)</span>
        <input className="input" name="pricePerPhoto" type="number" min={1} step={1} required defaultValue={event.pricePerPhoto} inputMode="numeric" />
      </label>
      <label className="field">
        <span>Descripción</span>
        <textarea className="input" name="description" rows={2} maxLength={1000} defaultValue={event.description} />
      </label>
      <Feedback state={state} />
      <button className="btn" disabled={pending}>
        {pending ? "Guardando…" : "Guardar cambios"}
      </button>
    </form>
  );
}

export function PublishToggle({ eventId, published }: { eventId: string; published: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      className={`btn ${published ? "" : "btn-sign"}`}
      disabled={pending}
      onClick={() => start(() => setPublished(eventId, !published))}
    >
      {published ? <EyeOff aria-hidden /> : <Eye aria-hidden />}
      {pending ? "Guardando…" : published ? "Despublicar galería" : "Publicar galería"}
    </button>
  );
}

export function DeletePhotoButton({ eventId, photoId }: { eventId: string; photoId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      className="photo-delete"
      aria-label="Eliminar foto de la galería"
      disabled={pending}
      onClick={() => {
        if (confirm("¿Eliminar esta foto de la galería? Las compras ya hechas la conservan.")) {
          start(() => deletePhoto(eventId, photoId));
        }
      }}
    >
      <Trash2 aria-hidden />
    </button>
  );
}

export function ProfileForm({ displayName, watermarkText }: { displayName: string; watermarkText: string }) {
  const [state, action, pending] = useActionState(updateProfile, {});
  return (
    <form action={action} className="panel stack">
      <label className="field">
        <span>Nombre visible</span>
        <input className="input" name="displayName" required maxLength={60} defaultValue={displayName} />
      </label>
      <label className="field">
        <span>Texto de la marca de agua</span>
        <input className="input" name="watermarkText" required maxLength={40} defaultValue={watermarkText} />
      </label>
      <Feedback state={state} />
      <button className="btn btn-primary" disabled={pending}>
        {pending ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}

export function ResendEmailButton({ orderId }: { orderId: string }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <button
      className="btn btn-small"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await resendOrderEmail(orderId);
          setMsg(r.error ?? r.ok ?? null);
        })
      }
    >
      <Send aria-hidden />
      {pending ? "Enviando…" : (msg ?? "Reenviar enlace")}
    </button>
  );
}
