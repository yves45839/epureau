import {readFile} from "node:fs/promises";
import {parseEnv} from "node:util";
import {fileURLToPath} from "node:url";
import postgres from "postgres";
process.chdir(fileURLToPath(new URL("..", import.meta.url)));
const env=parseEnv(await readFile(".env.local","utf8"));
let sql;
try {
 if(!env.DATABASE_URL || !env.SUPABASE_URL)throw new Error("Configuration Supabase manquante.");
 const project=new URL(env.SUPABASE_URL);
 if(project.protocol!=="https:"||!/^[a-z0-9-]+\.supabase\.co$/.test(project.hostname))throw new Error("URL Supabase invalide.");
 const secret=env.SUPABASE_SECRET_KEY||env.SUPABASE_SERVICE_ROLE_KEY;
 if(!secret)throw new Error("Cle serveur manquante.");
 sql=postgres(env.DATABASE_URL,{ssl:"require",max:1,prepare:false,connect_timeout:10});
 await sql.unsafe("create table if not exists public.admin_records(kind text not null,key text not null,value jsonb not null,revision integer not null default 1,updated timestamptz not null default now(),primary key(kind,key))");
 await sql.unsafe("alter table public.admin_records enable row level security");
 const state=await sql.unsafe("select relrowsecurity from pg_class where oid='public.admin_records'::regclass");
 if(!state[0]?.relrowsecurity)throw new Error("Securite par ligne non active.");
 console.log("PostgreSQL : table d'administration prete, securite par ligne active.");
 const headers={apikey:secret,...(secret.startsWith("sb_secret_")?{}:{Authorization:"Bearer "+secret})};
 const bucketURL=project.origin+"/storage/v1/bucket";
 const read=()=>fetch(bucketURL+"/site-media",{headers,redirect:"error",signal:AbortSignal.timeout(20000)});
 let bucket=await read();
 if(!bucket.ok){
  const error=await bucket.json().catch(()=>({}));
  const missing=bucket.status===404 || error.statusCode==="404" || error.error==="not_found";
  if(!missing)throw new Error("Lecture du stockage refusee.");
  const created=await fetch(bucketURL,{method:"POST",headers:{...headers,"Content-Type":"application/json"},redirect:"error",signal:AbortSignal.timeout(20000),body:JSON.stringify({id:"site-media",name:"site-media",public:true,file_size_limit:4194304,allowed_mime_types:["image/jpeg","image/png","image/webp","application/pdf"]})});
  if(!created.ok)throw new Error("Creation du stockage refusee.");
  bucket=await read();
 }
 if(!bucket.ok)throw new Error("Verification du stockage impossible.");
 const info=await bucket.json();
 if(!info.public)throw new Error("Le bucket site-media existant est prive. Aucun droit n'a ete modifie.");
 console.log("Stockage : site-media disponible pour les images et PDF publics.");
 console.log("Preparation Supabase terminee. Aucun abonnement cree.");
} catch(error){
 console.error("Preparation impossible : "+(["Configuration Supabase manquante.","URL Supabase invalide.","Cle serveur manquante.","Securite par ligne non active.","Lecture du stockage refusee.","Creation du stockage refusee.","Verification du stockage impossible.","Le bucket site-media existant est prive. Aucun droit n'a ete modifie."].includes(error.message)?error.message:"connexion au service indisponible."));
 process.exitCode=1;
} finally {if(sql)await sql.end({timeout:2}).catch(()=>{});}
