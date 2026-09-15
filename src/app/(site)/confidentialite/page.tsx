import { publishedDocuments } from "@/lib/cms";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui";
export default async function Privacy(){const text=(await publishedDocuments("settings"))[0]?.data.privacy;if(!text)notFound();return <><PageHeader fil={["Confidentialité"]} titre="Politique de confidentialité" lead="EPUREAU Côte d’Ivoire" /><section className="sec"><div className="wrap" style={{whiteSpace:"pre-line"}}>{text}</div></section></>;}
