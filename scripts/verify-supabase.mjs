import {readFile} from "node:fs/promises";
import {parseEnv} from "node:util";
import {fileURLToPath} from "node:url";
process.chdir(fileURLToPath(new URL("..",import.meta.url)));
const env=parseEnv(await readFile(".env.local","utf8"));
const base=process.argv.includes('--production')?'https://epureau.vercel.app':'http://127.0.0.1:3001';
let cookie, uploaded;
try {
 const login=await fetch(base+"/api/admin/login",{method:"POST",redirect:"manual",headers:{Origin:base},body:new URLSearchParams({email:env.ADMIN_EMAIL,motdepasse:env.ADMIN_PASSWORD}),signal:AbortSignal.timeout(30000)});
 if(login.status!==303 || login.headers.get("location")!==base+"/admin")throw new Error("Connexion administrateur non validee.");
 cookie=login.headers.get("set-cookie").split(";")[0];
 for(const section of ["pages","projects","requests","audit"]){
  const response=await fetch(base+"/api/admin/content?section="+section,{headers:{Cookie:cookie},signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw new Error("Lecture de la rubrique "+section+" refusee.");
  await response.json();
 }
 console.log("Administration : connexion et rubriques validees sur la base Supabase.");
 const denied=await fetch(base+"/api/admin/content?section=requests",{signal:AbortSignal.timeout(30000)});
 if(denied.status!==401)throw new Error("Protection des demandes non validee.");
 const form=new FormData();
 form.set("file",new Blob([await readFile("public/images/logo.png")],{type:"image/png"}),"verification-logo.png");
 const response=await fetch(base+"/api/admin/upload",{method:"POST",headers:{Origin:base,Cookie:cookie},body:form,signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw new Error("Televersement Supabase non valide.");
 uploaded=(await response.json()).url;
 const prefix=env.SUPABASE_URL+"/storage/v1/object/public/site-media/";
 if(!uploaded?.startsWith(prefix))throw new Error("Adresse du media inattendue.");
 const view=await fetch(uploaded,{signal:AbortSignal.timeout(15000)});
 if(!view.ok)throw new Error("Lecture du media non validee.");
 await view.arrayBuffer();
 console.log("Stockage : televersement et lecture d'une image valides.");
 console.log("Verification reussie. Aucun message client ni e-mail envoye.");
} catch(error) {
 console.error(error.message==="fetch failed"?"Serveur de verification indisponible.":error.message);
 process.exitCode=1;
} finally {
 if(cookie)await fetch(base+"/api/admin/login",{method:"DELETE",headers:{Origin:base,Cookie:cookie}}).catch(()=>{});
 const prefix=env.SUPABASE_URL+"/storage/v1/object/public/site-media/";
 if(uploaded?.startsWith(prefix)){
  const key=uploaded.slice(prefix.length);
  if(/^[a-f0-9-]{36}\.png$/.test(key)){
   const secret=env.SUPABASE_SECRET_KEY||env.SUPABASE_SERVICE_ROLE_KEY;
   const result=await fetch(env.SUPABASE_URL+"/storage/v1/object/site-media",{method:"DELETE",headers:{apikey:secret,...(secret.startsWith("sb_secret_")?{}:{Authorization:"Bearer "+secret}),"Content-Type":"application/json"},body:JSON.stringify({prefixes:[key]}),redirect:"error",signal:AbortSignal.timeout(15000)}).catch(()=>null);
   console.log(result?.ok?"Image de verification retiree.":"Image de verification conservee : nettoyage a terminer.");
  }
 }
}
