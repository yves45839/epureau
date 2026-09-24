import { z } from "zod";
import type { ContentData } from "./admin-types";
import { layoutSchema } from "./page-builder";

export type TranslationField = { key: string; label: string; type?: string };
export type TranslationEntry = { source: string; text: string; manual: boolean };
export type EnglishTranslations = Record<string, TranslationEntry>;
export type TranslationUnit = { key: string; label: string; source: string; limit: number };
const translationsSchema = z.record(z.string().max(240), z.object({
  source: z.string().max(24000), text: z.string().max(24000), manual: z.boolean(),
}).strict()).refine(value => Object.keys(value).length <= 1200);
const protectedFields = new Set(["email", "notificationEmails", "telephone", "telephoneLien", "adresse", "boitePostale", "maps", "site", "groupe", "linkedin", "facebook", "youtube", "blogEnabled", "marque", "reference", "documentType", "documentLangue", "fiche", "sourceUrl", "client", "debit", "unite"]);
export function isTranslatable(field: TranslationField, section: string) {
  return !["image", "url", "brand", "mediaType"].includes(field.type || "") &&
    !protectedFields.has(field.key) && !(section === "settings" && field.key === "nom") && !field.key.startsWith("__");
}
export function readEnglish(data: ContentData): EnglishTranslations {
  if (!data.__en) return {};
  try { return translationsSchema.parse(JSON.parse(data.__en)); } catch { return {}; }
}
/** Stable block/item ids keep translations attached to their content after reordering. */
export function translationUnits(data: ContentData, fields: TranslationField[], section: string): TranslationUnit[] {
  const units: TranslationUnit[] = [];
  function add(key: string, label: string, source: string, limit = 24000) {
    if (source.trim() && /\p{L}/u.test(source) && !/^(?:https?:\/\/|mailto:|tel:|\/[^\s]*$)/i.test(source) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(source)) units.push({ key, label, source, limit });
  }
  for (const field of fields) if (isTranslatable(field, section)) add("field:" + field.key, field.label, data[field.key] || "");
  if (data.__layout) {
    let layout;
    try { layout = layoutSchema.parse(JSON.parse(data.__layout)); } catch { layout = {version:1,sections:[]}; }
    for (const block of layout.sections) if (block.type !== "builtin") {
      for (const name of ["title", "text", "alt", "buttonLabel"] as const) add(`block:${block.id}:${name}`, `${block.title || "Section"} · ${name}`, block[name], name === "text" ? 10000 : 200);
      for (const item of block.items) for (const name of ["title", "text", "alt"] as const) add(`item:${block.id}:${item.id}:${name}`, `${block.title || "Section"} · ${item.title || "Élément"} · ${name}`, item[name], name === "text" ? 5000 : 200);
    }
  }
  if (data.__blocks) {
    const blocks = JSON.parse(data.__blocks) as {title:string;text:string}[];
    blocks.forEach((block, i) => {
      add(`legacy:${i}:title`, `Bloc ${i + 1} · titre`, block.title, 200);
      add(`legacy:${i}:text`, `Bloc ${i + 1} · texte`, block.text, 10000);
    });
  }
  return units;
}
export function validateEnglish(data: ContentData, fields: TranslationField[], section: string) {
  if (!data.__en) return;
  const translations = translationsSchema.parse(JSON.parse(data.__en));
  const units = new Map(translationUnits(data, fields, section).map(unit => [unit.key, unit]));
  for (const [key, value] of Object.entries(translations)) {
    const unit = units.get(key);
    if (!unit || value.text.length > unit.limit) throw new Error("Traduction inconnue ou trop longue.");
  }
}
export function pruneEnglish(data: ContentData, fields: TranslationField[], section: string): ContentData {
  const allowed = new Set(translationUnits(data, fields, section).map(unit => unit.key));
  return { ...data, __en: JSON.stringify(Object.fromEntries(Object.entries(readEnglish(data)).filter(([key]) => allowed.has(key)))) };
}
/** Never display a translation of an older French source. Draft/public separation stays in the CMS. */
export function englishContent(data: ContentData): ContentData {
  const translations = readEnglish(data);
  const result = { ...data };
  const translated = (key: string, source: string) => {
    const entry = translations[key];
    return entry && entry.source === source && entry.text.trim() ? entry.text : source;
  };
  for (const [key, source] of Object.entries(data)) if (!key.startsWith("__")) result[key] = translated("field:" + key, source);
  if (data.__layout) {
    const layout = layoutSchema.parse(JSON.parse(data.__layout));
    for (const block of layout.sections) if (block.type !== "builtin") {
      for (const name of ["title", "text", "alt", "buttonLabel"] as const) block[name] = translated(`block:${block.id}:${name}`, block[name]);
      for (const item of block.items) for (const name of ["title", "text", "alt"] as const) item[name] = translated(`item:${block.id}:${item.id}:${name}`, item[name]);
    }
    result.__layout = JSON.stringify(layout);
  }
  if (data.__blocks) {
    const blocks = JSON.parse(data.__blocks) as {title:string;text:string}[];
    result.__blocks = JSON.stringify(blocks.map((block, i) => ({...block, title:translated(`legacy:${i}:title`,block.title), text:translated(`legacy:${i}:text`,block.text)})));
  }
  delete result.__en;
  return result;
}
