import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const exports={};
const compiled=ts.transpileModule(fs.readFileSync('src/content/video-subtitles.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
vm.runInNewContext(compiled,{exports,URL});
const {englishSubtitlesForVideo,sia2026VideoUrl}=exports;

test('subtitles belong to the original film, including when the CMS uses a query string',()=>{
  const path='/subtitles/epureau-sia-2026.en.vtt';
  assert.equal(englishSubtitlesForVideo(sia2026VideoUrl),path);
  assert.equal(englishSubtitlesForVideo(sia2026VideoUrl+'?download=1#t=60'),path);
  for(const url of ['', '/another-film.mp4', sia2026VideoUrl.replace('.mp4','-replacement.mp4'), sia2026VideoUrl.replace('rfeqcidlnvpbabuuiozp.supabase.co','example.com')]) {
    assert.equal(englishSubtitlesForVideo(url),undefined);
  }
});

test('the English track has ordered, readable cues within the film duration',()=>{
  const content=fs.readFileSync('public'+englishSubtitlesForVideo(sia2026VideoUrl),'utf8');
  const [header,...blocks]=content.trim().split(/\r?\n\r?\n/);
  assert.equal(header,'WEBVTT');
  assert(blocks.length>25);
  const seconds=value=>value.split(':').reduce((total,part)=>total*60+Number(part),0);
  let previousEnd=0;
  for(const block of blocks){
    const [timing,...lines]=block.split(/\r?\n/);
    assert.match(timing,/^\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3} line:70%$/);
    const [start,end]=timing.replace(' line:70%','').split(' --> ').map(seconds);
    assert(start>=previousEnd,`Overlapping cue: ${timing}`);
    assert(end>start&&end<=176.768,`Invalid cue: ${timing}`);
    assert(end-start>=0.7&&end-start<=7,`Reading duration: ${timing}`);
    assert(lines.length>=1&&lines.length<=2);
    assert(lines.every(line=>line.length>0&&line.length<=44),`Line too long: ${lines.join(' ')}`);
    assert(lines.join(' ').length/(end-start)<=25,`Reading speed: ${lines.join(' ')}`);
    previousEnd=end;
  }
  assert(previousEnd>150,'The translation must cover the end of the report.');
});
