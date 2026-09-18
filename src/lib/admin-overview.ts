import "server-only";
import { entries } from "./admin-store";
import { editableDocuments, sectionNames } from "./cms";
import { requestList } from "./admin-requests";
import { rapport } from "./audience";
import { may, type Account } from "./admin-security";
import type { Identity } from "./auth";
import type { Document } from "@/content/admin-types";

/** Rubriques de contenu suivies sur le tableau de bord. */
const RUBRIQUES = ["pages", "projects", "products", "media", "brochures", "blog"] as const;

export type Overview = {
  demandes: { total: number; mois: number; nouvelles: number; encours: number; traitees: number };
  audience: { pages: number; visiteurs: number; conversions: number; courbe: { date: string; visites: number }[]; sources: { libelle: string; valeur: number; part: number }[] } | null;
  contenus: { section: string; nom: string; publies: number; enAttente: number }[];
  comptes: { actifs: number; enAttente: number } | null;
  journal: { actor: string; action: string; date: string }[];
};

const modifie = (doc: Document) =>
  !doc.deleted && (!doc.published || JSON.stringify(doc.draft) !== JSON.stringify(doc.published));

export async function buildOverview(user: Identity): Promise<Overview> {
  const mois = new Date().toISOString().slice(0, 7);

  const demandes = may(user.role, "requests") ? await requestList() : [];
  const compte = (statut: string) => demandes.filter(d => d.value.statut === statut).length;

  const contenus = [];
  for (const section of RUBRIQUES) {
    if (!may(user.role, section)) continue;
    try {
      const docs = await editableDocuments(section);
      contenus.push({
        section,
        nom: sectionNames[section],
        publies: docs.filter(d => d.value.published && !d.value.deleted).length,
        enAttente: docs.filter(d => modifie(d.value)).length,
      });
    } catch { /* rubrique momentanément illisible : on l'omet plutôt que de bloquer le tableau de bord */ }
  }

  let comptes: Overview["comptes"] = null;
  if (may(user.role, "users")) {
    const users = await entries<Account>("users");
    comptes = { actifs: users.filter(u => u.value.active).length, enAttente: users.filter(u => !u.value.active).length };
  }

  let audience: Overview["audience"] = null;
  if (may(user.role, "audience")) {
    try {
      const r = await rapport(30);
      audience = {
        pages: r.totaux.pages,
        visiteurs: r.totaux.visiteurs,
        conversions: r.totaux.conversions,
        courbe: r.courbe.slice(-14).map(j => ({ date: j.date, visites: j.visites })),
        sources: r.sources.slice(0, 4),
      };
    } catch { /* mesure indisponible */ }
  }

  let journal: Overview["journal"] = [];
  if (may(user.role, "audit")) {
    journal = (await entries<{ actor: string; action: string; date: string }>("audit"))
      .map(r => r.value)
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
      .slice(0, 6);
  }

  return {
    demandes: {
      total: demandes.length,
      mois: demandes.filter(d => d.value.cree_le.startsWith(mois)).length,
      nouvelles: compte("nouvelle"),
      encours: compte("en_cours"),
      traitees: compte("traitee"),
    },
    audience,
    contenus,
    comptes,
    journal,
  };
}
