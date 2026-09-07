import type { Metadata } from "next";
import Icon from "@/components/Icon";
import QuoteForm from "@/components/QuoteForm";
import { societe } from "@/content/site";

export const metadata: Metadata = {
  title: "Nous contacter",
  description:
    "Demande de cotation, question technique ou projet à étudier : l'équipe EPUREAU Côte d'Ivoire vous répond du lundi au vendredi.",
};

export default function Contact() {
  return (
    <section className="sec" id="contact">
      <div className="wrap">
        <div className="contact">
          <div className="rv">
            <span className="eyebrow">Nous contacter</span>
            <h1 className="title">
              Une demande de cotation, une question technique ou un projet à étudier ?
            </h1>
            <p className="lead" style={{ marginTop: 18 }}>
              Notre équipe vous répond du lundi au vendredi. Chaque demande est transmise à nos
              équipes et suivie jusqu&apos;à la remise d&apos;une proposition.
            </p>

            <div className="coords">
              <a className="coord" href={societe.maps} target="_blank" rel="noopener">
                <span className="ic">
                  <Icon name="pin" />
                </span>
                <span>
                  <small>Siège</small>
                  <b>{societe.adresse}</b>
                  <br />
                  <span style={{ fontSize: 13, color: "var(--g500)" }}>
                    {societe.boitePostale} · Ouvrir dans Google Maps
                  </span>
                </span>
              </a>
              <a className="coord" href={`tel:${societe.telephoneLien}`}>
                <span className="ic">
                  <Icon name="phone" />
                </span>
                <span>
                  <small>Téléphone</small>
                  <b>{societe.telephone}</b>
                </span>
              </a>
              <a className="coord" href={`mailto:${societe.email}`}>
                <span className="ic">
                  <Icon name="mail" />
                </span>
                <span>
                  <small>E-mail</small>
                  <b>{societe.email}</b>
                </span>
              </a>
              <div className="coord">
                <span className="ic">
                  <Icon name="clock" />
                </span>
                <span>
                  <small>Horaires</small>
                  <b>{societe.horairesLong}</b>
                </span>
              </div>
            </div>
          </div>

          <QuoteForm />
        </div>
      </div>
    </section>
  );
}
