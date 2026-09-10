"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { domaines } from "@/content/site";
import { visuelsDomaines } from "@/content/illustrations";

const slides = domaines.slice(0, 3).map((d, i) => ({ ...d, visuel: visuelsDomaines[i] }));
const labels = ["Ingénierie", "Industries", "Hygiène"];

export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [pause, setPause] = useState(false);
  const [focus, setFocus] = useState(false);
  const [hover, setHover] = useState(false);
  const [reduit, setReduit] = useState(true);
  const [visible, setVisible] = useState(true);
  const [hidden, setHidden] = useState(false);
  const depart = useRef<{ x: number; y: number } | null>(null);
  const arrete = pause || focus || hover || reduit || !visible || hidden;
  const aller = (n: number) => setIndex(((n % slides.length) + slides.length) % slides.length);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduit(media.matches);
    const visibility = () => setHidden(document.hidden);
    const frame = requestAnimationFrame(() => { sync(); visibility(); });
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.05 });
    if (section.current) observer.observe(section.current);
    media.addEventListener("change", sync);
    document.addEventListener("visibilitychange", visibility);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); media.removeEventListener("change", sync); document.removeEventListener("visibilitychange", visibility); };
  }, []);

  useEffect(() => {
    if (arrete) return;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % slides.length), 8000);
    return () => window.clearTimeout(timer);
  }, [index, arrete]);

  return (
    <section ref={section} className={`hero-cinema${arrete ? " paused" : ""}`} id="top" aria-roledescription="carrousel" aria-label="Les métiers EPUREAU"
      onFocusCapture={() => setFocus(true)}
      onBlurCapture={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setFocus(false); }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") { e.preventDefault(); aller(index - 1); }
        if (e.key === "ArrowRight") { e.preventDefault(); aller(index + 1); }
      }}
      onTouchStart={(e) => { depart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }}
      onTouchEnd={(e) => {
        if (!depart.current) return;
        const dx = e.changedTouches[0].clientX - depart.current.x;
        const dy = e.changedTouches[0].clientY - depart.current.y;
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) aller(index + (dx < 0 ? 1 : -1));
        depart.current = null;
      }}>
      {slides.map((d, i) => (
        <article key={d.titre} id={`metier-${i}`} className={`cinema-slide${index === i ? " active" : ""}`} aria-hidden={index !== i} inert={index !== i} aria-roledescription="diapositive" aria-label={`${i + 1} sur ${slides.length}`}>
          <div className="cinema-image"><Image src={d.visuel.src} alt={d.visuel.alt} fill sizes="100vw" preload={i === 0} style={{ objectPosition: d.visuel.position }} /></div>
          <div className="wrap cinema-copy">
            <span className="eyebrow">EPUREAU Côte d&apos;Ivoire</span>
            {i === 0 ? <h1 className="cinema-title">{d.titre}</h1> : <h2 className="cinema-title">{d.titre}</h2>}
            <Link className="btn btn-primary" href={d.lien}>{d.lienTexte}<Icon name="arrow" /></Link>
          </div>
        </article>
      ))}
      <div className="wrap cinema-controls" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <div className="hero-tabs" aria-label="Choisir un métier">
          {slides.map((d, i) => <button key={d.titre} type="button" aria-pressed={index === i} aria-controls={`metier-${i}`} onClick={() => aller(i)}><span className="mono">0{i + 1}</span>{labels[i]}</button>)}
        </div>
        <div className="cinema-nav">
          <button className="photo-pause" type="button" aria-label="Photo précédente" onClick={() => aller(index - 1)}><Icon name="left" /></button>
          <button className="photo-pause" type="button" aria-label={pause ? "Activer le défilement automatique" : "Suspendre le défilement automatique"} aria-pressed={pause} disabled={reduit} onClick={() => setPause(!pause)}><span aria-hidden="true">{pause || reduit ? "▷" : "Ⅱ"}</span></button>
          <button className="photo-pause" type="button" aria-label="Photo suivante" onClick={() => aller(index + 1)}><Icon name="arrow" /></button>
        </div>
      </div>
    </section>
  );
}
