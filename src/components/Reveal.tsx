"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Ajoute la classe .in aux blocs .rv / .rvs quand ils entrent dans l'écran. */
export default function Reveal() {
  const pathname = usePathname();

  useEffect(() => {
    const cibles = Array.from(document.querySelectorAll<HTMLElement>(".rv, .rvs"));
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduit) {
      cibles.forEach((el) => el.classList.add("in"));
      return;
    }
    const obs = new IntersectionObserver(
      (entrees) => {
        entrees.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            obs.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );
    cibles.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [pathname]);

  return null;
}
