import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
function load(file,overrides={}) {
 const compiled=ts.transpileModule(fs.readFileSync(new URL('../'+file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 const exports={};vm.runInNewContext(compiled,{exports,require:name=>overrides[name]??require(name),DOMException,AbortController});return exports;
}
const builder=load('src/content/page-builder.ts',{'./page-sections.json':require('../src/content/page-sections.json')});
const {translationUnits,readEnglish,validateEnglish,pruneEnglish,englishContent}=load('src/content/translations.ts',{'./page-builder':builder});
const fields=[{key:'title',label:'Titre'},{key:'image',label:'Image',type:'image'},{key:'email',label:'E-mail'},{key:'url',label:'Lien',type:'url'}];
const withEnglish=(data,entries)=>({...data,__en:JSON.stringify(entries)});
test('seuls les textes sont traduits, jamais les images, liens, coordonnées ou marques',()=>{
 const data={title:'Bonjour',image:'/photo.png',email:'contact@example.com',url:'https://example.com',marque:'ECOLAB',nom:'EPUREAU'};
 const units=translationUnits(data,[...fields,{key:'marque',label:'Marque'},{key:'nom',label:'Société'}],'settings');
 assert.equal(units.length,1);assert.equal(units[0].key,'field:title');
 assert.equal(translationUnits({...data,title:'https://example.com'},fields,'pages').length,0);
});
test('une traduction périmée ne remplace jamais le nouveau français et sa correction est conservée',()=>{
 const data=withEnglish({title:'Bonjour'}, {'field:title':{source:'Bonjour',text:'Hello',manual:true}});
 assert.equal(englishContent(data).title,'Hello');
 const changed={...data,title:'Bonsoir'};
 assert.equal(englishContent(changed).title,'Bonsoir');
 assert.equal(readEnglish(changed)['field:title'].text,'Hello');
 assert.equal(readEnglish(changed)['field:title'].manual,true);
});
test('les blocs gardent leur structure, images et liens ; les traductions suivent les identifiants',()=>{
 const block={...builder.emptyBlock('cards','one'),title:'Services',text:'Notre offre',href:'/contact',image:'/image.png',items:[{id:'item1',title:'Eau',text:'Traitement',alt:'Usine',image:'/plant.png',href:'/ingenierie'}]};
 const data=withEnglish({__layout:JSON.stringify({version:1,sections:[block]})},{'block:one:title':{source:'Services',text:'Our services',manual:false},'item:one:item1:title':{source:'Eau',text:'Water',manual:false}});
 validateEnglish(data,[],'pages');
 const result=JSON.parse(englishContent(data).__layout).sections[0];
 assert.equal(result.title,'Our services');assert.equal(result.items[0].title,'Water');
 assert.equal(result.href,'/contact');assert.equal(result.image,'/image.png');assert.equal(result.items[0].id,'item1');assert.equal(result.items[0].href,'/ingenierie');
 const reordered={...data,__layout:JSON.stringify({version:1,sections:[builder.emptyBlock('text','new'),block]})};
 assert.equal(JSON.parse(englishContent(reordered).__layout).sections[1].title,'Our services');
});
test('la validation serveur refuse des clés injectées, des liens traduits et des valeurs hors limite',()=>{
 for(const entries of [ {'field:image':{source:'/image.png',text:'https://evil.example',manual:false}}, {'field:title':{source:'Bonjour',text:42,manual:false}}, {'unknown':{source:'Bonjour',text:'Hello',manual:false}} ])assert.throws(()=>validateEnglish(withEnglish({title:'Bonjour',image:'/image.png'},entries),fields,'pages'));
 const block={...builder.emptyBlock('text','one'),title:'Bonjour'};
 assert.throws(()=>validateEnglish(withEnglish({__layout:JSON.stringify({version:1,sections:[block]})},{'block:one:title':{source:'Bonjour',text:'x'.repeat(201),manual:false}}),[],'pages'));
});
test('les traductions des champs et blocs supprimés sont retirées lors de la sauvegarde',()=>{
 const data=withEnglish({title:'Bonjour'},{'field:title':{source:'Bonjour',text:'Hello',manual:false},'block:removed:title':{source:'Ancien',text:'Old',manual:true}});
 const pruned=pruneEnglish(data,fields,'pages');assert.equal(Object.keys(readEnglish(pruned)).length,1);validateEnglish(pruned,fields,'pages');
});
test('les anciens contenus sans anglais restent lisibles et les blocs historiques sont traduits',()=>{
 assert.equal(englishContent({title:'Bonjour'}).title,'Bonjour');
 const data=withEnglish({__blocks:JSON.stringify([{title:'Titre',text:'Texte',image:'/x.png'}])},{'legacy:0:title':{source:'Titre',text:'Title',manual:false}});
 assert.equal(JSON.parse(englishContent(data).__blocks)[0].title,'Title');assert.equal(JSON.parse(englishContent(data).__blocks)[0].image,'/x.png');
});
const {translateText}=load('src/components/chrome-translator.ts');
test('le moteur local découpe les longs textes, préserve les paragraphes et accepte une annulation',async()=>{
 const inputs=[];const translator={translate:async text=>{inputs.push(text);return text;},destroy(){}};
 const text=('Phrase française. '.repeat(150)).trim()+'\n\nFin.';
 const translated=await translateText(translator,text,new AbortController().signal);
 assert.equal(translated,text);assert(inputs.length>2);assert(inputs.every(t=>t.length<=801));
 const abort=new AbortController();abort.abort();await assert.rejects(translateText(translator,'Bonjour',abort.signal),{name:'AbortError'});
 await assert.rejects(translateText({translate:async()=>'',destroy(){}},'Bonjour',new AbortController().signal),/vide/);
});
