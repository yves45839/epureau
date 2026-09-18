import { NextResponse } from "next/server";
import { z } from "zod";
import { sameOrigin, requestOrigin } from "@/lib/auth";
import { entry, entries, save, prune, storeConfigured } from "@/lib/admin-store";
import { hashPassword, hashToken, emailAutorise, estSuperAdmin, ROLE_PAR_DEFAUT, type Account } from "@/lib/admin-security";

export const runtime = "nodejs";

const Schema = z.object({
  nom: z.string().trim().min(2).max(120),
  email: z.email().max(160),
  motdepasse: z.string().min(12).max(200),
  confirmation: z.string().max(200),
});

/**
 * Demande d'accès à l'administration (EF-25).
 * Réservée aux adresses @epureau-ci.com : le compte est créé inactif, avec le rôle
 * Commercial, et n'ouvre l'administration qu'une fois activé par un administrateur.
 */
export async function POST(req: Request) {
  const base = new URL(requestOrigin(req));
  const retour = (params: string) => NextResponse.redirect(new URL("/admin/inscription?" + params, base), 303);
  if (!sameOrigin(req)) return new Response("Origine refusée", { status: 403 });
  if (!storeConfigured()) return retour("e=config");
  try {
    const form = await req.formData();
    const brut = {
      nom: String(form.get("nom") ?? ""),
      email: String(form.get("email") ?? "").trim().toLowerCase().slice(0, 160),
      motdepasse: String(form.get("motdepasse") ?? ""),
      confirmation: String(form.get("confirmation") ?? ""),
    };
    if (!emailAutorise(brut.email)) return retour("e=domaine");
    const parse = Schema.safeParse(brut);
    if (!parse.success) return retour("e=champs");
    const d = parse.data;
    if (d.motdepasse !== d.confirmation) return retour("e=confirmation");

    // Limitation : 5 demandes par heure et par adresse.
    const seau = "signup:" + hashToken(d.email);
    const maintenant = Date.now();
    await prune("attempts", new Date(maintenant - 3600000).toISOString());
    const essai = await entry<{ count: number; until: number }>("attempts", seau);
    if (essai && essai.value.until > maintenant && essai.value.count >= 5) return retour("e=rate");
    await save("attempts", seau, {
      count: essai && essai.value.until > maintenant ? essai.value.count + 1 : 1,
      until: essai && essai.value.until > maintenant ? essai.value.until : maintenant + 3600000,
    }, essai?.revision ?? 0);

    // Premier compte du site : le super administrateur est actif immédiatement.
    const comptes = await entries<Account>("users");
    const premierAdmin = estSuperAdmin(d.email) && !comptes.some(c => c.value.role === "admin" && c.value.active);
    const compte: Account = {
      email: d.email,
      name: d.nom,
      role: premierAdmin ? "admin" : ROLE_PAR_DEFAUT,
      password: await hashPassword(d.motdepasse),
      active: premierAdmin,
      cree_le: new Date().toISOString(),
      demande: !premierAdmin,
    };
    try {
      await save("users", d.email, compte, 0);
      await save("audit", crypto.randomUUID(), {
        actor: d.email,
        action: premierAdmin ? "Création du compte super administrateur" : "Demande d’accès à l’administration (en attente d’activation)",
        date: new Date().toISOString(),
      });
    } catch {
      // Adresse déjà enregistrée : même réponse, pour ne rien révéler.
      return NextResponse.redirect(new URL("/admin/login?ok=attente", base), 303);
    }
    return NextResponse.redirect(new URL("/admin/login?ok=" + (premierAdmin ? "admin" : "attente"), base), 303);
  } catch {
    return retour("e=service");
  }
}