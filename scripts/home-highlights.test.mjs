import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
function load(file,overrides={}) {
  const compiled=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
  const exports={};vm.runInNewContext(compiled,{exports,require:name=>overrides[name]??require(name),URL});return exports;
}
const builder=load('src/content/page-builder.ts',{'./page-sections.json':require('../src/content/page-sections.json')});
const {validAnnouncement,activeAnnouncements,videoSource,homeVideo}=load('src/content/home-highlights.ts',{'./page-builder':builder});
const data={title:'Recrutement',description:'Une offre de test.',category:'Recrutement',url:'/carriere'};
test('annonces: contenu, liens et dates sont validés',()=>{
  assert(validAnnouncement(data));
  for(const changes of [{title:''},{description:''},{category:'autre'},{url:'javascript:alert(1)'},{url:'//evil.test'},{startsOn:'2026-02-30'},{startsOn:'2026-10-15',endsOn:'2026-10-14'},{description:'x'.repeat(2001)}])assert(!validAnnouncement({...data,...changes}),JSON.stringify(changes));
});
test('annonces: début inclus et expiration en fin de journée à Abidjan',()=>{
  const item={key:'test',data:{...data,startsOn:'2026-10-14',endsOn:'2026-10-14'}};
  assert.equal(activeAnnouncements([item],new Date('2026-10-13T23:59:59Z')).length,0);
  assert.equal(activeAnnouncements([item],new Date('2026-10-14T00:00:00Z')).length,1);
  assert.equal(activeAnnouncements([item],new Date('2026-10-14T23:59:59Z')).length,1);
  assert.equal(activeAnnouncements([item],new Date('2026-10-15T00:00:00Z')).length,0);
});
test('vidéo: YouTube en un clic, sans iframe avant le clic',()=>{
  for(const url of ['https://youtube.com/watch?v=M7lc1UVf-VE','https://youtu.be/M7lc1UVf-VE','https://www.youtube.com/shorts/M7lc1UVf-VE','https://www.youtube-nocookie.com/embed/M7lc1UVf-VE']) {
    const source=videoSource(url);assert.equal(source.kind,'youtube');assert.match(source.src,/autoplay=1&playsinline=1/);
  }
  for(const url of ['javascript:alert(1)','//evil.test/video.mp4','https://youtube.com/watch?v=invalid','https://user:pass@example.com/v.mp4','https://example.com/page'])assert.equal(videoSource(url),null);
  assert.equal(videoSource('/films/presentation.mp4').kind,'file');
  assert.equal(videoSource('https://example.com/presentation.webm?token=abc').kind,'file');
});
test('vidéo: seules les vidéos explicitement choisies sont affichées',()=>{
  const base={id:'one',type:'video',url:'/film.mp4'};
  assert.equal(homeVideo([base]),undefined);
  assert.equal(homeVideo([{...base,homeFeatured:'oui',type:'photo'}]),undefined);
  assert.equal(homeVideo([{...base,homeFeatured:'oui',url:''}]),undefined);
  assert.equal(homeVideo([{...base,homeFeatured:'oui'}]).id,'one');
});
test('droits annonces identiques côté interface et serveur',()=>{
  const client=load('src/content/admin-access.ts');
  const server=load('src/lib/admin-security.ts');
  for(const role of ['admin','editeur','commercial']) {
    assert.equal(client.may(role,'announcements'),role!=='commercial');
    assert.equal(server.may(role,'announcements'),client.may(role,'announcements'));
  }
});
