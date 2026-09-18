"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { mesurerPage } from "./audience-client";

/** Compteur de fréquentation interne : aucun cookie, aucune donnée transmise à un tiers. */
export default function Audience() {
  const pathname = usePathname();
  const dernier = useRef("");
  useEffect(() => {
    if (dernier.current === pathname) return;
    dernier.current = pathname;
    mesurerPage(pathname);
  }, [pathname]);
  return null;
}
