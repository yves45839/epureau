import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const COOKIE = "epureau_admin";

export function jeton() {
  const mdp = process.env.ADMIN_PASSWORD;
  if (!mdp) return null;
  return createHmac("sha256", mdp).update("epureau-tableau-de-bord").digest("hex");
}

export function verifierMotDePasse(saisi: string) {
  const mdp = process.env.ADMIN_PASSWORD;
  if (!mdp) return false;
  const a = Buffer.from(saisi);
  const b = Buffer.from(mdp);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function estConnecte() {
  const attendu = jeton();
  if (!attendu) return false;
  const c = await cookies();
  return c.get(COOKIE)?.value === attendu;
}
