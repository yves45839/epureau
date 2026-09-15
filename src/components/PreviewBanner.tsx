import { draftMode } from "next/headers";
import { currentUser } from "@/lib/auth";
import { storeConfigured } from "@/lib/admin-store";
export default async function PreviewBanner(){
 if(!storeConfigured()||!(await draftMode()).isEnabled||!(await currentUser()))return null;
 return <aside className="preview-banner">Aperçu privé des brouillons <a href="/api/admin/preview?exit=1">Quitter l’aperçu</a></aside>;
}
