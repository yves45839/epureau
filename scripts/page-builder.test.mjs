import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import ts from 'typescript';
const require=createRequire(new URL('../src/content/page-builder.ts',import.meta.url));
const source=fs.readFileSync(new URL('../src/content/page-builder.ts',import.meta.url),'utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
const exports={};vm.runInNewContext(compiled,{exports,require,URL});
const {pageLayout,emptyBlock,validatePageLayout,validPageSlug,safeBuilderUrl}=exports;
test('préserve les sections initiales et migre les blocs existants sans perte',()=>{const layout=pageLayout('accueil',{__blocks:JSON.stringify([{title:'Ancien bloc',text:'Texte conservé',image:'/images/logo.png'}])});assert.equal(layout.sections.length,7);assert.equal(layout.sections[6].text,'Texte conservé');});
test('garde un ordre explicite et un retrait complet, sans recréer les sections retirées',()=>{const layout={version:1,sections:[{id:'section-4',type:'builtin',source:'section-4'},emptyBlock('carousel','carousel-1')]};assert.equal(validatePageLayout('accueil',JSON.stringify(layout)).sections[0].source,'section-4');assert.equal(pageLayout('accueil',{__layout:JSON.stringify({version:1,sections:[]})}).sections.length,0);});
test('refuse les sections inconnues, les doublons et les charges hors limites',()=>{const builtin={id:'x',type:'builtin',source:'section-99'};assert.throws(()=>validatePageLayout('accueil',JSON.stringify({version:1,sections:[builtin]})));const b=emptyBlock('text','a');assert.throws(()=>validatePageLayout('custom-test',JSON.stringify({version:1,sections:[b,b]})));assert.throws(()=>validatePageLayout('custom-test',JSON.stringify({version:1,sections:[{...b,text:'x'.repeat(10001)}]})));});
test('refuse les liens exécutables et les adresses réservées',()=>{for(const url of ['javascript:alert(1)','//evil.example','https://user:password@example.com','/\\evil.example','data:text/html,test'])assert.equal(safeBuilderUrl(url),false,url);for(const url of ['/contact','#contact','https://example.com/image.png'])assert.equal(safeBuilderUrl(url),true,url);for(const slug of ['admin','api','a-propos','contact','ingenierie','blog','../test','deux mots'])assert.equal(validPageSlug(slug),false,slug);assert.equal(validPageSlug('notre-engagement'),true);});
test('valide les sept composants et leurs éléments sans accepter de code libre',()=>{for(const type of ['text','image','cta','cards','gallery','carousel','faq']){const b=emptyBlock(type,type);assert.equal(validatePageLayout('custom-test',JSON.stringify({version:1,sections:[b]})).sections[0].type,type);assert.throws(()=>validatePageLayout('custom-test',JSON.stringify({version:1,sections:[{...b,html:'<script>'}]})));}});

test('place la carte après les métiers sans changer les identités ni restaurer les sections masquées',()=>{
 const original=[1,2,3,4,5,6].map(n=>({id:`section-${n}`,type:'builtin',source:`section-${n}`}));
 for(const data of [{},{__layout:JSON.stringify({version:1,sections:original})}]){
  assert.equal(pageLayout('accueil',data).sections.map(s=>s.source).join(','),'section-1,section-3,section-2,section-4,section-5,section-6');
 }
 const withoutMap=original.filter(s=>s.source!=='section-2');
 assert.equal(pageLayout('accueil',{__layout:JSON.stringify({version:1,sections:withoutMap})}).sections.length,5);
 assert.equal(pageLayout('a-propos',{__layout:JSON.stringify({version:1,sections:original})}).sections[1].source,'section-2');
});
