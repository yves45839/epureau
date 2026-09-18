export type Role = "admin" | "editeur" | "commercial";
export function may(role:Role,section:string){if(role==="admin")return true;if(section==="dashboard"||section==="audience")return true;return role==="editeur"?["pages","projects","media","brochures","blog"].includes(section):section==="requests";}
