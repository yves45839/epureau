import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Préserve l’hôte des réécritures FR/EN, y compris 127.0.0.1 en développement.
  skipProxyUrlNormalize: true,
  // Permet les vérifications locales sans interrompre un aperçu déjà ouvert.
  distDir: process.env.EPUREAU_BUILD_DIR || ".next",
};

export default nextConfig;
