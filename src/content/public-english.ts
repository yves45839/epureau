import type {ContentData} from "./admin-types";
import {englishContent} from "./translations";
import {uiText} from "./ui-english";

// These values drive links, validation and filters; translate their display labels only.
const fixedFields=/^field:(?:marque|reference|documentType|documentLangue|fiche|sourceUrl|url|image|email|notificationEmails|telephone|telephoneLien|adresse|boitePostale|maps|site|linkedin|facebook|youtube|blogEnabled)$/;
/** Published CMS translations take priority; known French copy has a built-in fallback. */
export function publicEnglish(data:ContentData):ContentData {
 return englishContent(data,(source,key)=>fixedFields.test(key)?source:uiText(source,"en"));
}
