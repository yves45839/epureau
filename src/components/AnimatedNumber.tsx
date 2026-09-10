"use client";

import { useEffect, useRef } from "react";

/** Affiche la valeur finale sans JavaScript et pour les lecteurs d'écran. */
export default function AnimatedNumber({ value, animate = true }: { value: string; animate?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const target = Number(value);
    if (!el || !animate || !Number.isFinite(target)) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const finish = () => {
      cancelAnimationFrame(frame);
      el.textContent = value;
    };
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      if (motion.matches) return;
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / 1100, 1);
        el.textContent = String(Math.round(target * (1 - (1 - progress) ** 3)));
        if (progress < 1) frame = requestAnimationFrame(tick);
        else finish();
      };
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    observer.observe(el);
    motion.addEventListener("change", finish);
    return () => { observer.disconnect(); motion.removeEventListener("change", finish); finish(); };
  }, [value, animate]);

  return <><span className="sr-only">{value}</span><span ref={ref} aria-hidden="true" style={{ display: "inline-block", minWidth: `${value.length}ch` }}>{value}</span></>;
}
