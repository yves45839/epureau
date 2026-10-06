import manifest from "./imported-products.json";
import translations from "./imported-products-en.json";
import type {ContentData} from "./admin-types";

// Workbook provenance stays server-side; only the editable product data is seeded.
export const importedProducts = manifest.products.map(({slug, data}) => {
  const translated = (translations as Record<string, Record<string, string>>)[slug] ?? {};
  return {slug, data: {...data, __en: JSON.stringify(Object.fromEntries(
    Object.entries(translated).map(([key, text]) => ["field:" + key, {source: (data as ContentData)[key], text, manual: true}])
  ))} as ContentData};
});
