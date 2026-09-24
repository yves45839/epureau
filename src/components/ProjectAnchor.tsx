"use client";
import {useEffect} from "react";

export default function ProjectAnchor() {
  useEffect(() => {
    const reveal = () => {
      let id: string;
      try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
      const project = document.getElementById(id);
      if (!project?.matches("article.proj")) return;
      const details = project.querySelector("details");
      if (details) details.open = true;
      project.tabIndex = -1;
      project.focus({preventScroll: true});
      project.scrollIntoView({block: "start"});
    };
    reveal();
    window.addEventListener("hashchange", reveal);
    return () => window.removeEventListener("hashchange", reveal);
  }, []);
  return null;
}
