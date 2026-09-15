import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {parseEnv} from "node:util";
import {randomUUID} from "node:crypto";
const base="http://127.0.0.1:3000";
const env=parseEnv(await readFile(".env.local","utf8"));
assert.equal(env.ADMIN_LOCAL_STORE,"1","Only run against the local demonstration");
let checks=0;
function ok(value,message){assert.ok(value,message);checks++;}
async function login(email,password){
 const r=await fetch(base+"/api/admin/login",{method:"POST",redirect:"manual",headers:{Origin:base},body:new URLSearchParams({email,motdepasse:password})});
 assert.equal(r.status,303);assert.equal(r.headers.get("location"),base+"/admin");
 return r.headers.get("set-cookie").split(";")[0];
}
async function api(cookie,section,body){
 const r=await fetch(base+"/api/admin/content"+(body?"":"?section="+section),{method:body?"POST":"GET",headers:{Origin:base,Cookie:cookie||"","Content-Type":"application/json"},body:body?JSON.stringify({section,...body}):undefined});
 return {status:r.status,...await r.json()};
}
const owner=await login(env.ADMIN_EMAIL,env.ADMIN_PASSWORD);
ok((await api("","pages")).status===401,"Anonymous access denied");
const csrf=await fetch(base+"/api/admin/content",{method:"POST",headers:{Cookie:owner,Origin:"https://example.invalid","Content-Type":"application/json"},body:"{}"});
ok(csrf.status===403,"Cross-origin mutations denied");
const tag="qa-"+randomUUID().slice(0,8);
const accounts=[];
let pageOriginal, pageCurrent;
try{
 for(const role of ["editeur","commercial"]){
  const email=tag+"-"+role+"@example.invalid",password=randomUUID()+"-Aa";
  const created=await api(owner,"users",{key:email,revision:0,action:"save",data:{email,name:"TEST "+role,role,active:"oui",password}});
  ok(created.status===200,"Create "+role);
  accounts.push({email,password,record:created.record,cookie:await login(email,password)});
 }
 const [editor,sales]=accounts;
 ok((await api(editor.cookie,"requests")).status===403,"Editor cannot see private requests");
 ok((await api(sales.cookie,"pages")).status===403,"Commercial cannot edit pages");
 ok((await api(editor.cookie,"pages")).status===200,"Editor can edit content");
 const list=await api(owner,"pages");
 pageOriginal=list.data.find(r=>r.key==="carriere");assert.ok(pageOriginal);
 const field=list.pages.find(r=>r.key==="carriere").fields.find(f=>f.type==="text");
 pageCurrent=(await api(owner,"pages",{key:pageOriginal.key,revision:pageOriginal.revision,action:"save",data:{...pageOriginal.value.draft,[field.key]:tag},title:pageOriginal.value.title})).record;
 assert.ok(pageCurrent,"Draft saved");
 ok(!(await (await fetch(base+"/carriere")).text()).includes(tag),"Draft absent from public page");
 const preview=await fetch(base+"/api/admin/preview?path=/carriere",{headers:{Cookie:owner},redirect:"manual"});
 ok(preview.status===307,"Private preview enabled");
 const draftCookies=preview.headers.getSetCookie().map(c=>c.split(";")[0]).join("; ");
 ok((await (await fetch(base+"/carriere",{headers:{Cookie:owner+"; "+draftCookies}})).text()).includes(tag),"Authenticated preview renders draft");
 ok(!(await (await fetch(base+"/carriere",{headers:{Cookie:draftCookies}})).text()).includes(tag),"Preview cookie without login does not disclose draft");
 const conflict=await api(owner,"pages",{key:pageOriginal.key,revision:pageOriginal.revision,action:"save",data:pageOriginal.value.draft});
 ok(conflict.status===409,"Stale update rejected");
 pageCurrent=(await api(owner,"pages",{key:pageOriginal.key,revision:pageCurrent.revision,action:"publish",data:pageCurrent.value.draft})).record;
 ok((await (await fetch(base+"/carriere")).text()).includes(tag),"Published content visible");
 const projects=await api(owner,"projects");const project=projects.data[0];
 const saved=await api(owner,"projects",{key:project.key,revision:project.revision,action:"save",data:project.value.draft});
 ok(saved.status===200,"Existing project editable with its procedure field");
 const invalid=new FormData();invalid.set("file",new Blob(["fake"],{type:"image/png"}),"fake.png");
 const rejected=await fetch(base+"/api/admin/upload",{method:"POST",headers:{Origin:base,Cookie:owner},body:invalid});
 ok(rejected.status===422,"Invalid image content rejected");
 const file=new FormData();file.set("file",new Blob([await readFile("public/images/logo.png")],{type:"image/png"}),"logo-test.png");
 const uploaded=await fetch(base+"/api/admin/upload",{method:"POST",headers:{Origin:base,Cookie:owner},body:file});const media=await uploaded.json();
 ok(uploaded.status===200,"Image upload succeeds");
 ok((await fetch(base+media.url)).status===200,"Uploaded image retrievable");
 const complaint=await fetch(base+"/api/reclamation",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({nom:"TEST AUTOMATIQUE",societe:tag,email:tag+"@example.invalid",categorie:"Produits chimiques",description:"Demande de test locale, aucune action commerciale."})});
 ok(complaint.status===200,"Complaint persisted without external email");
 const requests=await api(owner,"requests");const row=requests.data.find(r=>r.value.societe===tag);
 ok(!!row,"Complaint visible to administrator");
 const follow=await api(sales.cookie,"requests",{key:row.key,revision:row.revision,action:"save",data:{statut:"en_cours",assigned:sales.email,note:"Vérification automatique locale"}});
 ok(follow.status===200&&follow.record.value.history.length===1,"Assignment, status and history saved");
 const csv=await fetch(base+"/api/admin/content?section=requests&format=csv",{headers:{Cookie:owner}});
 ok(csv.status===200&&(await csv.text()).includes(tag),"CSV export includes request");
 const reset=await api(owner,"users",{key:editor.email,revision:editor.record.revision,action:"save",data:{email:editor.email,name:"TEST editeur",role:"editeur",active:"oui",password:randomUUID()+"-Aa"}});
 editor.record=reset.record;ok(reset.status===200,"Password reset");
 ok((await api(editor.cookie,"pages")).status===401,"Password reset invalidates previous session");
 const logout=await fetch(base+"/api/admin/login",{method:"DELETE",headers:{Origin:base,Cookie:sales.cookie}});
 ok(logout.status===200&&(await api(sales.cookie,"requests")).status===401,"Logout revokes server session");
 console.log(checks+" integration checks passed");
}finally{
 if(pageOriginal&&pageCurrent){
  const restored=await api(owner,"pages",{key:pageOriginal.key,revision:pageCurrent.revision,action:"publish",title:pageOriginal.value.title,order:pageOriginal.value.order,data:pageOriginal.value.published||pageOriginal.value.draft});
  assert.equal(restored.status,200,"Restore public content");
  if(JSON.stringify(pageOriginal.value.draft)!==JSON.stringify(pageOriginal.value.published))await api(owner,"pages",{key:pageOriginal.key,revision:restored.record.revision,action:"save",data:pageOriginal.value.draft});
 }
 for(const account of accounts){
  await api(owner,"users",{key:account.email,revision:account.record.revision,action:"save",data:{email:account.email,name:"TEST désactivé",role:"editeur",active:"non",password:""}});
 }
 await fetch(base+"/api/admin/login",{method:"DELETE",headers:{Origin:base,Cookie:owner}});
}
