"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { galerie } from "@/content/site";

// Dimensions natives : aucun agrandissement de fichiers de chantier en basse résolution.
const dimensions = [[640,245], [640,245], [640,245], [365,130], [538,176], [550,310]];

export default function Galerie() {
  const [ouvert, setOuvert] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (ouvert === null) { dialog.current?.close(); return; }
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [ouvert]);

  return (
    <>
      <div className="gal rvs" id="photos">
        {galerie.map((g, i) => (
          <figure key={g.legende}>
            <button className="gallery-open" type="button" onClick={() => setOuvert(i)} aria-label={`Voir : ${g.legende}`}>
              <Image src={g.image} alt="" width={dimensions[i][0]} height={dimensions[i][1]} sizes="(max-width: 600px) 50vw, 33vw" />
              <span className="gallery-caption">{g.legende}</span>
            </button>
          </figure>
        ))}
      </div>
      <dialog ref={dialog} className="photo-dialog" aria-label="Photo du chantier"
        onClose={() => setOuvert(null)} onCancel={() => setOuvert(null)}
        onClick={(e) => { if (e.target === e.currentTarget) setOuvert(null); }}>
        <button type="button" className="close-photo" aria-label="Fermer la photo" onClick={() => setOuvert(null)} autoFocus><Icon name="x" /></button>
        {ouvert !== null && (
          <figure>
            <Image src={galerie[ouvert].image} alt={galerie[ouvert].legende}
              width={dimensions[ouvert][0]} height={dimensions[ouvert][1]}
              style={{ maxWidth: dimensions[ouvert][0], width: "100%", height: "auto" }} />
            <figcaption>{galerie[ouvert].legende}</figcaption>
          </figure>
        )}
      </dialog>
    </>
  );
}
