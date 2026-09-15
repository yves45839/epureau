import { Resend } from "resend";
import { notificationEmails } from "@/lib/cms";

type Demande = {
  nom: string;
  societe: string;
  email: string;
  telephone?: string;
  objet: string;
  besoin: string;
};

const echapper = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function envoyerDemande(d: Demande, type = "Demande de cotation") {
  const cle = process.env.RESEND_API_KEY;
  if (!cle) {
    console.warn("[cotation] RESEND_API_KEY absente : e-mail non envoyé.");
    return { envoye: false as const, raison: "cle_absente" };
  }

  const resend = new Resend(cle);
  const expediteur = process.env.MAIL_FROM ?? "EPUREAU Côte d’Ivoire <onboarding@resend.dev>";

  const lignes: [string, string][] = [
    ["Nom et prénom", d.nom],
    ["Société / établissement", d.societe],
    ["E-mail", d.email],
    ["Téléphone", d.telephone || "—"],
    ["Objet", d.objet],
  ];

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#0F1A3D;max-width:620px">
      <div style="background:#1B2E78;color:#fff;padding:18px 22px;border-radius:10px 10px 0 0">
        <strong style="font-size:16px">${echapper(type)} — EPUREAU Côte d’Ivoire</strong>
      </div>
      <table style="width:100%;border-collapse:collapse;border:1px solid #E3EAF3;border-top:0">
        ${lignes
          .map(
            ([k, v]) =>
              `<tr><td style="padding:10px 14px;background:#F4F7FB;font-size:13px;color:#5A6479;width:190px">${k}</td><td style="padding:10px 14px;font-size:14px">${echapper(v)}</td></tr>`,
          )
          .join("")}
        <tr><td style="padding:10px 14px;background:#F4F7FB;font-size:13px;color:#5A6479;vertical-align:top">Besoin exprimé</td><td style="padding:10px 14px;font-size:14px;white-space:pre-wrap">${echapper(d.besoin)}</td></tr>
      </table>
      <p style="font-size:12px;color:#6B7594;margin-top:14px">
        Demande transmise depuis le site EPUREAU Côte d’Ivoire.
      </p>
    </div>`;

  const { error } = await resend.emails.send({
    from: expediteur,
    to: await notificationEmails(),
    replyTo: d.email,
    subject: `${type} — ${d.societe} (${d.objet})`,
    html,
  });
  if (error) throw new Error("Le service e-mail a refusé la demande.");

  return { envoye: true as const };
}
