import "server-only";
import { randomUUID } from "node:crypto";
import { assurerSchema } from "./db";
import { entries, entry, save, localStore, storeConfigured } from "./admin-store";
export type CustomerRequest={nom:string;societe:string;email:string;telephone:string;objet:string;besoin:string;source:string;cree_le:string;statut:string;assigned:string;history:{date:string;actor:string;message:string}[]};
export async function recordRequest(data:Omit<CustomerRequest,"cree_le"|"statut"|"assigned"|"history">) {
 if(!storeConfigured())return false;
 await save("requests",randomUUID(),{...data,cree_le:new Date().toISOString(),statut:"nouvelle",assigned:"",history:[]},0);
 return true;
}
export async function requestList() {
 if(storeConfigured()&&!localStore()){
  const sql=await assurerSchema();
  if(sql) {
   // Import old requests once per key without overwriting subsequent admin changes.
   for(const old of await sql`select * from demandes order by cree_le desc`){
    const key="legacy-"+old.id;
    if(!(await entry("requests",key))){
     try { await save("requests",key,{...old,cree_le:new Date(old.cree_le).toISOString(),assigned:"",history:[]},0); } catch { /* imported by another request */ }
    }
   }
  }
 }
 return (await entries<CustomerRequest>("requests")).sort((a,b)=>b.value.cree_le.localeCompare(a.value.cree_le));
}
