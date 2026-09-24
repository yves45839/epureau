import UiText from "@/components/UiText";
import Link from "next/link";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import { publishedDocuments } from "@/lib/cms";
import { currentUser } from "@/lib/auth";
import { may } from "@/lib/admin-security";
import { PageHeader } from "@/components/ui";
export default async function Blog(){
 const settings=(await publishedDocuments("settings"))[0]?.data;
 const user=(await draftMode()).isEnabled?await currentUser():null;
 if(settings?.blogEnabled!=="oui"&&!(user&&may(user.role,"blog")))notFound();
 const articles=await publishedDocuments("blog");
 return <><PageHeader fil={["Blog"]} titre="Actualités et expertise" lead="Les nouvelles et les conseils d’EPUREAU Côte d’Ivoire" /><section className="sec"><div className="wrap career-domains">{articles.map(({key,data})=><Link key={key} href={"/blog/"+key}>{data.image&&<img src={data.image} alt="" width="640" height="360" loading="lazy" />}<h2>{data.title}</h2><p>{data.description}</p></Link>)}{!articles.length&&<p><UiText text="Aucun article publié pour le moment." /></p>}</div></section></>;
}
