import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createRequire} from 'node:module';
import {webcrypto} from 'node:crypto';
const require=createRequire(import.meta.url);
function load(file,overrides={},globals={}) {
  const compiled=ts.transpileModule(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  const exports={};vm.runInNewContext(compiled,{exports,require:name=>overrides[name]??require(name),Request,Response,console,crypto:webcrypto,...globals});return exports;
}
const {productHidden}=load('src/content/product-visibility.ts');
const doc=brand=>({title:brand,draft:{marque:brand,nom:'Brouillon'},published:{marque:brand,nom:'Version publique'},order:1});
test('seuls Nalco et Ecolab sont visibles par défaut, y compris sur les fiches existantes',()=>{
  for(const brand of ['NALCO','ECOLAB',' nalco '])assert.equal(productHidden(doc(brand)),false);
  for(const brand of ['LOVIBOND','Autres marques','Commodités & Réactifs',''])assert.equal(productHidden(doc(brand)),true);
  assert.equal(productHidden({...doc('NALCO'),hidden:true}),true);
  assert.equal(productHidden({...doc('LOVIBOND'),hidden:false}),false);
});
function endpoint({role='editeur',rows,fail=false}={}) {
  class Conflict extends Error {}
  const changes=[],invalidations=[];
  rows??=[{key:'nalco',revision:2,value:doc('NALCO')},{key:'draft',revision:0,value:{...doc('LOVIBOND'),published:null}}];
  const route=load('src/app/api/admin/products/visibility/route.ts',{
    'next/cache':{revalidateTag:(...args)=>invalidations.push(args)},
    '@/lib/auth':{sameOrigin:r=>r.headers.get('origin')==='https://epureau-ci.com',currentUser:async()=>role?{role,email:'editor@example.com'}:null},
    '@/content/admin-access':load('src/content/admin-access.ts'),
    '@/lib/cms':{editableDocuments:async()=>rows},
    '@/lib/admin-store':{Conflict,save:async()=>{},saveMany:async(kind,items)=>{if(fail)throw new Error('offline');assert.equal(kind,'products');changes.push(...items);return items;}},
  });
  return {changes,invalidations,post:(body={hidden:true,items:[{key:'nalco',revision:2}]},origin='https://epureau-ci.com')=>route.POST(new Request('https://epureau-ci.com/api/admin/products/visibility',{method:'POST',headers:{origin},body:JSON.stringify(body)}))};
}
test('masquage et réaffichage préservent les versions et ne publient jamais un brouillon',async()=>{
  const e=endpoint();assert.equal((await e.post()).status,200);
  assert.equal(e.changes[0].value.hidden,true);assert.equal(e.changes[0].value.draft.nom,'Brouillon');assert.equal(e.changes[0].value.published.nom,'Version publique');
  assert.equal((await e.post({hidden:false,items:[{key:'draft',revision:0}]})).status,200);
  assert.equal(e.changes[1].value.published,null);assert.equal(e.changes[1].value.hidden,false);assert.equal(e.invalidations.length,2);
});
test('sélection obsolète, supprimée ou répétée : aucun produit modifié',async()=>{
  for(const items of [[{key:'nalco',revision:2},{key:'draft',revision:4}],[{key:'missing',revision:0}],[{key:'nalco',revision:2},{key:'nalco',revision:2}]]){
    const e=endpoint();assert.ok([409,422].includes((await e.post({hidden:true,items})).status));assert.equal(e.changes.length,0);
  }
  const e=endpoint({rows:[{key:'nalco',revision:2,value:{...doc('NALCO'),deleted:true}}]});assert.equal((await e.post()).status,409);assert.equal(e.changes.length,0);
});
test('la visibilité exige une session autorisée, une origine valide et un stockage disponible',async()=>{
  assert.equal((await endpoint({role:null}).post()).status,401);
  assert.equal((await endpoint({role:'commercial'}).post()).status,403);
  assert.equal((await endpoint().post(undefined,'https://attacker.example')).status,403);
  assert.equal((await endpoint({fail:true}).post()).status,503);
  assert.equal((await endpoint().post({hidden:'true',items:[]})).status,422);
});
test('les anciens libellés du CMS sont actualisés sans remplacer les textes personnalisés',()=>{
  const {updatedIndustryDocument}=load('src/content/industry-labels.ts');
  const original={title:'Services aux industries',draft:{f038:'Services',f039:'aux industries',f121:'Les services aux industries',custom:'Mon texte'},published:null,order:0};
  const next=updatedIndustryDocument('accueil',original);
  assert.equal(next.title,'Industries et travaux publics');assert.equal(next.draft.f038,'Industries');assert.equal(next.draft.f039,'et travaux publics');assert.equal(next.draft.custom,'Mon texte');assert.equal(original.draft.f038,'Services');
});
test('une sélection est enregistrée intégralement ou reste inchangée si une révision est obsolète',async()=>{
  const directory=fs.mkdtempSync(new URL('../.local/visibility-store-',import.meta.url));
  const store=load('src/lib/admin-store.ts',{'server-only':{},'./db':{db:()=>{throw new Error('No database permitted in this test');}}},{process:{env:{ADMIN_LOCAL_STORE:'1'},cwd:()=>directory}});
  await store.save('products','a',doc('NALCO'),0);await store.save('products','b',doc('ECOLAB'),0);
  const changes=[{key:'a',revision:1,value:{...doc('NALCO'),hidden:true}},{key:'b',revision:9,value:{...doc('ECOLAB'),hidden:true}}];
  await assert.rejects(store.saveMany('products',changes),store.Conflict);
  assert.equal((await store.entry('products','a')).revision,1);assert.equal((await store.entry('products','a')).value.hidden,undefined);
  changes[1].revision=1;await store.saveMany('products',changes);
  assert((await store.entries('products')).every(row=>row.value.hidden&&row.revision===2));
});
