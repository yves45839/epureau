import { NextResponse } from "next/server";
import { z } from "zod";
import { recordRequest } from "@/lib/admin-requests";
import { envoyerDemande } from "@/lib/mail";
import { objetsDemande } from "@/content/site";

export const runtime = "nodejs";

const Schema = z.object({
  nom: z.string().trim().min(2, "Merci d'indiquer votre nom.").max(120),
  societe: z.string().trim().min(2, "Merci d'indiquer votre société.").max(160),
  email: z.string().trim().email("L'adresse e-mail semble incorrecte.").max(160),
  telephone: z.string().trim().max(40).optional().default(""),
  objet: z.enum(objetsDemande as [string, ...string[]]).catch(objetsDemande[0]),
  besoin: z.string().trim().min(10, "Décrivez votre besoin en quelques mots.").max(4000),
  site: z.string().optional().default(""), // piège à robots
});

export async function POST(req: Request) {
  let brut: unknown;
  try {
    const text = await req.text();
    if (text.length > 16000) return NextResponse.json({message:"Votre demande est trop longue."},{status:413});
    brut = JSON.parse(text);
  } catch {
    return NextResponse.json({ message: "Requête invalide." }, { status: 400 });
  }

  const parse = Schema.safeParse(brut);
  if (!parse.success) {
    return NextResponse.json(
      { message: parse.error.issues[0]?.message ?? "Formulaire incomplet." },
      { status: 422 },
    );
  }
  const d = parse.data;

  // Champ piège rempli : on répond succès sans rien traiter.
  if (d.site) return NextResponse.json({ ok: true });

  let enregistre = false;
  try {
    enregistre = await recordRequest({ nom: d.nom, societe: d.societe, email: d.email, telephone: d.telephone, objet: d.objet, besoin: d.besoin, source: "site" });
  } catch (e) {
    console.error("[cotation] enregistrement impossible", e);
  }

  try {
    const livraison = await envoyerDemande(d);
    if (!livraison.envoye && !enregistre) {
      return NextResponse.json({ message: "Envoi impossible pour le moment." }, { status: 503 });
    }
  } catch (e) {
    console.error("[cotation] envoi e-mail impossible", e);
    if (!enregistre) {
      return NextResponse.json(
        { message: "Envoi impossible pour le moment." },
        { status: 502 },
      );
    }
  }

  return NextResponse.json({ ok: true, enregistre });
}
