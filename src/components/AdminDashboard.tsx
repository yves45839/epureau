"use client";

import Icon from "./Icon";
import type { Overview } from "@/lib/admin-overview";
import type { Entry } from "@/lib/admin-store";
import type { CustomerRequest } from "@/lib/admin-requests";
import type { Identity } from "@/lib/auth";

const nombre = new Intl.NumberFormat("fr-FR");
const statuts: Record<string, string> = { nouvelle: "Nouvelle", en_cours: "En cours", traitee: "Traitée" };

const jourCourt = (valeur: string) => new Date(valeur).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }).replace(/\.$/, "");

function depuis(date: string) {
  const ecart = Date.now() - new Date(date).getTime();
  const minutes = Math.round(ecart / 60000);
  if (minutes < 1) return "à l’instant";
  if (minutes < 60) return "il y a " + minutes + " min";
  const heures = Math.round(minutes / 60);
  if (heures < 24) return "il y a " + heures + " h";
  const jours = Math.round(heures / 24);
  return jours < 31 ? "il y a " + jours + " j" : new Date(date).toLocaleDateString("fr-FR");
}

function Kpi({ libelle, valeur, detail, icone, ton = "" }: { libelle: string; valeur: string; detail: string; icone: string; ton?: string }) {
  return (
    <article className={"dash-kpi " + ton}>
      <span className="dash-kpi-icone"><Icon name={icone} /></span>
      <span className="dash-kpi-libelle">{libelle}</span>
      <strong>{valeur}</strong>
      <small>{detail}</small>
    </article>
  );
}

export default function AdminDashboard({
  user, overview, requests, onOpen,
}: {
  user: Identity;
  overview?: Overview;
  requests: Entry<CustomerRequest>[];
  onOpen: (section: string) => void;
}) {
  const aujourdhui = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const prenom = user.name.split(" ")[0];
  if (!overview) return <div className="admin-card admin-empty">Tableau de bord indisponible pour le moment.</div>;

  const { demandes, audience, contenus, comptes, journal } = overview;
  const maximum = Math.max(...(audience?.courbe.map(j => j.visites) ?? [0]), 1);
  const conversion = audience && audience.pages ? Math.round((audience.conversions / audience.pages) * 1000) / 10 : null;

  const alertes = [
    demandes.nouvelles > 0 ? { cle: "requests", texte: demandes.nouvelles + (demandes.nouvelles > 1 ? " demandes à traiter" : " demande à traiter"), detail: "Cotations et réclamations sans suite", icone: "mail", ton: "urgent" } : null,
    comptes && comptes.enAttente > 0 ? { cle: "users", texte: comptes.enAttente + (comptes.enAttente > 1 ? " demandes d’accès" : " demande d’accès"), detail: "En attente d’activation", icone: "users", ton: "attention" } : null,
    ...contenus.filter(c => c.enAttente > 0).map(c => ({ cle: c.section, texte: c.enAttente + (c.enAttente > 1 ? " contenus non publiés" : " contenu non publié"), detail: c.nom, icone: "pen", ton: "" })),
  ].filter(Boolean) as { cle: string; texte: string; detail: string; icone: string; ton: string }[];

  const raccourcis = contenus.filter(c => ["products", "projects", "media", "pages"].includes(c.section));

  return (
    <>
      <div className="dash-hello">
        <div>
          <span className="dash-date">{aujourdhui}</span>
          <h2>Bonjour {prenom}</h2>
          <p>Voici l’essentiel de votre site depuis 30 jours.</p>
        </div>
        <div className="dash-hello-actions">
          <button type="button" className="admin-button" onClick={() => onOpen("requests")}>Traiter les demandes</button>
          <a className="admin-button secondary" href="/" target="_blank" rel="noreferrer">Voir le site ↗</a>
        </div>
      </div>

      <div className="dash-kpis">
        <Kpi libelle="Demandes à traiter" valeur={nombre.format(demandes.nouvelles)} detail={demandes.mois + " reçue(s) ce mois"} icone="mail" ton={demandes.nouvelles ? "urgent" : ""} />
        <Kpi libelle="En cours de traitement" valeur={nombre.format(demandes.encours)} detail={demandes.traitees + " déjà traitée(s)"} icone="clock" />
        <Kpi libelle="Visiteurs · 30 jours" valeur={audience ? nombre.format(audience.visiteurs) : "—"} detail={audience ? nombre.format(audience.pages) + " pages vues" : "Mesure indisponible"} icone="users" />
        <Kpi libelle="Conversions · 30 jours" valeur={audience ? nombre.format(audience.conversions) : "—"} detail={conversion !== null ? String(conversion).replace(".", ",") + " % des pages vues" : "Demandes et téléchargements"} icone="sparkles" ton="positif" />
      </div>

      <div className="dash-grid">
        <div className="dash-colonne">
          {audience && (
            <section className="admin-card">
              <div className="dash-card-tete">
                <h3>Fréquentation · 14 derniers jours</h3>
                <button type="button" className="dash-lien" onClick={() => onOpen("audience")}>Tout l’audience →</button>
              </div>
              <div className="audience-graph" role="img" aria-label={"Pages vues par jour sur 14 jours, maximum " + maximum}>
                {audience.courbe.map(j => (
                  <span key={j.date} className="audience-bar" title={jourCourt(j.date) + " · " + j.visites + " pages vues"}>
                    <i style={{ height: Math.max((j.visites / maximum) * 100, j.visites ? 3 : 0) + "%" }} />
                  </span>
                ))}
              </div>
              <div className="audience-axe">
                <span>{audience.courbe.length ? jourCourt(audience.courbe[0].date) : ""}</span>
                <span>{audience.courbe.length ? jourCourt(audience.courbe[audience.courbe.length - 1].date) : ""}</span>
              </div>
              {audience.sources.length > 0 && (
                <ul className="dash-sources">
                  {audience.sources.map(s => (
                    <li key={s.libelle}><span>{s.libelle}</span><b>{s.part} %</b></li>
                  ))}
                </ul>
              )}
            </section>
          )}

          <section className="admin-card">
            <div className="dash-card-tete">
              <h3>Dernières demandes</h3>
              <button type="button" className="dash-lien" onClick={() => onOpen("requests")}>Toutes les demandes →</button>
            </div>
            {requests.length ? requests.slice(0, 5).map(r => (
              <button type="button" className="dash-demande" key={r.key} onClick={() => onOpen("requests")}>
                <span className="dash-demande-corps">
                  <b>{r.value.societe}</b>
                  <small>{r.value.objet}</small>
                </span>
                <span className="dash-demande-fin">
                  <span className={"admin-badge " + r.value.statut}>{statuts[r.value.statut]}</span>
                  <time>{depuis(r.value.cree_le)}</time>
                </span>
              </button>
            )) : <p className="admin-empty">Les cotations et réclamations apparaîtront ici.</p>}
          </section>
        </div>

        <aside className="dash-colonne">
          <section className="admin-card">
            <div className="dash-card-tete"><h3>À traiter</h3></div>
            {alertes.length ? (
              <ul className="dash-alertes">
                {alertes.map(a => (
                  <li key={a.cle + a.texte}>
                    <button type="button" onClick={() => onOpen(a.cle)}>
                      <span className={"dash-alerte-icone " + a.ton}><Icon name={a.icone} /></span>
                      <span><b>{a.texte}</b><small>{a.detail}</small></span>
                      <Icon name="chev" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : <p className="dash-ok"><Icon name="check" /> Tout est à jour.</p>}
          </section>

          {contenus.length > 0 && (
            <section className="admin-card">
              <div className="dash-card-tete"><h3>Contenus en ligne</h3></div>
              <ul className="dash-contenus">
                {contenus.map(c => (
                  <li key={c.section}>
                    <button type="button" onClick={() => onOpen(c.section)}>
                      <span>{c.nom}</span>
                      <b>{nombre.format(c.publies)}</b>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {journal.length > 0 && (
            <section className="admin-card">
              <div className="dash-card-tete"><h3>Activité récente</h3></div>
              <ul className="dash-journal">
                {journal.map((j, i) => (
                  <li key={i}><b>{j.action}</b><small>{j.actor} · {depuis(j.date)}</small></li>
                ))}
              </ul>
            </section>
          )}
        </aside>
      </div>

      {raccourcis.length > 0 && (
        <div className="dash-raccourcis">
          {raccourcis.map(c => (
            <button type="button" key={c.section} onClick={() => onOpen(c.section)}>
              <span className="dash-raccourci-icone"><Icon name={{ products: "tag", projects: "factory", media: "image", pages: "layout" }[c.section] || "grid"} /></span>
              <b>{c.nom}</b>
              <small>{c.publies} en ligne{c.enAttente ? " · " + c.enAttente + " à publier" : ""}</small>
            </button>
          ))}
        </div>
      )}
    </>
  );
}
