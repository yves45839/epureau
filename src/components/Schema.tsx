"use client";

import {useUi} from "./UiText";
import { useEffect, useRef, useState } from "react";

/**
 * Schéma de principe animé d'une STEP biologique — repris de la maquette validée.
 * L'étape affichée suit la progression du défilement dans la section.
 */
export default function Schema() {
  const ui=useUi();
  const ref = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(1);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const vue = window.innerHeight;
      const p = (vue - r.top) / (vue + r.height);
      setStage(p < 0.42 ? 1 : p < 0.62 ? 2 : 3);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const libelle =
    stage === 1 ? "Étude en cours" : stage === 2 ? "Travaux en cours" : "Rejet conforme";

  return (
    <div ref={ref}>
      <div className="diagram"  data-stage={stage} aria-hidden="true">
              <div className="hd"><span>{ui("Schéma de principe · STEP biologique")}</span><b className="st" >{ui(libelle)}</b></div>
              <svg className="dg" viewBox="0 0 640 330">
                <defs><linearGradient id="gw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6FD3F2" stopOpacity=".55"/><stop offset="1" stopColor="#1AB5E8" stopOpacity=".85"/></linearGradient></defs>
                <text className="dim" x="120" y="56">{ui("Ø 3,2 m")}</text><text className="dim" x="318" y="44">{ui("V = 96 m³")}</text><text className="dim" x="500" y="56">{ui("Q = 270 m³/j")}</text><text className="dim" x="26" y="106">{ui("EH entrée")}</text>
                <path className="pipe" d="M18 118 H112"/><path className="flow" d="M18 118 H112"/>
                <path className="pipe" d="M232 118 H298"/><path className="flow" d="M232 118 H298"/>
                <path className="pipe" d="M432 118 H488"/><path className="flow" d="M432 118 H488"/>
                <path className="pipe" d="M612 100 H640"/><path className="flow ok" d="M612 100 H640"/>
                <path className="pipe" d="M552 196 V250 H366 V196" strokeDasharray="4 6" style={{strokeWidth: '2.5'} as React.CSSProperties}/><path className="flow" d="M366 196 V250 H552 V196"/>
                <g className="glow"><rect className="body" x="112" y="78" width="120" height="96" rx="8"/><clipPath id="c1"><rect x="112" y="78" width="120" height="96" rx="8"/></clipPath><rect className="water" clipPath="url(#c1)" x="112" y="110" width="120" height="64"/><rect className="outline" x="112" y="78" width="120" height="96" rx="8"/></g>
                <text className="lbl" x="172" y="200" textAnchor="middle">{ui("Bassin tampon")}</text>
                <g className="glow"><rect className="body" x="298" y="58" width="134" height="136" rx="10"/><clipPath id="c2"><rect x="298" y="58" width="134" height="136" rx="10"/></clipPath><rect className="water" clipPath="url(#c2)" x="298" y="92" width="134" height="102"/>
                  <g className="media" clipPath="url(#c2)"><circle cx="322" cy="128" r="5"/><circle cx="346" cy="150" r="5"/><circle cx="372" cy="120" r="5"/><circle cx="398" cy="146" r="5"/><circle cx="410" cy="112" r="5"/><circle cx="336" cy="176" r="5"/><circle cx="386" cy="178" r="5"/><circle cx="360" cy="104" r="5"/></g>
                  <g clipPath="url(#c2)"><circle className="bubble" cx="318" cy="186" r="2.4" style={{"--b": "0s"} as React.CSSProperties}/><circle className="bubble" cx="352" cy="188" r="2" style={{"--b": ".5s"} as React.CSSProperties}/><circle className="bubble" cx="380" cy="186" r="2.6" style={{"--b": "1s"} as React.CSSProperties}/><circle className="bubble" cx="410" cy="188" r="2" style={{"--b": "1.5s"} as React.CSSProperties}/><circle className="bubble" cx="335" cy="188" r="1.8" style={{"--b": "1.9s"} as React.CSSProperties}/></g>
                  <rect className="outline" x="298" y="58" width="134" height="136" rx="10"/></g>
                <text className="lbl" x="365" y="216" textAnchor="middle">{ui("Réacteur MBBR / SBR")}</text>
                <g className="glow"><path className="body" d="M488 78 H612 L584 194 H516 Z"/><clipPath id="c3"><path d="M488 78 H612 L584 194 H516 Z"/></clipPath><rect className="water" clipPath="url(#c3)" x="488" y="104" width="124" height="90"/><path className="outline" d="M488 78 H612 L584 194 H516 Z"/></g>
                <text className="lbl" x="550" y="216" textAnchor="middle">{ui("Clarificateur")}</text>
                <text className="lbl" x="638" y="122" textAnchor="end" style={{fill: '#2BB673'} as React.CSSProperties}>{ui("Eau traitée")}</text>
                <text className="lbl" x="459" y="272" textAnchor="middle">{ui("Recirculation des boues")}</text>
                <g className="ok"><rect x="196" y="286" width="248" height="32" rx="16" fill="rgba(43,182,115,.14)" stroke="rgba(43,182,115,.6)"/><circle cx="216" cy="302" r="7" fill="#2BB673"/><path d="M212.5 302 l2.5 2.5 l4.5 -5" fill="none" stroke="#04150B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><text x="232" y="306" fontFamily="IBM Plex Mono,monospace" fontSize="11" fill="#F4F7FB" letterSpacing="1">{ui("Rejet conforme · unité en service")}</text></g>
              </svg>
            </div>
    </div>
  );
}
