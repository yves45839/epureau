"use client";

import UiText, {useUi} from "./UiText";
import Image from "./SiteImage";
import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { galerie } from "@/content/site";

// Dimensions natives : aucun agrandissement de fichiers de chantier en basse résolution.
const dimensions: Record<string, [number, number]> = {"/images/gal-1.jpg":[640,245],"/images/gal-2.jpg":[640,245],"/images/gal-4.jpg":[640,245],"/images/gal-5.jpg":[365,130],"/images/gal-6.jpg":[538,176],"/images/gal-3.jpg":[550,310]};

export default function Galerie({ items = galerie }: { items?: { image: string; legende: string; album?: string }[] }) {
  const ui=useUi();
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
      <label className="gallery-filter"><UiText text={"Album"} /><select value={album} onChange={event => { setOuvert(null); setAlbum(event.target.value); }}><option value=""><UiText text={"Tous les albums"} /></option>{[...new Set(items.map(item => item.album).filter(Boolean))].map(name => <option key={name} value={name}>{name}</option>)}</select></label><div className="gal rvs" id="photos">
        {photos.map((g, i) => (
          <figure key={g.legende}>
            <button className="gallery-open" type="button" onClick={() => setOuvert(i)} aria-label={`${ui("Voir")} : ${g.legende}`}>
              <Image src={g.image} alt="" width={(dimensions[g.image]?.[0] ?? 960)} height={(dimensions[g.image]?.[1] ?? 540)} sizes="(max-width: 600px) 50vw, 33vw" />
              <span className="gallery-caption">{g.legende}</span>
            </button>
          </figure>
        ))}
      </div>
      <dialog ref={dialog} className="photo-dialog" aria-label={ui("Photo du chantier")}
        onClose={() => setOuvert(null)} onCancel={() => setOuvert(null)}
        onClick={(e) => { if (e.target === e.currentTarget) setOuvert(null); }}>
        <button type="button" className="close-photo" aria-label={ui("Fermer la photo")} onClick={() => setOuvert(null)} autoFocus><Icon name="x" /></button>
        {ouvert !== null && (
          <figure>
            <Image src={photos[ouvert].image} alt={photos[ouvert].legende}
              width={(dimensions[photos[ouvert].image]?.[0] ?? 960)} height={(dimensions[photos[ouvert].image]?.[1] ?? 540)}
              style={{ maxWidth: (dimensions[photos[ouvert].image]?.[0] ?? 960), width: "100%", height: "auto" }} />
            <figcaption>{photos[ouvert].legende}</figcaption>
          </figure>
        )}
      </dialog>
    </>
  );
}
