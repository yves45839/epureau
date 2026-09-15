import { publishedDocuments } from "@/lib/cms";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui";
export default async function Legal(){const text=(await publishedDocuments("settings"))[0]?.data.legal;if(!text)notFound();return <><PageHeader fil={["Mentions légales"]} titre="Mentions légales" lead="EPUREAU Côte d’Ivoire" /><section className="sec"><div className="wrap" style={{whiteSpace:"pre-line"}}>{text}</div></section></>;}
