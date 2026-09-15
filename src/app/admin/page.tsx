import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminConsole from "@/components/AdminConsole";
import { currentUser } from "@/lib/auth";
import { localStore } from "@/lib/admin-store";
import { requestList } from "@/lib/admin-requests";
import { may } from "@/lib/admin-security";
export const metadata:Metadata={title:"Administration",robots:{index:false,follow:false}};
export const dynamic="force-dynamic";
export default async function AdminPage(){
 const user=await currentUser();if(!user)redirect("/admin/login");
 const requests=may(user.role,"requests")?await requestList():[];
 return <AdminConsole user={user} initial={{data:requests}} local={localStore()} />;
}
