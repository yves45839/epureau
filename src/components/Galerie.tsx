"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Icon from "./Icon";
import { galerie } from "@/content/site";

export default function Galerie() {
  const [ouvert, setOuvert] = useState<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOuvert(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className="gal rvs" id="photos">
        {galerie.map((g, i) => (
          <figure key={g.legende} onClick={() => setOuvert(i)}>
            <Image src={g.image} alt={g.legende} width={800} height={600} />
            <figcaption>{g.legende}</figcaption>
          </figure>
        ))}
      </div>

      <div
        className={`lb${ouvert !== null ? " open" : ""}`}
        onClick={() => setOuvert(null)}
        role="dialog"
        aria-modal="true"
        aria-label="Aperçu de la photo"
      >
        <button type="button" className="x" aria-label="Fermer" onClick={() => setOuvert(null)}>
          <Icon name="x" />
        </button>
        {ouvert !== null && (
          <>
            <Image
              src={galerie[ouvert].image}
              alt={galerie[ouvert].legende}
              width={1400}
              height={1000}
            />
            <span className="cap">{galerie[ouvert].legende}</span>
          </>
        )}
      </div>
    </>
  );
}
