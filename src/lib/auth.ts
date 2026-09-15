import "server-only";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { entry, save, remove, prune, storeConfigured } from "./admin-store";
import { hashToken, checkPassword, type Account, type Role } from "./admin-security";
export const COOKIE = "epureau_admin";
export type Identity = { id: string; name: string; email: string; role: Role };
type Session = { user: string; expires: number; bootstrap: string | null };
export function verifierMotDePasse(value: string) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return false;
  const a = Buffer.from(value), b = Buffer.from(password);
  return a.length === b.length && timingSafeEqual(a,b);
}
export async function authenticate(email: string, password: string): Promise<Identity | null> {
  const bootstrapEmail = (process.env.ADMIN_EMAIL || "admin@epureau-ci.com").toLowerCase();
  if (email === bootstrapEmail && verifierMotDePasse(password)) return { id: "owner", email, name: "Administrateur principal", role: "admin" };
  const account = await entry<Account>("users", email);
  if (!account?.value.active || !(await checkPassword(password, account.value.password))) return null;
  return { id: email, name: account.value.name, email, role: account.value.role };
}
export async function startSession(identity: Identity) {
  const token = randomBytes(32).toString("hex");
  await prune("sessions", new Date(Date.now() - 12 * 3600000).toISOString());
  await save("sessions", hashToken(token), { user: identity.id, expires: Date.now() + 12 * 3600000, bootstrap: identity.id === "owner" ? hashToken(process.env.ADMIN_PASSWORD || "") : null });
  return token;
}
export async function currentUser(): Promise<Identity | null> {
  if (!storeConfigured()) return null;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  const session = await entry<Session>("sessions", hashToken(token));
  if (!session || session.value.expires <= Date.now()) return null;
  if (session.value.user === "owner") {
    if (!process.env.ADMIN_PASSWORD || session.value.bootstrap !== hashToken(process.env.ADMIN_PASSWORD)) return null;
    return { id: "owner", name: "Administrateur principal", role: "admin", email: process.env.ADMIN_EMAIL || "admin@epureau-ci.com" };
  }
  const account = await entry<Account>("users", session.value.user);
  return account?.value.active ? { id: account.key, name: account.value.name, email: account.value.email, role: account.value.role } : null;
}
export async function estConnecte() { return Boolean(await currentUser()); }
export async function endSession() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (token && storeConfigured()) await remove("sessions", hashToken(token));
}
export function requestOrigin(req: Request) {
  const url = new URL(req.url);
  const host = req.headers.get("host");
  if (host && /^[a-zA-Z0-9.:[\]-]+$/.test(host)) url.host = host;
  return url.origin;
}
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  return Boolean(origin && origin === requestOrigin(req));
}
