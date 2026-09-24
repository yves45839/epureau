import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
// Only run with ADMIN_LOCAL_DATASET=products-test, no live database or mail key.
const base='http://127.0.0.1:3119';
const login=await fetch(base+'/api/admin/login',{method:'POST',redirect:'manual',headers:{Origin:base},body:new URLSearchParams({email:'products-test@epureau-ci.com',motdepasse:'Products-local-test-2026!'})});
assert.equal(login.status,303);assert.equal(login.headers.get('location'),base+'/admin');
const cookie=login.headers.getSetCookie().map(v=>v.split(';')[0]).join('; ');
const key='product-qa-'+randomUUID().slice(0,8);
async function page(path,session=''){const r=await fetch(base+path,{headers:{Cookie:session}});return {status:r.status,html:await r.text()};}
async function admin(body){const r=await fetch(base+'/api/admin/content',{method:'POST',headers:{Origin:base,Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify({section:'products',key,...body})});return {status:r.status,...await r.json()};}
async function unlock(slug,email='catalogue-qa@example.com',session=''){return fetch(base+`/api/products/${slug}/document`,{method:'POST',headers:{Origin:base,Cookie:session,'Content-Type':'application/json'},body:JSON.stringify({email})});}
for(const language of ['fr','en']){
  const list=await page('/'+language+'/negoce');assert.equal(list.status,200);assert.match(list.html,/MAXX Magic2/);assert.match(list.html,/Topax Duo/);assert.match(list.html,language==='fr'?/Rechercher un produit/:/Search products/);assert.doesNotMatch(list.html,/3DT230-pdf|MAGIC2_Sellsheet/);
  const product=await page('/'+language+'/negoce/nalco-3dt230');assert.equal(product.status,200);assert.match(product.html,language==='fr'?/Obtenir la fiche technique/:/Get the technical data sheet/);assert.doesNotMatch(product.html,/3DT230-pdf/);
}
const contact=await page('/en/contact?produit=MAXX%20Magic2');assert.match(contact.html,/Quote request for.*MAXX Magic2/);assert.match(contact.html,/<option value="Produits ECOLAB" selected=""/);
assert.equal((await unlock('nalco-3dt230','invalid')).status,422);
const unlocked=await unlock('nalco-3dt230');assert.equal(unlocked.status,200);assert.match((await unlocked.json()).url,/3DT230-pdf/);
const requests=await fetch(base+'/api/admin/content?section=requests',{headers:{Cookie:cookie}}).then(r=>r.json());assert(requests.data.some(row=>row.value.email==='catalogue-qa@example.com'&&row.value.source==='fiche-produit'));
const data={nom:'QA produit privé',marque:'NALCO',categorie:'QA',fiche:'https://example.com/qa-private.pdf',documentType:'Fiche technique'};
let saved=await admin({action:'save',revision:0,data});assert.equal(saved.status,200);
assert.equal((await page('/fr/negoce/'+key)).status,404);assert.equal((await unlock(key)).status,404);
const preview=await fetch(base+'/api/admin/preview?path='+encodeURIComponent('/negoce/'+key),{headers:{Cookie:cookie},redirect:'manual'});assert.equal(preview.status,307);
const previewCookie=cookie+'; '+preview.headers.getSetCookie().map(v=>v.split(';')[0]).join('; ');
assert.match((await page('/fr/negoce/'+key,previewCookie)).html,/QA produit privé/);assert.equal((await unlock(key,'catalogue-qa@example.com',previewCookie)).status,404);
saved=await admin({action:'publish',revision:saved.record.revision,data});assert.equal(saved.status,200);assert.equal((await page('/fr/negoce/'+key)).status,200);
assert.equal((await admin({action:'save',revision:saved.record.revision,data:{...data,fiche:'javascript:alert(1)'}})).status,422);
assert.equal((await admin({action:'unpublish',revision:saved.record.revision})).status,200);assert.equal((await page('/fr/negoce/'+key)).status,404);assert.equal((await unlock(key)).status,404);
const map=await page('/sitemap.xml');assert.match(map.html,/negoce\/ecolab-maxx-magic2/);assert(!map.html.includes(key));
console.log('PASS: catalogue FR/EN, documents absents du HTML/RSC, devis prérempli, e-mail enregistré, aperçus privés, publication, dépublication et sitemap.');
