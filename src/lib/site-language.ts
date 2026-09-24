import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
export const siteLanguage=cache(async():Promise<"fr"|"en">=>(await headers()).get("x-epureau-language")==="en"?"en":"fr");
