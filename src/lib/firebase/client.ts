"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { connectStorageEmulator, getStorage, type FirebaseStorage } from "firebase/storage";

const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";

const config = useEmulators
  ? {
      // Con emuladores no hace falta un proyecto real: cualquier valor sirve.
      apiKey: "demo-api-key",
      authDomain: "demo-fotoventa.firebaseapp.com",
      projectId: "demo-fotoventa",
      storageBucket: "demo-fotoventa.appspot.com",
      appId: "demo-app",
    }
  : {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;

function app(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(config);
}

export function clientAuth(): Auth {
  if (!auth) {
    auth = getAuth(app());
    if (useEmulators) connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  }
  return auth;
}

export function clientStorage(): FirebaseStorage {
  if (!storage) {
    storage = getStorage(app());
    if (useEmulators) connectStorageEmulator(storage, "127.0.0.1", 9199);
  }
  return storage;
}
