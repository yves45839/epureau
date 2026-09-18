"use client";

import type { Rapport, Palier } from "@/lib/audience";

const nombre = new Intl.NumberFormat("fr-FR");

function duree(secondes: number) {
  if (!secondes) return "—";
  const m = Math.floor(secondes / 60), s = secondes % 60;
  return m ? m + " min " + String(s).padStart(2, "0") + " s" : s + " s";
}

function Tableau({ titre, lignes, vide, unite = "visites" }: { titre: string; lignes: Palier[]; vide: string; unite?: string }) {
  return (
    <div className="admin-card audience-table">
      <h3>{titre}</h3>
      {lignes.length ? (
        <table>
          <caption className="admin-visually-hidden">{titre}, en {unite}</caption>
          <tbody>
            {lignes.map(l => (
              <tr key={l.libelle}>
                <th scope="row" title={l.libelle}>{l.libelle}</th>
                <td><span className="audience-jauge" style={{ width: Math.max(l.part, 2) + "%" }} aria-hidden="true" /></td>
                <td className="audience-valeur">{nombre.format(l.valeur)}<small>{l.part} %</small></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : <p className="admin-empty">{vide}</p>}
    </div>
  );
}

export default function AdminAudience({ rapport, jours, onJours }: { rapport?: Rapport; jours: number; onJours: (jours: number) => void }) {
  if (!rapport) return <div className="admin-card admin-empty">Mesure d’audience indisponible.</div>;
  const { totaux, courbe } = rapport;
  const maximum = Math.max(...courbe.map(j => j.visites), 1);
  const jourFort = courbe.reduce((a, b) => (b.visites > a.visites ? b : a), courbe[0]);
  const format = (v: string) => new Date(v).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });

  return (
    <>
      <div className="admin-filters">
        <label>Période
          <select value={jours} onChange={event => onJours(Number(event.target.value))}>
            <option value={7}>7 derniers jours</option>
            <option value={30}>30 derniers jours</option>
            <option value={90}>90 derniers jours</option>
            <option value={365}>12 derniers mois</option>
          </select>
        </label>
      </div>

      <div className="admin-stats">
        {[["Pages vues", nombre.format(totaux.pages)], ["Visiteurs", nombre.format(totaux.visiteurs)], ["Sessions", nombre.format(totaux.sessions)], ["Conversions", nombre.format(totaux.conversions)]].map(([label, valeur]) => (
          <article key={label}><span>{label}</span><strong>{valeur}</strong></article>
        ))}
      </div>
      <div className="admin-stats">
        {[["Durée moyenne", duree(totaux.duree)], ["Pages par session", String(totaux.parPage).replace(".", ",")], ["Taux de rebond", String(totaux.rebond).replace(".", ",") + " %"], ["Taux de conversion", (totaux.sessions ? (Math.round((totaux.conversions / totaux.sessions) * 1000) / 10).toString().replace(".", ",") : "0") + " %"]].map(([label, valeur]) => (
          <article key={label}><span>{label}</span><strong>{valeur}</strong></article>
        ))}
      </div>

      <div className="admin-card">
        <h3>Fréquentation quotidienne</h3>
        <p className="admin-info">Pic à {nombre.format(jourFort?.visites ?? 0)} pages vues le {jourFort ? format(jourFort.date).replace(/\.$/, "") : "—"}.</p>
        <div className="audience-graph" role="img" aria-label={"Pages vues par jour sur " + jours + " jours. Maximum : " + maximum + "."}>
          {courbe.map(j => (
            <span key={j.date} className="audience-bar" title={format(j.date) + " · " + j.visites + " pages vues · " + j.visiteurs + " visiteurs"}>
              <i style={{ height: Math.max((j.visites / maximum) * 100, j.visites ? 3 : 0) + "%" }} />
            </span>
          ))}
        </div>
        <div className="audience-axe"><span>{courbe.length ? format(courbe[0].date) : ""}</span><span>{courbe.length ? format(courbe[courbe.length - 1].date) : ""}</span></div>
      </div>

      <div className="audience-grid">
        <Tableau titre="Pages les plus consultées" lignes={rapport.pages} vide="Aucune page consultée sur la période." />
        <Tableau titre="Sources de trafic" lignes={rapport.sources} vide="Aucune visite enregistrée." />
        <Tableau titre="Pays" lignes={rapport.pays} vide="Aucune localisation disponible." />
        <Tableau titre="Villes" lignes={rapport.villes} vide="La ville n’est fournie qu’en production." />
        <Tableau titre="Sites référents" lignes={rapport.referents} vide="Aucun site référent." />
        <Tableau titre="Conversions" lignes={rapport.conversions} vide="Aucune demande ni téléchargement sur la période." unite="conversions" />
        <Tableau titre="Pages d’entrée" lignes={rapport.entrees} vide="Aucune session." unite="sessions" />
        <Tableau titre="Pages de sortie" lignes={rapport.sorties} vide="Aucune session." unite="sessions" />
        <Tableau titre="Appareils" lignes={rapport.appareils} vide="Aucune visite." />
        <Tableau titre="Navigateurs" lignes={rapport.navigateurs} vide="Aucune visite." />
        <Tableau titre="Systèmes" lignes={rapport.systemes} vide="Aucune visite." />
      </div>

      <div className="admin-card">
        <h3>Dernières visites</h3>
        {rapport.dernieres.length ? (
          <div className="audience-journal">
            {rapport.dernieres.map((v, i) => (
              <div className="admin-list-line" key={i}>
                <div><b>{v.path}</b><p>{[v.ville, v.pays].filter(Boolean).join(" · ") || "Localisation inconnue"} · {v.source} · {v.appareil} · {v.navigateur}</p></div>
                <time>{new Date(v.date).toLocaleString("fr-FR")}</time>
              </div>
            ))}
          </div>
        ) : <p className="admin-empty">Les visites apparaîtront ici dès la mise en ligne.</p>}
      </div>

      <p className="admin-info">
        Mesure interne, hébergée avec le site : aucun cookie n’est déposé, aucune donnée n’est transmise à un service tiers
        et l’adresse IP n’est jamais enregistrée — elle sert uniquement à calculer une empreinte anonyme, renouvelée chaque
        jour, qui permet de compter les visiteurs. Les visiteurs peuvent refuser la mesure depuis le bandeau du site.
      </p>
    </>
  );
}
