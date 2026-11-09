"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithCustomToken,
  signInWithPopup,
  updateProfile,
  type UserCredential,
} from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";
import { Wordmark } from "@/components/Wordmark";
import { Plate } from "@/components/Cyanotype";

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

const ERRORS: Record<string, string> = {
  "auth/invalid-credential": "Correo o contraseña incorrectos.",
  "auth/email-already-in-use": "Ya existe una cuenta con ese correo. Probá ingresar.",
  "auth/weak-password": "La contraseña necesita al menos 6 caracteres.",
  "auth/popup-closed-by-user": "Se cerró la ventana de Google antes de terminar.",
  "auth/too-many-requests": "Demasiados intentos. Esperá unos minutos y volvé a probar.",
  "auth/network-request-failed": "No hay conexión. Revisá tu internet y volvé a probar.",
};

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function startSession(cred: UserCredential, displayName?: string) {
    const idToken = await cred.user.getIdToken();
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, displayName }),
    });
    if (!res.ok) throw new Error((await res.json()).error ?? "No se pudo iniciar sesión");
    router.replace("/dashboard");
    router.refresh();
  }

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      const code = (e as { code?: string }).code;
      setError((code && ERRORS[code]) || (e as Error).message);
      setBusy(false);
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      const auth = clientAuth();
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name });
        await startSession(cred, name);
      } else {
        await startSession(await signInWithEmailAndPassword(auth, email, password));
      }
    });
  };

  const onGoogle = () => run(async () => startSession(await signInWithPopup(clientAuth(), new GoogleAuthProvider())));

  // Cuenta demo compartida: el servidor firma un custom token (sin contraseña pública).
  const onDemo = () =>
    run(async () => {
      const res = await fetch("/api/auth/demo", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "No se pudo entrar con la cuenta demo");
      await startSession(await signInWithCustomToken(clientAuth(), data.token), data.displayName);
    });

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
            <h1 className="display-type">{mode === "login" ? "Hola de nuevo" : "Creá tu cuenta"}</h1>
            {DEMO_MODE && (
              <div className="demo-access">
                <p>¿Querés recorrer el panel sin registrarte?</p>
                <button className="btn btn-primary" onClick={onDemo} disabled={busy}>
                  Entrar con la cuenta demo
                </button>
                <p className="small">Es una cuenta compartida: lo que subas lo pueden ver otros visitantes.</p>
              </div>
            )}
            <p>
              {mode === "login"
                ? "Entrá para subir fotos, publicar tus eventos y ver tus ventas."
                : "Tu nombre va a aparecer en la marca de agua de todas tus fotos."}
            </p>
            <form onSubmit={onSubmit} className="stack">
              {mode === "signup" && (
                <label className="field">
                  <span>Nombre o estudio</span>
                  <input className="input" value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} autoComplete="name" />
                </label>
              )}
              <label className="field">
                <span>Correo</span>
                <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" inputMode="email" />
              </label>
              <label className="field">
                <span>Contraseña</span>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </label>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <button className="btn btn-primary" disabled={busy}>
                {busy ? "Un momento…" : mode === "login" ? "Ingresar" : "Crear cuenta"}
              </button>
            </form>
            <div className="divider">o</div>
            <button className="btn" onClick={onGoogle} disabled={busy}>
              <svg viewBox="0 0 24 24" aria-hidden>
                <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.3 12 2.3 6.6 2.3 2.3 6.7 2.3 12s4.3 9.7 9.7 9.7c5.6 0 9.3-3.9 9.3-9.5 0-.6-.1-1.1-.2-1.6H12z" />
              </svg>
              Continuar con Google
            </button>
            <p className="small">
              {mode === "login" ? "¿No tenés cuenta? " : "¿Ya tenés cuenta? "}
              <button className="link-btn" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
                {mode === "login" ? "Creala gratis" : "Ingresá"}
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
