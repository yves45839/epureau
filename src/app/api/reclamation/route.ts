import { randomUUID } from "node:crypto";
import { z } from "zod";
import { recordRequest } from "@/lib/admin-requests";
import { envoyerDemande } from "@/lib/mail";

export const runtime = "nodejs";

const schema = z.object({
  nom: z.string().trim().min(2, "Indiquez votre nom.").max(120),
  societe: z.string().trim().min(2, "Indiquez votre société.").max(160),
  email: z.string().trim().email("Vérifiez votre adresse e-mail.").max(160),
  telephone: z.string().trim().max(40).optional().default(""),
  categorie: z.enum(["Ingénierie de l’eau", "Services aux industries", "Hygiène institutionnelle", "Produits chimiques", "Facturation ou livraison", "Autre"]),
  commande: z.string().trim().max(120).optional().default(""),
  description: z.string().trim().min(10, "Décrivez le problème en au moins 10 caractères.").max(4000),
  attente: z.string().trim().max(2000).optional().default(""),
  site: z.string().max(200).optional().default(""),
});

export async function POST(req: Request) {
  let input: unknown;
  try {
    const body = await req.text();
    if (body.length > 16000) return Response.json({ message: "Votre demande est trop longue." }, { status: 413 });
    input = JSON.parse(body);
  } catch {
    return Response.json({ message: "Requête invalide." }, { status: 400 });
  }
  const parsed = schema.safeParse(input);
  if (!parsed.success) return Response.json({ message: parsed.error.issues[0]?.message ?? "Formulaire incomplet." }, { status: 422 });
  const data = parsed.data;
  const reference = `REC-${randomUUID().toUpperCase()}`;
  if (data.site) return Response.json({ ok: true, reference });

  const demande = {
    nom: data.nom, societe: data.societe, email: data.email, telephone: data.telephone,
    objet: `Réclamation client — ${data.categorie} — ${reference}`,
    besoin: `Référence : ${reference}\nCommande / facture / projet : ${data.commande || "Non renseigné"}\n\nProblème rencontré :\n${data.description}\n\nSolution attendue :\n${data.attente || "Non renseignée"}`,
  };
  let recorded = false;
  let sent = false;
  try {
    recorded = await recordRequest({ ...demande, source: "reclamation" });
  } catch {
    console.error("[reclamation] Enregistrement indisponible");
  }
  try {
    sent = (await envoyerDemande(demande, "Réclamation client")).envoye;
  } catch {
    console.error("[reclamation] Transmission e-mail indisponible");
  }
  if (!recorded && !sent) return Response.json({ message: "Votre réclamation n’a pas pu être transmise. Veuillez réessayer ou contacter notre équipe." }, { status: 503 });
  return Response.json({ ok: true, reference });
}
