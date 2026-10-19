import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
function load(path,deps={},extra={}){const exports={};vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../'+path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require:n=>{if(!(n in deps))throw Error(n);return deps[n];},...extra});return exports;}
const seo=load('src/content/seo.ts');
test('les alias français et paramètres partagent une URL canonique stable',()=>{
 for(const p of ['/contact','/fr/contact','/en/contact/','/contact?source=pub#form'])assert.equal(seo.localizedUrl(p,'fr'),'https://epureau-ci.com/fr/contact');
 assert.equal(seo.localizedUrl('/','en'),'https://epureau-ci.com/en');
});
test('chaque page métier possède des variantes réciproques et un titre localisé',()=>{
 for(const path of Object.keys(seo.seoPages)){
  const fr=seo.seoMetadata(path,'fr'),en=seo.seoMetadata(path,'en');
  assert.equal(fr.alternates.languages.en,en.alternates.canonical);
  assert.equal(en.alternates.languages.fr,fr.alternates.canonical);
  assert.equal(fr.openGraph.url,fr.alternates.canonical);
  assert.notEqual(fr.description,en.description);
  assert.ok(fr.title.absolute.includes('EPUREAU'));
 }
});
test('les fiches dynamiques conservent leur titre et leur description',()=>{
 const m=seo.seoMetadata('/negoce/produit-test','fr',{title:'Produit test',description:'Description spécifique'});
 assert.equal(m.title.absolute,'Produit test | EPUREAU');assert.equal(m.description,'Description spécifique');assert.equal(m.twitter.description,m.description);
});
test('le JSON-LD neutralise les fermetures de script venant du CMS',()=>{
 const payload={name:'</script><script>alert(1)</script>'};const encoded=seo.jsonLd(payload);
 assert.ok(!encoded.includes('<'));assert.deepEqual(JSON.parse(encoded),payload);
});
test('le sitemap inclut les langues et seulement le blog actif sans fausses dates',async()=>{
 for(const enabled of [false,true]){
  const calls=[];
  const {default:sitemap}=load('src/app/sitemap.ts',{
   '@/lib/cms':{publishedDocuments:async(section,preview)=>{calls.push(preview);return {pages:[{key:'custom-test'}],products:[{key:'produit'}],projects:[{key:'projet'}],settings:[{data:{blogEnabled:enabled?'oui':'non'}}],blog:[{key:'article'}]}[section]||[];}},
   '@/content/page-builder':{customPagePath:key=>key==='custom-test'?'/test':null},
   '@/content/projects':{projectPath:key=>'/ingenierie/nos-realisations/'+key},
   '@/content/seo':seo
  });
  const rows=await sitemap();assert.ok(calls.every(v=>v===false));
  assert.equal(rows.some(r=>r.url.includes('/blog/article')),enabled);
  for(const path of ['/test','/negoce/produit','/ingenierie/nos-realisations/projet'])for(const lang of ['fr','en'])assert.ok(rows.some(r=>r.url===seo.localizedUrl(path,lang)));
  assert.ok(rows.every(r=>!r.lastModified));assert.equal(new Set(rows.map(r=>r.url)).size,rows.length);
 }
});

test('les métadonnées serveur gardent le chemin et bloquent les aperçus',async()=>{
 for(const preview of [false,true]){
  const lib=load('src/lib/site-language.ts',{
   '@/content/seo':seo,'server-only':{},react:{cache:fn=>fn},
   '@/content/ui-english':{uiText:t=>t},
   'next/headers':{headers:async()=>new Map([['x-epureau-path','/negoce/test'],['x-epureau-language','en']]),draftMode:async()=>({isEnabled:preview})}
  },{process:{env:{}}});
  const data=await lib.localizedMetadata({title:'Test product',description:'Product information'});
  assert.equal(data.alternates.canonical,'https://epureau-ci.com/en/negoce/test');
  assert.equal(data.robots?.index,preview?false:undefined);
 }
});
