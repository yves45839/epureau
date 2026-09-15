import Link from "next/link";
import type { Metadata } from "next";
import { storeConfigured,localStore } from "@/lib/admin-store";
export const metadata:Metadata={title:"Connexion administrateur",robots:{index:false,follow:false}};
export default async function Login({searchParams}:{searchParams:Promise<{e?:string}>}){
 const {e}=await searchParams;const configured=storeConfigured();
 const errors:Record<string,string>={"1":"Identifiants incorrects.",config:"Connectez le stockage gratuit ou activez le mode local pour ouvrir l’administration.",rate:"Trop de tentatives. Réessayez dans 15 minutes.",service:"Le stockage est indisponible. Réessayez dans un instant."};
 return <main className="admin-login"><div className="admin-login-card"><Link href="/"><img src="/images/logo.png" width="560" height="162" alt="EPUREAU Côte d’Ivoire" /></Link><span className="admin-kicker">ESPACE ADMINISTRATION</span><h1>Bienvenue dans<br />votre espace</h1><p>Gérez les contenus du site et le suivi de vos clients.</p>{localStore()&&<p className="admin-local">Mode local · Données sur cet ordinateur</p>}<form action="/api/admin/login" method="post"><label>Adresse e-mail<input type="email" name="email" required autoComplete="username" maxLength={160} /></label><label>Mot de passe<input type="password" name="motdepasse" required autoComplete="current-password" maxLength={200} /></label><button className="admin-button" disabled={!configured}>Se connecter →</button></form>{(e||!configured)&&<p role="alert" className="admin-error">{errors[e||"config"]||"Connexion impossible."}</p>}<Link className="admin-back" href="/">← Retour au site</Link></div></main>;
}
