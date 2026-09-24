"use client";

import { useEffect, useState } from "react";
import Icon from "./Icon";
import {useUi} from "./UiText";

export default function ToTop() {
  const ui=useUi();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 800);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      className={`totop${visible ? " show" : ""}`}
      aria-label={ui("Revenir en haut de la page")}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <Icon name="up" />
    </button>
  );
}
