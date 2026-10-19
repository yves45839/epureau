import assert from 'node:assert/strict';
// Run only against the isolated local products-test dataset, never a public deployment.
const base='http://localhost:3119';
const login=await fetch(base+'/api/admin/login',{method:'POST',redirect:'manual',headers:{Origin:base},body:new URLSearchParams({email:'products-test@epureau-ci.com',motdepasse:'Products-local-test-2026!'})});
const cookie=login.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ');
assert.equal(login.headers.get('location'),base+'/admin');
const list=async()=>fetch(base+'/api/admin/content?section=products',{headers:{Cookie:cookie}}).then(r=>r.json()).then(r=>r.data);
const page=async(path,cookie='')=>{const response=await fetch(base+path,{headers:{Cookie:cookie}});return {status:response.status,html:await response.text()};};
const visibility=async(hidden,rows)=>fetch(base+'/api/admin/products/visibility',{method:'POST',headers:{Origin:base,Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify({hidden,items:rows.map(({key,revision})=>({key,revision}))})});
const initial=await list();
const others=initial.filter(r=>r.value.published&&!['NALCO','ECOLAB'].includes(r.value.published.marque));
assert(others.length>0);assert(others.every(r=>r.value.hidden));
const targets=initial.filter(r=>r.value.published&&['NALCO','ECOLAB'].includes(r.value.published.marque)&&!r.value.hidden).slice(0,2);
assert.equal(targets.length,2);
for(const language of ['fr','en']){
  const homepage=await page('/'+language);assert.equal(homepage.status,200);
  assert(homepage.html.includes(`/${language}/ingenierie/nos-realisations/pisam`));
  assert.match(homepage.html,language==='fr'?/et travaux publics/:/and public works/);
  for(const slug of ['pisam','eurolait','chr-adzope','mipa','garden-center']){
    const project=await page(`/${language}/ingenierie/nos-realisations/${slug}`);assert.equal(project.status,200);assert.match(project.html,language==='fr'?/Nos autres réalisations/:/Our other projects/);
  }
  assert.equal((await page(`/${language}/ingenierie/nos-realisations/absent`)).status,404);
  assert.equal((await page(`/${language}/negoce/${others[0].key}`)).status,404);
}
for(const language of ['fr','en']){
  const preview=await fetch(base+'/api/admin/preview?lang='+language+'&path='+encodeURIComponent('/ingenierie/nos-realisations/pisam'),{headers:{Cookie:cookie},redirect:'manual'});
  assert.equal(preview.status,307);
  assert.equal(preview.headers.get('location'),base+'/'+language+'/ingenierie/nos-realisations/pisam');
  const previewCookie=cookie+'; '+preview.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ');
  assert.equal((await page('/'+language+'/ingenierie/nos-realisations/pisam',previewCookie)).status,200);
}
const changed=await visibility(true,targets);assert.equal(changed.status,200);const hidden=(await changed.json()).records;
const preview=await fetch(base+'/api/admin/preview?path='+encodeURIComponent('/negoce/'+hidden[0].key),{headers:{Cookie:cookie},redirect:'manual'});assert.equal(preview.status,307);
const previewCookie=cookie+'; '+preview.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ');
assert.equal((await page('/fr/negoce/'+hidden[0].key,previewCookie)).status,200);
for(const row of hidden){
  for(const lang of ['fr','en'])assert.equal((await page(`/${lang}/negoce/${row.key}`)).status,404);
  const doc=await fetch(base+`/api/products/${row.key}/document`,{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({email:'test@example.com'})});assert.equal(doc.status,404);
  assert(!(await page('/sitemap.xml')).html.includes('/negoce/'+row.key));
}
assert.equal((await visibility(false,targets)).status,409);
assert((await list()).filter(r=>targets.some(t=>t.key===r.key)).every(r=>r.value.hidden));
assert.equal((await visibility(false,hidden)).status,200);
for(const row of targets)assert.equal((await page('/fr/negoce/'+row.key)).status,200);
assert.equal((await visibility(false,[others[0]])).status,200);
assert.equal((await page('/fr/negoce/'+others[0].key)).status,200);
const refreshed=(await list()).find(r=>r.key===others[0].key);assert.equal((await visibility(true,[refreshed])).status,200);
const sitemap=await page('/sitemap.xml');assert.match(sitemap.html,/nos-realisations\/pisam/);assert(!sitemap.html.includes('/negoce/'+others[0].key));
console.log(`PASS: 10 pages projets FR/EN, liens PISAM, ${others.length} produits des autres marques masqués, masquage par lot, accès direct et documentaire bloqués, conflit sans modification, réaffichage et sitemap.`);
