import { NextResponse } from "next/server";
import { z } from "zod";
import { assurerSchema } from "@/lib/db";
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
    brut = await req.json();
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
    const sql = await assurerSchema();
    if (sql) {
      await sql`
        insert into demandes (nom, societe, email, telephone, objet, besoin, source, user_agent)
        values (${d.nom}, ${d.societe}, ${d.email}, ${d.telephone || null}, ${d.objet},
                ${d.besoin}, 'site', ${req.headers.get("user-agent") ?? ""})
      `;
      enregistre = true;
    }
  } catch (e) {
    console.error("[cotation] enregistrement impossible", e);
  }

  try {
    await envoyerDemande(d);
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
