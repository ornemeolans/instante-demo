"use client";

import { LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { clientAuth } from "@/lib/firebase/client";

export function LogoutButton() {
  async function logout() {
    await fetch("/api/auth/session", { method: "DELETE" });
    await signOut(clientAuth()).catch(() => {});
    window.location.href = "/login";
  }
  return (
    <button className="btn btn-small" onClick={logout}>
      <LogOut aria-hidden /> Salir
    </button>
  );
}
