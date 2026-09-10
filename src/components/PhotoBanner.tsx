import Image from "next/image";
import Link from "next/link";
import Icon from "./Icon";
import { illustrations } from "@/content/illustrations";

export default function PhotoBanner() {
  return (
    <section className="photo-banner rv" aria-labelledby="banner-title">
      <div className="photo-banner-frame">
        <Image src={illustrations.industrie.src} alt={illustrations.industrie.alt} fill sizes="100vw" />
        <div className="wrap photo-banner-content">
          <span className="eyebrow">ECOLAB · NALCO</span>
          <h2 id="banner-title">Service aux industries</h2>
          <Link href="/service-aux-industries" className="btn btn-light">Nos services<Icon name="arrow" /></Link>
        </div>
        <span className="image-disclosure">Illustration générée</span>
      </div>
    </section>
  );
}
