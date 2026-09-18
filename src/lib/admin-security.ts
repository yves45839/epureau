import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash } from "node:crypto";
import { promisify } from "node:util";
const scrypt = promisify(scryptCallback);
export const roles = ["admin", "editeur", "commercial"] as const;
/** Domaine de messagerie autorisé à demander un accès à l'administration. */
export const DOMAINE_AUTORISE = "epureau-ci.com";
/** Comptes propriétaires du site : ils ne peuvent être ni modifiés ni désactivés par un autre administrateur. */
export function superAdmins() {
  return (process.env.ADMIN_SUPER_EMAILS || "roland@label-ci.com")
    .split(",").map(v => v.trim().toLowerCase()).filter(Boolean);
}
export function estSuperAdmin(email: string) {
  return superAdmins().includes((email || "").trim().toLowerCase());
}
export function emailAutorise(email: string) {
  const valeur = (email || "").trim().toLowerCase();
  return valeur.endsWith("@" + DOMAINE_AUTORISE) || estSuperAdmin(valeur);
}
/** Rôle attribué à un compte créé par inscription, en attente d'activation. */
export const ROLE_PAR_DEFAUT: Role = "commercial";
export type Role = typeof roles[number];
export type Account = { email: string; name: string; role: Role; password: string; active: boolean; cree_le?: string; demande?: boolean };
export function may(role: Role, section: string) {
  if (role === "admin") return true;
  if (section === "dashboard") return true;
  if (section === "audience") return true;
  return role === "editeur" ? ["pages","projects","products","media","brochures","blog"].includes(section) : section === "requests";
}
export function hashToken(token: string) { return createHash("sha256").update(token).digest("hex"); }
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = await scrypt(password, salt, 64) as Buffer;
  return salt + ":" + hash.toString("hex");
}
export async function checkPassword(password: string, stored: string) {
  const [salt, digest] = stored.split(":");
  if (!salt || !digest || !/^[a-f0-9]{128}$/.test(digest)) return false;
  const actual = await scrypt(password, salt, 64) as Buffer;
  return timingSafeEqual(actual, Buffer.from(digest, "hex"));
}
export function csvCell(value: unknown) {
  let text = String(value ?? "");
  if (/^[\s]*[=+@-]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
}
export function safePublicUrl(value: string) {
  return /^\/(?!\/)[a-zA-Z0-9_./%?#=&-]+$/.test(value) || /^https:\/\//.test(value);
}
