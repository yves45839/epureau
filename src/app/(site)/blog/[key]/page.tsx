import { notFound } from "next/navigation";
import { publishedDocuments } from "@/lib/cms";
import { draftMode } from "next/headers";
import { currentUser } from "@/lib/auth";
import { may } from "@/lib/admin-security";
import { PageHeader } from "@/components/ui";
export default async function Article({params}:{params:Promise<{key:string}>}){
 const {key}=await params;const settings=(await publishedDocuments("settings"))[0]?.data;
 const user=(await draftMode()).isEnabled?await currentUser():null;
 if(settings?.blogEnabled!=="oui"&&!(user&&may(user.role,"blog")))notFound();
 const article=(await publishedDocuments("blog")).find(d=>d.key===key);if(!article)notFound();
 return <><PageHeader fil={["Blog",article.data.title]} titre={article.data.title} lead={article.data.description} /><section className="sec"><div className="wrap cms-blocks"><article>{article.data.image&&<img src={article.data.image} alt="" width="960" height="540" />}<p style={{whiteSpace:"pre-line"}}>{article.data.text}</p></article></div></section></>;
}
