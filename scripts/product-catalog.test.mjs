import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
function load(file, overrides={}) {
  const compiled=ts.transpileModule(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  const exports={};vm.runInNewContext(compiled,{exports,require:name=>overrides[name]??require(name),URL,Response,Request,console});return exports;
}
const catalog=load('src/content/product-catalog.ts');
const samples=load('src/content/product-samples.ts').productSamples.map(p=>({...p.data,slug:p.slug}));
test('catalogue : combinaison des filtres et recherche insensible aux accents',()=>{
  assert.equal(catalog.filterProducts(samples,'chaudieres','NALCO','Chaudières').length,1);
  assert.equal(catalog.filterProducts(samples,'3dt230','ECOLAB','').length,0);
  assert.equal(catalog.filterProducts(samples,'maxx surfaces','ECOLAB','Hygiène des surfaces').length,1);
  assert.equal(catalog.filterProducts(samples,'inexistant','','').length,0);
});
test('aucun lien documentaire ni métadonnée privée dans les données client',()=>{
  const safe=catalog.publicProduct({...samples[0],__en:'private',sourceUrl:'secret'});
  assert.equal('fiche' in safe,false);assert.equal('__en' in safe,false);assert.equal('sourceUrl' in safe,false);
  assert.equal(safe.nom,samples[0].nom);
});
test('documents : PDF HTTPS ou import local, jamais javascript ni redirection locale arbitraire',()=>{
  for(const p of samples)assert.equal(catalog.validProductDocument(p.fiche),true);
  for(const bad of ['javascript:alert(1)','http://example.com/file.pdf','//example.com/file.pdf','https://user:pass@example.com/file.pdf','https://example.com/file.html','/admin'])assert.equal(catalog.validProductDocument(bad),false);
  assert.equal(catalog.validProductDocument('/api/media/12345678-1234-1234-1234-123456789abc.pdf'),true);
});
function endpoint({save=true, fail=false, product=samples[0]}={}) {
  const calls=[];
  const route=load('src/app/api/products/[slug]/document/route.ts',{
    '@/lib/auth':{sameOrigin:request=>request.headers.get('origin')==='https://example.com'},
    '@/lib/cms':{publishedDocuments:async(section,preview)=>{assert.equal(preview,false);return product?[{key:product.slug,data:product}]:[];}},
    '@/lib/admin-requests':{recordRequest:async data=>{calls.push(data);if(fail)throw new Error('offline');return save;}},
    '@/content/product-catalog':catalog,
  });
  const post=(data={email:'test@example.com'},origin='https://example.com')=>route.POST(new Request('https://example.com/api/products/x/document',{method:'POST',headers:{origin},body:JSON.stringify(data)}),{params:Promise.resolve({slug:samples[0].slug})});
  return {post,calls};
}
test('la fiche est révélée après validation et enregistrement de la demande',async()=>{
  const {post,calls}=endpoint();const response=await post();assert.equal(response.status,200);assert.equal((await response.json()).url,samples[0].fiche);
  assert.equal(calls[0].email,'test@example.com');assert.equal(calls[0].source,'fiche-produit');assert.match(calls[0].objet,/3DT230/);assert.match(response.headers.get('cache-control'),/no-store/);
});
test('une panne de stockage ne révèle jamais le lien',async()=>{
  for(const options of [{save:false},{fail:true}]){const response=await endpoint(options).post();assert.equal(response.status,503);assert.equal((await response.json()).url,undefined);}
});
test('origine, adresse invalide, robot et produit dépublié sont refusés',async()=>{
  const {post,calls}=endpoint();assert.equal((await post({},'https://attacker.example')).status,403);
  assert.equal((await post({email:'invalid'})).status,422);assert.equal((await post({email:'test@example.com',site:'spam'})).status,422);assert.equal(calls.length,0);
  assert.equal((await endpoint({product:null}).post()).status,404);
});
test('sans document, la demande est conservée pour un suivi humain',async()=>{
  const {post,calls}=endpoint({product:{...samples[0],fiche:''}});const response=await post();assert.equal(response.status,200);assert.equal((await response.json()).url,'');assert.match(calls[0].besoin,/à transmettre/);
});
