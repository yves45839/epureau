import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permet les vérifications locales sans interrompre un aperçu déjà ouvert.
  distDir: process.env.EPUREAU_BUILD_DIR || ".next",
};

export default nextConfig;
