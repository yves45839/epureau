import Link from "next/link";
import type { Metadata } from "next";
import { storeConfigured } from "@/lib/admin-store";
import { DOMAINE_AUTORISE } from "@/lib/admin-security";

export const metadata: Metadata = { title: "Demander un accès", robots: { index: false, follow: false } };

export default async function Inscription({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  const { e } = await searchParams;
  const configured = storeConfigured();
  const errors: Record<string, string> = {
    domaine: "Seules les adresses @" + DOMAINE_AUTORISE + " peuvent demander un accès.",
    champs: "Vérifiez votre nom, votre adresse et un mot de passe d’au moins 12 caractères.",
    confirmation: "Les deux mots de passe ne correspondent pas.",
    rate: "Trop de demandes pour cette adresse. Réessayez dans une heure.",
    config: "Le stockage n’est pas connecté : la création de compte est momentanément indisponible.",
    service: "Service indisponible. Réessayez dans un instant.",
  };
  return <main className="admin-login">
    <div className="admin-login-card">
      <Link href="/"><img src="/images/logo.png" width="560" height="162" alt="EPUREAU Côte d’Ivoire" /></Link>
      <span className="admin-kicker">ESPACE ADMINISTRATION</span>
      <h1>Demander<br />un accès</h1>
      <p>Réservé aux collaborateurs disposant d’une adresse <b>@{DOMAINE_AUTORISE}</b>. Votre compte est créé avec le rôle <b>Commercial</b> et ouvert dès qu’un administrateur l’active.</p>
      <form action="/api/admin/signup" method="post">
        <label>Nom et prénom<input type="text" name="nom" required autoComplete="name" minLength={2} maxLength={120} /></label>
        <label>Adresse e-mail professionnelle<input type="email" name="email" required autoComplete="username" maxLength={160} placeholder={"prenom.nom@" + DOMAINE_AUTORISE} /></label>
        <label>Mot de passe (12 caractères minimum)<input type="password" name="motdepasse" required autoComplete="new-password" minLength={12} maxLength={200} /></label>
        <label>Confirmer le mot de passe<input type="password" name="confirmation" required autoComplete="new-password" minLength={12} maxLength={200} /></label>
        <button className="admin-button" disabled={!configured}>Envoyer ma demande →</button>
      </form>
      {(e || !configured) && <p role="alert" className="admin-error">{errors[e || "config"] || "Demande impossible."}</p>}
      <Link className="admin-back" href="/admin/login">← J’ai déjà un compte</Link>
    </div>
  </main>;
}
