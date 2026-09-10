import Image from "next/image";
import Link from "next/link";
import Icon from "./Icon";
import { etapes } from "@/content/site";

export default function PhotoBanner() {
  return (
    <section className="photo-banner process-banner" aria-labelledby="banner-title">
      <div className="photo-banner-frame">
        <Image src="/images/illustrations/panorama-eau.webp" alt="infrastructures de traitement d’eau dans un paysage tropical ouest-africain" fill sizes="100vw" />
      </div>
      <div className="wrap journey-layout">
        <div className="process-banner-heading">
          <div>
            <span className="eyebrow">Ingénierie de l&apos;eau</span>
            <h2 id="banner-title">Notre expertise</h2>
            <Link href="/ingenierie/notre-expertise" className="btn btn-light">Découvrir<Icon name="arrow" /></Link>
          </div>
        </div>
        <ol className="journey-cards rvs">
          {etapes.map((etape, i) => (
            <li className="journey-card" key={etape.titre}>
              <span className="journey-number mono" aria-hidden="true">0{i + 1}</span>
              <h3>{etape.titre}</h3>
              <ul>{etape.points.map((point) => <li key={point}>{point}</li>)}</ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
