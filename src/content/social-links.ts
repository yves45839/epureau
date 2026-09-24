import {reseaux} from "./site";

export function socialLinks(settings: Record<string, string> = {}) {
  const links = {...reseaux};
  for (const key of ["facebook", "linkedin", "youtube"] as const) {
    if (settings[key]) links[key] = settings[key];
  }
  if (links.facebook.replace(/\/$/, "") === "https://www.facebook.com/people/Epureau-CI/100067092456207") links.facebook = reseaux.facebook;
  return links;
}
