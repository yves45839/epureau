import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
const base='http://127.0.0.1:3002';
const env=JSON.parse(await readFile('.local/builder-test-env.json','utf8'));
assert.equal(env.ADMIN_LOCAL_STORE,'1');assert.equal(env.ADMIN_LOCAL_DATASET,'builder-test');assert.equal(env.DATABASE_URL,'');
let checks=0,cookie='',page,home;
const slug='test-builder-'+randomUUID().slice(0,8),key='custom-'+slug;
function missing(page){return page.status===404||page.text.includes('name="robots" content="noindex"');}
function ok(value,message){assert.ok(value,message);checks++;console.log('OK '+message);}
async function api(body,session=cookie){const r=await fetch(base+'/api/admin/content'+(body?'':'?section=pages'),{method:body?'POST':'GET',headers:{Origin:base,Cookie:session,'Content-Type':'application/json'},body:body?JSON.stringify({section:'pages',...body}):undefined,signal:AbortSignal.timeout(180000)});return {status:r.status,...await r.json()};}
async function html(path,session=''){const r=await fetch(base+path,{headers:{Cookie:session},signal:AbortSignal.timeout(180000)});return {status:r.status,text:(await r.text()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'')};}
const block=(id,title,type='text')=>({id,type,title,text:'Contenu de vérification',image:'',alt:'',href:'',buttonLabel:'En savoir plus',theme:'light',items:[]});
try{
 const login=await fetch(base+'/api/admin/login',{method:'POST',redirect:'manual',headers:{Origin:base},body:new URLSearchParams({email:env.ADMIN_EMAIL,motdepasse:env.ADMIN_PASSWORD})});assert.equal(login.status,303);assert.equal(login.headers.get('location'),base+'/admin');cookie=login.headers.get('set-cookie').split(';')[0];
 ok((await api(null,'')).status===401,'Accès anonyme refusé');
 const data={title:'PAGE DE VERIFICATION',description:'Brouillon privé',__navigation:'oui',__layout:JSON.stringify({version:1,sections:[block('a','SECTION ALPHA'),block('b','SECTION BETA')]})};
 let r=await api({key,revision:0,action:'save',data,title:'PAGE TEST'});ok(r.status===200,'Création en brouillon');page=r.record;
 ok(missing(await html('/'+slug)),'Nouvelle page invisible avant publication');
 const preview=await fetch(base+'/api/admin/preview?path=/'+slug,{redirect:'manual',headers:{Cookie:cookie}});ok(preview.status===307,'Aperçu de nouvelle page autorisé');
 const draft=preview.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');
 ok((await html('/'+slug,cookie+'; '+draft)).text.includes('SECTION ALPHA'),'Aperçu privé du contenu');
 ok(missing(await html('/'+slug,draft)),'Cookie d’aperçu seul insuffisant');
 r=await api({key,revision:page.revision,action:'publish',data});ok(r.status===200,'Publication de la page');page=r.record;
 let out=await html('/'+slug);ok(out.status===200&&out.text.includes('SECTION ALPHA'),'Page publiée accessible');
 ok((await html('/carriere')).text.includes('href="/'+slug+'"'),'Lien public dans le pied de page');
 const revised={...data,__layout:JSON.stringify({version:1,sections:[block('b','SECTION BETA'),block('c','SECTION GAMMA','carousel')]})};
 r=await api({key,revision:page.revision,action:'save',data:revised});page=r.record;ok((await html('/'+slug)).text.includes('SECTION ALPHA'),'Brouillon ne modifie pas la version publiée');
 r=await api({key,revision:page.revision,action:'publish',data:revised});page=r.record;out=await html('/'+slug);ok(!out.text.includes('SECTION ALPHA')&&out.text.indexOf('SECTION BETA')<out.text.indexOf('SECTION GAMMA'),'Retrait et ordre des sections publiés');
 ok((await api({key,revision:0,action:'save',data})).status===409,'Conflit de modification détecté');
 ok((await api({key:'custom-admin',revision:0,action:'save',data})).status===422,'Adresse système réservée refusée');
 const unsafe={...data,__layout:JSON.stringify({version:1,sections:[{...block('x','Lien interdit'),href:'javascript:alert(1)'}]})};
 ok((await api({key,revision:page.revision,action:'publish',data:unsafe})).status===422,'Lien exécutable refusé côté serveur');
 const forged={...data,__layout:JSON.stringify({version:1,sections:[{id:'fake',type:'builtin',source:'section-99'}]})};
 ok((await api({key,revision:page.revision,action:'save',data:forged})).status===422,'Section d’origine falsifiée refusée');
 r=await api({key,revision:page.revision,action:'unpublish'});page=r.record;ok(missing(await html('/'+slug)),'Dépublication effective');
 r=await api({key,revision:page.revision,action:'publish'});page=r.record;
 r=await api({key,revision:page.revision,action:'delete'});page=r.record;ok(missing(await html('/'+slug)),'Suppression effective');
 ok(!(await html('/carriere')).text.includes('href="/'+slug+'"'),'Lien retiré du pied de page');
 r=await api({key,revision:page.revision,action:'restore'});page=r.record;ok(r.status===200&&!page.value.published&&!page.value.deleted,'Restauration en brouillon');
 const listing=await api();home=listing.data.find(p=>p.key==='accueil');
 r=await api({key:'accueil',revision:home.revision,action:'publish',data:{...home.value.draft,__layout:JSON.stringify({version:1,sections:[{id:'section-4',type:'builtin',source:'section-4'},{id:'section-3',type:'builtin',source:'section-3'}]})}});home=r.record;out=await html('/');ok(out.status===200&&!out.text.includes('data-hero-carousel')&&out.text.indexOf('class="proof-section"')<out.text.indexOf('class="section services-section"'),'Sections d’accueil déplacées et carrousel retiré');
 ok((await html('/a-propos')).status===200,'Page existante compatible');
 const sales='sales-'+slug+'@example.invalid',password=randomUUID();await api({section:'users',key:sales,revision:0,action:'save',data:{email:sales,name:'Test commercial',role:'commercial',active:'oui',password}});
 const sign=await fetch(base+'/api/admin/login',{method:'POST',redirect:'manual',headers:{Origin:base},body:new URLSearchParams({email:sales,motdepasse:password})});const salesCookie=sign.headers.get('set-cookie').split(';')[0];
 ok((await api({key:'custom-forbidden',revision:0,action:'save',data},salesCookie)).status===403,'Commercial ne peut pas créer de page');
 await fetch(base+'/api/admin/login',{method:'DELETE',headers:{Origin:base,Cookie:salesCookie}});
 console.log(checks+' vérifications de l’éditeur réussies.');
}finally{
 if(page)await api({key,revision:page.revision,action:'delete'});
 if(home)await api({key:'accueil',revision:home.revision,action:'publish',data:Object.fromEntries(Object.entries(home.value.draft).filter(([k])=>k!=='__layout'))});
 if(cookie)await fetch(base+'/api/admin/login',{method:'DELETE',headers:{Origin:base,Cookie:cookie}});
 // Les enregistrements sont confinés au jeu de données de test.
}
