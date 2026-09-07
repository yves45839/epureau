"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "./Icon";
import { diapositives } from "@/content/site";

const DUREE = 6500;

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [enPause, setEnPause] = useState(false);
  const depart = useRef<number | null>(null);
  const total = diapositives.length;

  const aller = useCallback((n: number) => setIndex(((n % total) + total) % total), [total]);

  useEffect(() => {
    if (enPause) return;
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduit) return;
    const t = window.setTimeout(() => setIndex((i) => (i + 1) % total), DUREE);
    return () => window.clearTimeout(t);
  }, [index, enPause, total]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") aller(index - 1);
      if (e.key === "ArrowRight") aller(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, aller]);

  return (
    <section
      className={`hero${enPause ? " paused" : ""}`}
      id="top"
      aria-roledescription="carrousel"
      aria-label="À la une"
      onMouseEnter={() => setEnPause(true)}
      onMouseLeave={() => setEnPause(false)}
      onTouchStart={(e) => {
        depart.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (depart.current === null) return;
        const delta = e.changedTouches[0].clientX - depart.current;
        if (Math.abs(delta) > 50) aller(index + (delta < 0 ? 1 : -1));
        depart.current = null;
      }}
    >
      <div className="slides">
        {diapositives.map((d, i) => (
          <article
            key={d.titre}
            className={`slide${i === index ? " on" : ""}`}
            aria-hidden={i !== index}
          >
            <div className="bgimg">
              <Image
                src={d.image}
                alt={d.alt}
                fill
                sizes="100vw"
                priority={i === 0}
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="wrap">
              <div className="sl-in">
                <span className="eyebrow">{d.surtitre}</span>
                <h1 className="h1">
                  {d.titre} <span className="g">{d.titreAccent}</span>
                </h1>
                <p className="lead">{d.texte}</p>
                <div className="cta-row">
                  {d.actions.map((a) => (
                    <Link
                      key={a.label}
                      className={`btn ${a.primaire ? "btn-primary" : "btn-light"}`}
                      href={a.href}
                      tabIndex={i === index ? 0 : -1}
                    >
                      {a.icone === "download" && <Icon name="download" />}
                      {a.label}
                      {a.icone === "arrow" && <Icon name="arrow" />}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="wrap sl-ctrl">
        <div className="dots" role="tablist" aria-label="Diapositives">
          {diapositives.map((d, i) => (
            <button
              key={d.titre}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Diapositive ${i + 1} : ${d.surtitre}`}
              style={{ ["--dur" as string]: `${DUREE}ms` }}
              onClick={() => aller(i)}
            />
          ))}
        </div>
        <div className="arrows">
          <button type="button" aria-label="Diapositive précédente" onClick={() => aller(index - 1)}>
            <Icon name="left" />
          </button>
          <span className="sl-idx mono">
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <button type="button" aria-label="Diapositive suivante" onClick={() => aller(index + 1)}>
            <Icon name="arrow" />
          </button>
        </div>
      </div>
    </section>
  );
}
