import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {z} from 'zod';
function load(path,deps,extra={}){const exports={};vm.runInNewContext(ts.transpileModule(readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:n=>{if(!(n in deps))throw Error(n);return deps[n];},Response,URL,Date,...extra});return exports;}
const {replyEmail}=load('../src/content/reply-email.ts',{});
const input={requestKey:'customer',id:'c289a9d6-7eaa-4164-9238-cb3dd842e2f7',subject:'Votre demande',message:'Bonjour, voici notre réponse.'};
function fixture({role='admin',origin=true,configured=true,failed=false}={}){
 const rows=new Map(),sent=[];let fail=failed;
 class Conflict extends Error{}
 const api=load('../src/app/api/admin/replies/route.ts',{
 'zod':{z},'resend':{Resend:class{emails={send:async(data,options)=>{sent.push({data,options});return fail?{error:{message:'failed'}}:{data:{id:'provider-id'}};}}}},
 '@/lib/auth':{currentUser:async()=>role?{name:'Équipe',email:'agent@epureau-ci.com',role}:null,sameOrigin:()=>origin},
 '@/content/admin-access':{may:r=>['admin','commercial'].includes(r)},
 '@/content/reply-email':{replyEmail},
 '@/lib/admin-store':{Conflict,entry:async(kind,key)=>kind==='requests'?{value:{email:'client@example.com'}}:rows.get(key),entries:async()=>[...rows.values()],save:async(kind,key,value,expected)=>{if((rows.get(key)?.revision||0)!==expected)throw new Conflict();const row={key,value,revision:expected+1};rows.set(key,row);return row;}},
 },{process:{env:configured?{RESEND_API_KEY:'test',MAIL_FROM:'EPUREAU <contact@epureau-ci.com>',MAIL_REPLY_TO:'contact@epureau-ci.com'}:{}}});
 return {rows,sent,recover:()=>{fail=false;},post:(data=input)=>api.POST(new Request('https://example.com/api/admin/replies',{method:'POST',body:JSON.stringify(data)}))};
}
test('refuse les accès anonymes, les éditeurs et les origines étrangères',async()=>{for(const [options,status] of [[{role:null},401],[{role:'editeur'},403],[{origin:false},403]]){const f=fixture(options);assert.equal((await f.post()).status,status);assert.equal(f.sent.length,0);}});
test('ne prétend pas envoyer sans configuration',async()=>{const f=fixture({configured:false});assert.equal((await f.post()).status,503);assert.equal(f.sent.length,0);});
test('envoie au client enregistré et conserve un historique, sans doublon',async()=>{const f=fixture({role:'commercial'});assert.equal((await f.post({...input,to:'intruder@example.com'})).status,200);assert.equal(f.sent[0].data.to,'client@example.com');assert.equal((await f.post()).status,200);assert.equal(f.sent.length,1);assert.equal(f.rows.get(input.id).value.status,'sent');});
test('une tentative non confirmée garde sa clé et son contenu',async()=>{const f=fixture({failed:true});assert.equal((await f.post()).status,502);assert.equal((await f.post({...input,message:'Un autre texte'})).status,409);f.recover();assert.equal((await f.post()).status,200);assert.equal(f.sent[0].options.idempotencyKey,f.sent[1].options.idempotencyKey);});
test('bloque une reprise après expiration de la protection du fournisseur',async()=>{const f=fixture({failed:true});await f.post();f.rows.get(input.id).value.date='2020-01-01';assert.equal((await f.post()).status,409);assert.equal(f.sent.length,1);});
test('refuse les en-têtes injectés et neutralise le HTML dans les modèles',async()=>{const f=fixture();assert.equal((await f.post({...input,subject:'test\r\nBcc:bad@example.com'})).status,422);const html=replyEmail('<script>','<img src=x onerror=alert(1)>','A & B');assert.ok(!html.includes('<script>'));assert.ok(!html.includes('<img'));assert.ok(html.includes('A &amp; B'));});
