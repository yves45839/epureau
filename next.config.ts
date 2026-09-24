import type { NextConfig } from "next";

const imageOrigin = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).origin : "";

const nextConfig: NextConfig = {
  // Préserve l’hôte des réécritures FR/EN, y compris 127.0.0.1 en développement.
  env: { NEXT_PUBLIC_SITE_IMAGE_ORIGIN: imageOrigin },
  images: { remotePatterns: imageOrigin ? [new URL(`${imageOrigin}/storage/v1/object/public/site-media/**`)] : [] },
  skipProxyUrlNormalize: true,
  // Permet les vérifications locales sans interrompre un aperçu déjà ouvert.
  distDir: process.env.EPUREAU_BUILD_DIR || ".next",
};

export default nextConfig;
