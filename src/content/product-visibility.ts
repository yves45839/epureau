import type { Document } from "./admin-types";

/** Existing products outside these brands start hidden; an administrator can override this. */
export function productHidden(document: Pick<Document, "hidden" | "draft" | "published">) {
  if (typeof document.hidden === "boolean") return document.hidden;
  const brand = (document.published?.marque ?? document.draft.marque ?? "").trim().toUpperCase();
  return !["NALCO", "ECOLAB"].includes(brand);
}
