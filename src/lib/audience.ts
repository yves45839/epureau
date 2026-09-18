import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { db } from "./db";
import { entry, entries, save, remove, localStore, storeConfigured } from "./admin-store";

/**
 * Mesure d'audience interne (ET-19 / EF-30 du cahier des charges).
 *
 * Principe : la mesure est « first party » — aucune donnée ne sort du site, aucun
 * cookie n'est déposé sur le poste du visiteur et l'adresse IP n'est jamais
 * enregistrée. Elle sert uniquement à dériver, avec un sel tiré au hasard et
 * renouvelé chaque jour, une empreinte anonyme qui permet de compter les
 * visiteurs et de reconstituer les sessions de la journée. Le sel de la veille
 * étant détruit, deux visites séparées par un jour ne peuvent plus être reliées.
 */

export type Visite = {
  occurred_at: string;
  visitor: string;
  session: string;
  kind: string;
  path: string;
  title: string;
  source: string;
  referrer: string;
  pays: string;
  ville: string;
  region: string;
  appareil: string;
  navigateur: string;
  systeme: string;
  langue: string;
};

export const CONSERVATION_JOURS = 400;
const SESSION_MS = 30 * 60 * 1000;

/* ------------------------------------------------------------------ */
/* Dérivations — fonctions pures, testées hors base                    */
/* ------------------------------------------------------------------ */

export function empreinte(sel: string, ip: string, agent: string) {
  return createHash("sha256").update(sel + "|" + ip + "|" + agent).digest("hex").slice(0, 32);
}

const ROBOTS = /bot|crawl|spider|slurp|preview|monitor|lighthouse|headless|curl|wget|python-requests|facebookexternalhit|semrush|ahrefs|bingpreview|pingdom|uptime/i;
export function estRobot(agent: string) {
  return !agent || agent.length < 12 || ROBOTS.test(agent);
}

const MOTEURS = /google|bing|yahoo|duckduckgo|qwant|ecosia|yandex|baidu|brave/i;
const SOCIAUX = /facebook|instagram|linkedin|twitter|^t\.co$|x\.com|youtube|tiktok|whatsapp|telegram|pinterest/i;
export function sourceDepuis(referent: string, hote: string) {
  if (!referent) return "Accès direct";
  let domaine = "";
  try { domaine = new URL(referent).hostname.replace(/^www\./, ""); } catch { return "Accès direct"; }
  if (!domaine || (hote && domaine === hote.replace(/^www\./, ""))) return "Accès direct";
  if (MOTEURS.test(domaine)) return "Recherche";
  if (SOCIAUX.test(domaine)) return "Réseaux sociaux";
  return "Site référent";
}

export function domaineReferent(referent: string, hote: string) {
  try {
    const domaine = new URL(referent).hostname.replace(/^www\./, "");
    return !domaine || domaine === hote.replace(/^www\./, "") ? "" : domaine;
  } catch { return ""; }
}

export function appareilDepuis(agent: string) {
  if (/ipad|tablet|playbook|silk|android(?!.*mobile)/i.test(agent)) return "Tablette";
  if (/mobi|iphone|ipod|android|blackberry|windows phone/i.test(agent)) return "Mobile";
  return "Ordinateur";
}

export function navigateurDepuis(agent: string) {
  if (/edg\//i.test(agent)) return "Edge";
  if (/opr\/|opera/i.test(agent)) return "Opera";
  if (/samsungbrowser/i.test(agent)) return "Samsung Internet";
  if (/firefox|fxios/i.test(agent)) return "Firefox";
  if (/chrome|crios/i.test(agent)) return "Chrome";
  if (/safari/i.test(agent)) return "Safari";
  return "Autre";
}

export function systemeDepuis(agent: string) {
  if (/windows/i.test(agent)) return "Windows";
  if (/iphone|ipad|ipod|ios/i.test(agent)) return "iOS";
  if (/android/i.test(agent)) return "Android";
  if (/mac os x|macintosh/i.test(agent)) return "macOS";
  if (/linux|ubuntu/i.test(agent)) return "Linux";
  return "Autre";
}

const PAYS: Record<string, string> = { CI: "Côte d'Ivoire", FR: "France", SN: "Sénégal", ML: "Mali", BF: "Burkina Faso", GH: "Ghana", NG: "Nigeria", TG: "Togo", BJ: "Bénin", GN: "Guinée", CM: "Cameroun", GA: "Gabon", CD: "RD Congo", MA: "Maroc", TN: "Tunisie", DZ: "Algérie", BE: "Belgique", CH: "Suisse", CA: "Canada", US: "États-Unis", GB: "Royaume-Uni", DE: "Allemagne", ES: "Espagne", IT: "Italie", NL: "Pays-Bas", IN: "Inde", CN: "Chine", ZA: "Afrique du Sud" };
export function nomPays(code: string) {
  const c = (code || "").toUpperCase();
  return PAYS[c] || c || "Inconnu";
}

/* ------------------------------------------------------------------ */
/* Agrégation — fonction pure, testée sur des lignes fabriquées        */
/* ------------------------------------------------------------------ */

export type Palier = { libelle: string; valeur: number; part: number };
export type Rapport = {
  jours: number;
  debut: string;
  totaux: { pages: number; visiteurs: number; sessions: number; conversions: number; duree: number; rebond: number; parPage: number };
  courbe: { date: string; visites: number; visiteurs: number }[];
  pages: Palier[];
  entrees: Palier[];
  sorties: Palier[];
  sources: Palier[];
  referents: Palier[];
  pays: Palier[];
  villes: Palier[];
  appareils: Palier[];
  navigateurs: Palier[];
  systemes: Palier[];
  conversions: Palier[];
  dernieres: { date: string; path: string; pays: string; ville: string; source: string; appareil: string; navigateur: string }[];
};

function classement(valeurs: string[], limite = 8): Palier[] {
  const total = valeurs.length;
  const compte = new Map<string, number>();
  for (const v of valeurs) compte.set(v || "Inconnu", (compte.get(v || "Inconnu") ?? 0) + 1);
  return [...compte.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limite)
    .map(([libelle, valeur]) => ({ libelle, valeur, part: total ? Math.round((valeur / total) * 1000) / 10 : 0 }));
}

export function resume(lignes: Visite[], jours: number): Rapport {
  const debut = new Date(Date.now() - jours * 86400000);
  const rows = lignes
    .filter(l => new Date(l.occurred_at) >= debut)
    .sort((a, b) => a.occurred_at.localeCompare(b.occurred_at));
  const vues = rows.filter(l => l.kind === "page");
  const conversions = rows.filter(l => l.kind === "conversion");

  const sessions = new Map<string, Visite[]>();
  for (const l of vues) sessions.set(l.session, [...(sessions.get(l.session) ?? []), l]);

  let duree = 0, mesurees = 0, rebonds = 0;
  for (const evenements of sessions.values()) {
    if (evenements.length < 2) { rebonds++; continue; }
    duree += new Date(evenements[evenements.length - 1].occurred_at).getTime() - new Date(evenements[0].occurred_at).getTime();
    mesurees++;
  }

  const parJour = new Map<string, { visites: number; visiteurs: Set<string> }>();
  for (let i = jours - 1; i >= 0; i--) {
    parJour.set(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10), { visites: 0, visiteurs: new Set() });
  }
  for (const l of vues) {
    const jour = l.occurred_at.slice(0, 10);
    const seau = parJour.get(jour);
    if (!seau) continue;
    seau.visites++; seau.visiteurs.add(l.visitor);
  }

  return {
    jours,
    debut: debut.toISOString(),
    totaux: {
      pages: vues.length,
      visiteurs: new Set(vues.map(l => l.visitor)).size,
      sessions: sessions.size,
      conversions: conversions.length,
      duree: mesurees ? Math.round(duree / mesurees / 1000) : 0,
      rebond: sessions.size ? Math.round((rebonds / sessions.size) * 1000) / 10 : 0,
      parPage: sessions.size ? Math.round((vues.length / sessions.size) * 10) / 10 : 0,
    },
    courbe: [...parJour.entries()].map(([date, seau]) => ({ date, visites: seau.visites, visiteurs: seau.visiteurs.size })),
    pages: classement(vues.map(l => l.path)),
    entrees: classement([...sessions.values()].map(e => e[0].path)),
    sorties: classement([...sessions.values()].map(e => e[e.length - 1].path)),
    sources: classement(vues.map(l => l.source), 5),
    referents: classement(vues.map(l => l.referrer).filter(Boolean)),
    pays: classement(vues.map(l => l.pays)),
    villes: classement(vues.map(l => l.ville).filter(Boolean)),
    appareils: classement(vues.map(l => l.appareil), 4),
    navigateurs: classement(vues.map(l => l.navigateur), 6),
    systemes: classement(vues.map(l => l.systeme), 6),
    conversions: classement(conversions.map(l => l.title || l.path), 6),
    dernieres: vues.slice(-25).reverse().map(l => ({ date: l.occurred_at, path: l.path, pays: l.pays, ville: l.ville, source: l.source, appareil: l.appareil, navigateur: l.navigateur })),
  };
}

/* ------------------------------------------------------------------ */
/* Persistance                                                         */
/* ------------------------------------------------------------------ */

let schemaPret = false;
async function connexion() {
  const sql = db();
  if (!sql) return null;
  if (!schemaPret) {
    await sql`create table if not exists audience_events (
      id bigserial primary key,
      occurred_at timestamptz not null default now(),
      visitor text not null,
      session text not null,
      kind text not null default 'page',
      path text not null default '',
      title text not null default '',
      source text not null default '',
      referrer text not null default '',
      pays text not null default '',
      ville text not null default '',
      region text not null default '',
      appareil text not null default '',
      navigateur text not null default '',
      systeme text not null default '',
      langue text not null default ''
    )`;
    await sql`alter table audience_events enable row level security`;
    await sql`create index if not exists audience_events_date_idx on audience_events (occurred_at desc)`;
    await sql`create index if not exists audience_events_visitor_idx on audience_events (visitor, occurred_at desc)`;
    schemaPret = true;
  }
  return sql;
}

/** Sel du jour : tiré au hasard, conservé 48 h, jamais exposé. */
export async function selDuJour(jour = new Date().toISOString().slice(0, 10)) {
  const existant = await entry<{ valeur: string }>("audience_salt", jour);
  if (existant) return existant.value.valeur;
  const valeur = randomUUID().replace(/-/g, "");
  try {
    await save("audience_salt", jour, { valeur }, 0);
    for (const vieux of await entries<{ valeur: string }>("audience_salt")) {
      if (vieux.key < new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10)) await remove("audience_salt", vieux.key);
    }
    return valeur;
  } catch {
    return (await entry<{ valeur: string }>("audience_salt", jour))?.value.valeur ?? valeur;
  }
}

async function sessionDe(visitor: string) {
  const limite = new Date(Date.now() - SESSION_MS).toISOString();
  if (localStore()) {
    const precedent = (await entries<Visite>("audience"))
      .filter(l => l.value.visitor === visitor && l.value.occurred_at >= limite)
      .sort((a, b) => b.value.occurred_at.localeCompare(a.value.occurred_at))[0];
    return precedent?.value.session ?? randomUUID();
  }
  const sql = await connexion();
  if (!sql) return randomUUID();
  const rows = await sql`select session from audience_events where visitor=${visitor} and occurred_at > ${limite} order by occurred_at desc limit 1`;
  return (rows[0]?.session as string) ?? randomUUID();
}

export async function enregistrer(v: Omit<Visite, "occurred_at" | "session">) {
  if (!storeConfigured()) return false;
  const session = await sessionDe(v.visitor);
  const ligne: Visite = { ...v, session, occurred_at: new Date().toISOString() };
  if (localStore()) { await save("audience", randomUUID(), ligne, 0); return true; }
  const sql = await connexion();
  if (!sql) return false;
  await sql`insert into audience_events ${sql(ligne as unknown as Record<string, string>, "occurred_at", "visitor", "session", "kind", "path", "title", "source", "referrer", "pays", "ville", "region", "appareil", "navigateur", "systeme", "langue")}`;
  if (Math.random() < 0.01) await sql`delete from audience_events where occurred_at < now() - ${CONSERVATION_JOURS + " days"}::interval`;
  return true;
}

export async function rapport(jours = 30): Promise<Rapport> {
  const borne = Math.min(Math.max(Math.round(jours) || 30, 1), 365);
  if (!storeConfigured()) return resume([], borne);
  if (localStore()) return resume((await entries<Visite>("audience")).map(l => l.value), borne);
  const sql = await connexion();
  if (!sql) return resume([], borne);
  const rows = await sql`select occurred_at::text as occurred_at, visitor, session, kind, path, title, source, referrer, pays, ville, region, appareil, navigateur, systeme, langue
    from audience_events where occurred_at > now() - ${borne + " days"}::interval order by occurred_at asc limit 200000`;
  return resume(rows as unknown as Visite[], borne);
}
