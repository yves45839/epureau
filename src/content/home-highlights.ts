import type {ContentData, Media} from "./admin-types";
import {safeBuilderUrl} from "./page-builder";

export const announcementTypes = ["Actualité", "Recrutement", "Événement"] as const;
export type Announcement = {key:string;data:ContentData};

export function validAnnouncement(data:ContentData) {
  const date = (value:string) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
  return Boolean(data.title?.trim()) && data.title.length <= 200 &&
    Boolean(data.description?.trim()) && data.description.length <= 2000 && (!data.linkLabel || data.linkLabel.length<=200) &&
    announcementTypes.includes(data.category as typeof announcementTypes[number]) &&
    safeBuilderUrl(data.url || "") && date(data.startsOn || "") && date(data.endsOn || "") &&
    !(data.startsOn && data.endsOn && data.endsOn < data.startsOn);
}

// Abidjan uses UTC. End dates include the whole selected day.
export function activeAnnouncements(items:Announcement[], now=new Date()) {
  const today=now.toISOString().slice(0,10);
  return items.filter(({data})=>validAnnouncement(data) &&
    (!data.startsOn || data.startsOn<=today) && (!data.endsOn || data.endsOn>=today));
}

export function videoSource(value:string):{kind:"youtube"|"file"|"sharepoint";src:string}|null {
  if (!value || !safeBuilderUrl(value) || value.startsWith("#")) return null;
  try {
    const url=new URL(value,"https://epureau-ci.com");
    // Sharing pages open in their own tab; they are not public MP4 or embed URLs.
    if(url.protocol==="https:" && /^[a-z0-9-]+\.sharepoint\.com$/i.test(url.hostname) && (url.pathname.startsWith('/:v:/') || /\/_layouts\/15\/stream\.aspx$/i.test(url.pathname))) return {kind:"sharepoint",src:value};
    if (["youtube.com","www.youtube.com","m.youtube.com","youtu.be","www.youtube-nocookie.com"].includes(url.hostname)) {
      const id=url.hostname==="youtu.be"?url.pathname.slice(1):url.pathname==="/watch"?url.searchParams.get("v"):url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)$/)?.[1];
      return id && /^[a-zA-Z0-9_-]{11}$/.test(id)?{kind:"youtube",src:`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0`}:null;
    }
    return /\.(mp4|webm|m4v)$/i.test(url.pathname)?{kind:"file",src:value}:null;
  } catch {return null;}
}

export function homeVideo(items:Media[]) {
  return items.find(item=>item.type==="video" && item.homeFeatured==="oui" && videoSource(item.url));
}
