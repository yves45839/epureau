"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { galerie } from "@/content/site";

// Dimensions natives : aucun agrandissement de fichiers de chantier en basse résolution.
const dimensions = [[640,245], [640,245], [640,245], [365,130], [538,176], [550,310]];

export default function Galerie({ items = galerie }: { items?: { image: string; legende: string; album?: string }[] }) {
  const [album, setAlbum] = useState("");
  const photos = items.filter(item => !album || item.album === album);
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
      <label className="gallery-filter">Album<select value={album} onChange={event => { setOuvert(null); setAlbum(event.target.value); }}><option value="">Tous les albums</option>{[...new Set(items.map(item => item.album).filter(Boolean))].map(name => <option key={name} value={name}>{name}</option>)}</select></label><div className="gal rvs" id="photos">
        {photos.map((g, i) => (
          <figure key={g.legende}>
            <button className="gallery-open" type="button" onClick={() => setOuvert(i)} aria-label={`Voir : ${g.legende}`}>
              <Image unoptimized src={g.image} alt="" width={(dimensions[i]?.[0] ?? 960)} height={(dimensions[i]?.[1] ?? 540)} sizes="(max-width: 600px) 50vw, 33vw" />
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
            <Image unoptimized src={photos[ouvert].image} alt={photos[ouvert].legende}
              width={(dimensions[ouvert]?.[0] ?? 960)} height={(dimensions[ouvert]?.[1] ?? 540)}
              style={{ maxWidth: (dimensions[ouvert]?.[0] ?? 960), width: "100%", height: "auto" }} />
            <figcaption>{photos[ouvert].legende}</figcaption>
          </figure>
        )}
      </dialog>
    </>
  );
}
