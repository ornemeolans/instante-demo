import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // sharp y firebase-admin usan binarios/módulos nativos de Node: no se empaquetan.
  serverExternalPackages: ["sharp", "firebase-admin"],
  poweredByHeader: false,
};

export default nextConfig;
