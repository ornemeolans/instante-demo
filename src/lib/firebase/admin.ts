import "server-only";

import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

export const USE_EMULATORS = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";
export const EMULATOR_PROJECT_ID = "demo-fotoventa";
export const EMULATOR_STORAGE_HOST = "127.0.0.1:9199";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}

// Inicialización perezosa: así `next build` no necesita credenciales.
function adminApp(): App {
  if (getApps().length) return getApp();

  if (USE_EMULATORS) {
    // El Admin SDK detecta los emuladores por estas variables.
    process.env.FIREBASE_AUTH_EMULATOR_HOST ??= "127.0.0.1:9099";
    process.env.FIRESTORE_EMULATOR_HOST ??= "127.0.0.1:8080";
    process.env.FIREBASE_STORAGE_EMULATOR_HOST ??= EMULATOR_STORAGE_HOST;
    return initializeApp({
      projectId: EMULATOR_PROJECT_ID,
      storageBucket: `${EMULATOR_PROJECT_ID}.appspot.com`,
    });
  }

  return initializeApp({
    credential: cert({
      projectId: required("FIREBASE_PROJECT_ID"),
      clientEmail: required("FIREBASE_CLIENT_EMAIL"),
      privateKey: required("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
    }),
    // Opcional: con Supabase Storage (demo gratuita) no se usa Firebase Storage.
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined,
  });
}

export const adminAuth = () => getAuth(adminApp());
export const db = () => getFirestore(adminApp());
export const bucket = () => getStorage(adminApp()).bucket();
