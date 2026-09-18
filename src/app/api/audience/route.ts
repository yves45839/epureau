import { z } from "zod";
import { empreinte, estRobot, selDuJour, sourceDepuis, domaineReferent, appareilDepuis, navigateurDepuis, systemeDepuis, nomPays, enregistrer } from "@/lib/audience";

export const runtime = "nodejs";

const Schema = z.object({
  chemin: z.string().trim().max(300).default("/"),
  titre: z.string().trim().max(200).default(""),
  referent: z.string().trim().max(400).default(""),
  langue: z.string().trim().max(20).default(""),
  type: z.enum(["page", "conversion"]).default("page"),
  libelle: z.string().trim().max(120).default(""),
});

/** Adresse IP : utilisée uniquement pour dériver l'empreinte anonyme, jamais stockée. */
function adresse(req: Request) {
  const entete = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || req.headers.get("x-vercel-forwarded-for") || "";
  return entete.split(",")[0].trim() || "inconnue";
}

function geo(req: Request) {
  const lire = (nom: string) => {
    const brut = req.headers.get(nom) || "";
    try { return decodeURIComponent(brut).slice(0, 80); } catch { return brut.slice(0, 80); }
  };
  return {
    pays: nomPays(lire("x-vercel-ip-country") || lire("x-nf-client-connection-country") || lire("cf-ipcountry")),
    ville: lire("x-vercel-ip-city"),
    region: lire("x-vercel-ip-country-region"),
  };
}

export async function POST(req: Request) {
  try {
    const agent = req.headers.get("user-agent") || "";
    if (estRobot(agent)) return new Response(null, { status: 204 });
    const texte = await req.text();
    if (texte.length > 4000) return new Response(null, { status: 204 });
    const parse = Schema.safeParse(JSON.parse(texte));
    if (!parse.success) return new Response(null, { status: 204 });
    const d = parse.data;
    const hote = new URL(req.url).hostname;
    const { pays, ville, region } = geo(req);
    await enregistrer({
      visitor: empreinte(await selDuJour(), adresse(req), agent),
      kind: d.type,
      path: d.chemin.startsWith("/") ? d.chemin : "/",
      title: d.type === "conversion" ? d.libelle : d.titre,
      source: sourceDepuis(d.referent, hote),
      referrer: domaineReferent(d.referent, hote),
      pays, ville, region,
      appareil: appareilDepuis(agent),
      navigateur: navigateurDepuis(agent),
      systeme: systemeDepuis(agent),
      langue: d.langue.slice(0, 10),
    });
  } catch {
    // La mesure d'audience ne doit jamais perturber la navigation.
  }
  return new Response(null, { status: 204 });
}
