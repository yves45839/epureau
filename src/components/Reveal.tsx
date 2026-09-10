"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Chaque carte se révèle à son propre passage dans l'écran. */
export default function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    const cibles = Array.from(document.querySelectorAll<HTMLElement>(".rv, .rvs > *"));
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const obs = new IntersectionObserver(
      (entrees) => {
        entrees.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            obs.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -5% 0px", threshold: 0.08 },
    );
    const sync = () => {
      obs.disconnect();
      cibles.forEach((el) => {
        if (media.matches) el.classList.add("in");
        else if (!el.classList.contains("in")) obs.observe(el);
      });
    };
    const revealFocus = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      cibles.forEach((el) => { if (el.contains(event.target as Node)) el.classList.add("in"); });
    };
    sync();
    media.addEventListener("change", sync);
    document.addEventListener("focusin", revealFocus);
    return () => {
      obs.disconnect();
      media.removeEventListener("change", sync);
      document.removeEventListener("focusin", revealFocus);
    };
  }, [pathname]);

  return null;
}
