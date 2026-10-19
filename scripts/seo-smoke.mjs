import assert from 'node:assert/strict';
const base=process.env.SEO_TEST_ORIGIN||'https://epureau-ci.com';
async function get(path){const response=await fetch(base+path,{headers:{'User-Agent':'Googlebot'},signal:AbortSignal.timeout(60000)});return {status:response.status,html:await response.text()};}
const sitemap=await get('/sitemap.xml');assert.equal(sitemap.status,200);
assert.ok(sitemap.html.includes('hreflang="en"'));assert.ok(!sitemap.html.includes('<lastmod>'));
assert.ok(!sitemap.html.includes('/admin'));console.log('Sitemap bilingue : OK');
for(const path of ['/fr','/en','/fr/ingenierie/notre-expertise','/en/hygiene-institutionnelle','/fr/negoce','/fr/contact']){
 const {status,html}=await get(path);assert.equal(status,200,path);
 const canonicals=[...html.matchAll(/<link\b[^>]*rel="canonical"[^>]*>/g)];assert.equal(canonicals.length,1,path);
 assert.ok(canonicals[0][0].includes('https://epureau-ci.com'+path),path);
 assert.ok(html.includes('hrefLang="fr"')||html.includes('hreflang="fr"'));
 assert.ok(!/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/.test(html));
 const schemas=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
 assert.ok(schemas.some(s=>s['@graph']?.some(n=>n['@type']==='LocalBusiness')),path);
 if(path.includes('notre-expertise'))assert.ok(html.includes('Comment dimensionner une station'));
 console.log(path+' : canonical, langues, données structurées OK');
}
const product=sitemap.html.match(/<loc>https:\/\/epureau-ci.com(\/fr\/negoce\/[^<]+)<\/loc>/)?.[1];
if(product){const {status,html}=await get(product);assert.equal(status,200);assert.ok(html.includes('href="https://epureau-ci.com'+product+'"'));console.log('Fiche produit : OK');}
assert.equal((await get('/fr/page-inexistante-verification-seo')).status,404);
const admin=await get('/admin/login');assert.ok(/<meta[^>]*name="robots"[^>]*content="[^"]*noindex/.test(admin.html));
console.log('Page absente : 404 ; administration non indexable.');
