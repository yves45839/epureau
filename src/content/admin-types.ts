export type Field = { key: string; label: string; type?: "text" | "long" | "image" | "url"; value: string };
export type PageDefinition = { key: string; title: string; path: string; fields: Field[] };
export type ContentData = Record<string, string>;
export type Document = { title: string; draft: ContentData; published: ContentData | null; deleted?: boolean; order: number };
export type Project = { slug:string; nom:string; client:string; type:string; debit:string; unite:string; texte:string; image:string };
export type Media = { id:string; title:string; description:string; url:string; image:string; type:string; album:string };
