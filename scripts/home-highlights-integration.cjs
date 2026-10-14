/* eslint-disable @typescript-eslint/no-require-imports */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const net=require('node:net');
const {spawn}=require('node:child_process');
const {chromium}=require('playwright');
const base='http://127.0.0.1:3119';
const output=path.resolve('.local/home-checks');
let server,browser,checks=0,cookie='';
const ok=(condition,message)=>{assert(condition,message);checks++;console.log('PASS '+message);};
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function api(section,body) {
  const response=await fetch(base+'/api/admin/content'+(body?'':'?section='+section),{method:body?'POST':'GET',headers:{Origin:base,Cookie:cookie,'Content-Type':'application/json'},body:body?JSON.stringify({section,...body}):undefined,signal:AbortSignal.timeout(120000)});
  return {status:response.status,...await response.json()};
}
async function save(section,key,data,action='publish',revision=0) {
  const result=await api(section,{key,data,action,revision});
  assert.equal(result.status,200,JSON.stringify(result));return result.record;
}
async function html(language='fr') {return (await fetch(base+'/'+language,{signal:AbortSignal.timeout(120000)})).text();}
async function main() {
  fs.mkdirSync(output,{recursive:true});
  await new Promise((resolve,reject)=>{const socket=net.createServer();socket.once('error',reject);socket.listen(3119,'127.0.0.1',()=>socket.close(resolve));});
  const log=fs.openSync(path.join(output,'server.log'),'w');
  server=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port','3119'],{
    windowsHide:true,stdio:['ignore',log,log],env:{...process.env,ADMIN_LOCAL_STORE:'1',ADMIN_LOCAL_DATASET:'home-test',
      ADMIN_EMAIL:'home-test@epureau-ci.com',ADMIN_PASSWORD:'Home-local-test-2026!',DATABASE_URL:'',RESEND_API_KEY:'',
      VERCEL:'',NETLIFY:'',EPUREAU_BUILD_DIR:'.local/next-home-test',NEXT_TELEMETRY_DISABLED:'1',NODE_OPTIONS:'--max-old-space-size=2048'}});
  for(let i=0;i<120;i++) {
    if(server.exitCode!==null)throw new Error('Test server exited: '+fs.readFileSync(path.join(output,'server.log'),'utf8').slice(-1500));
    try{const r=await fetch(base+'/api/admin/login',{method:'GET',signal:AbortSignal.timeout(2000)});if(r.status<500)break;}catch{}
    if(i===119)throw new Error('Server not ready');await wait(1000);
  }
  const login=await fetch(base+'/api/admin/login',{method:'POST',redirect:'manual',headers:{Origin:base},body:new URLSearchParams({email:'home-test@epureau-ci.com',motdepasse:'Home-local-test-2026!'})});
  assert.equal(login.status,303);cookie=login.headers.getSetCookie().map(v=>v.split(';')[0]).join('; ');
  for(const section of ['announcements','media'])for(const row of (await api(section)).data) {
    if(/^home-(qa|video)-/.test(row.key)&&!row.value.deleted)await save(section,row.key,row.value.draft,'delete',row.revision);
  }
  const suffix=Date.now().toString(36),announcementKey='home-qa-'+suffix,videoKey='home-video-'+suffix;
  const announcement={title:'Offre de test locale '+suffix,description:'Rejoignez nos équipes techniques. Cette annonce est réservée au test local.',category:'Recrutement',url:'/carriere',linkLabel:'Voir l’offre',__en:JSON.stringify({
    'field:title':{source:'Offre de test locale '+suffix,text:'Local test vacancy '+suffix,manual:true},
    'field:description':{source:'Rejoignez nos équipes techniques. Cette annonce est réservée au test local.',text:'Join our technical teams. This announcement is for local testing only.',manual:true},
    'field:linkLabel':{source:'Voir l’offre',text:'View vacancy',manual:true}})};
  let record=await save('announcements',announcementKey,announcement,'save');
  ok(!(await html()).includes(announcement.title),'Announcement draft is not public');
  record=await save('announcements',announcementKey,announcement,'publish',record.revision);
  ok((await html()).includes(announcement.title),'Published announcement appears on home');
  ok((await html('en')).includes('Local test vacancy '+suffix),'Published English announcement appears');
  const invalid=await api('announcements',{key:announcementKey,action:'publish',revision:record.revision,data:{...announcement,startsOn:'2026-02-30'}});
  ok(invalid.status===422,'Invalid scheduling is rejected by the API');
  record=await save('announcements',announcementKey,{...announcement,endsOn:'2000-01-01'},'publish',record.revision);
  ok(!(await html()).includes(announcement.title),'Expired announcement is hidden');
  record=await save('announcements',announcementKey,{...announcement,startsOn:'2099-01-01'},'publish',record.revision);
  ok(!(await html()).includes(announcement.title),'Future announcement is hidden');
  record=await save('announcements',announcementKey,announcement,'publish',record.revision);
  let video=await save('media',videoKey,{title:'Film de test local',type:'video',url:'https://youtu.be/M7lc1UVf-VE',image:'/images/gal-1.jpg',description:'',homeFeatured:'oui'});
  browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  const errors=[];
  for(const config of (process.env.HOME_PLAYBACK_ONLY?[]:[{width:1440,height:1000,lang:'fr'},{width:390,height:844,lang:'fr'},{width:360,height:740,lang:'en'},{width:390,height:844,lang:'en',reduce:true}])) {
    const context=await browser.newContext({viewport:{width:config.width,height:config.height},reducedMotion:config.reduce?'reduce':'no-preference'});
    const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
    let youtubeRequests=0;
    await page.route('https://www.youtube-nocookie.com/**',route=>{youtubeRequests++;return route.fulfill({contentType:'text/html',body:'<html><body>Local player fixture</body></html>'});});
    await page.goto(base+'/'+config.lang,{waitUntil:'load',timeout:120000});
    // Locate by the film title because the translated verb may differ between dictionaries.
    const play=page.locator('button[aria-label$=" : Film de test local"]');
    await play.scrollIntoViewIfNeeded();
    ok(youtubeRequests===0,'No YouTube request before click '+config.width+' '+config.lang);
    await page.screenshot({path:path.join(output,`highlights-${config.width}-${config.lang}.png`)});
    await play.click();
    await page.locator('iframe[title="Film de test local"]').waitFor();
    const iframe=page.locator('iframe[title="Film de test local"]');
    ok((await iframe.getAttribute('src')).includes('autoplay=1')&&(await iframe.getAttribute('allow')).includes('autoplay'),'One-click YouTube playback configured '+config.width+' '+config.lang);
    const pins=page.locator('#secteurs button[aria-label][aria-controls="sector-map-detail"]');
    await pins.nth(1).scrollIntoViewIfNeeded();
    const before=await page.evaluate(()=>scrollY);
    await pins.nth(1).click();
    await page.waitForFunction(()=>document.querySelector('#sector-map-detail h3')?.textContent?.match(/Industr/));
    if(config.width<=700) {
      await page.waitForFunction(()=>{const detail=document.querySelector('#sector-map-detail'),box=detail.getBoundingClientRect(),header=document.querySelector('.site-header').getBoundingClientRect();return document.activeElement===detail && box.top>=header.bottom && box.top<header.bottom+40;});
      ok(true,'Mobile click reveals and focuses the selected text '+config.width+' '+config.lang);
      await page.screenshot({path:path.join(output,`sector-${config.width}-${config.lang}${config.reduce?'-reduced':''}.png`)});
      await page.getByRole('button',{name:config.lang==='fr'?'Retour aux secteurs':'Back to sectors',exact:false}).click();
      await page.waitForFunction(()=>document.activeElement?.getAttribute('aria-controls')==='sector-map-detail');
      ok(true,'Return to sectors restores the trigger focus');
      const nextTitle=(await pins.nth(4).getAttribute('aria-label')).replace(/^\d+\. /,'');
      await pins.nth(4).click();
      await page.waitForFunction(title=>document.querySelector('#sector-map-detail h3')?.textContent===title,nextTitle);
      const choice=page.locator('#secteurs button[aria-controls="sector-map-detail"]:not([aria-label])').nth(3);
      await choice.click();
      await page.waitForFunction(()=>document.activeElement?.id==='sector-map-detail');
      ok(true,'The sector list also reveals the detail');
    } else {
      ok(Math.abs((await page.evaluate(()=>scrollY))-before)<3,'Desktop selection does not jump the page');
    }
    ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow '+config.width+' '+config.lang);
    await context.close();
  }
  // MDN's public HTML-video example is cached only in the ignored local test output.
  const context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();
  await page.goto(base+'/fr',{waitUntil:'load',timeout:120000});
  const fixture=path.join(output,'mdn-sample.webm');
  if(!fs.existsSync(fixture)) {
    const response=await fetch('https://developer.mozilla.org/shared-assets/videos/flower.webm',{signal:AbortSignal.timeout(30000)});
    assert(response.ok,'Download of the public MDN test video');
    fs.writeFileSync(fixture,Buffer.from(await response.arrayBuffer()));
  }
  const bytes=fs.readFileSync(fixture);
  assert(bytes.length>300,'The local video fixture must contain recorded frames');
  video=await save('media',videoKey,{...video.value.draft,url:'/home-test-fixture.webm'},'publish',video.revision);
  let videoRequests=0;
  await page.route('**/home-test-fixture.webm',route=>{videoRequests++;return route.fulfill({contentType:'video/webm',body:Buffer.from(bytes)});});
  await page.reload({waitUntil:'load'});
  await page.locator('button[aria-label$=" : Film de test local"]').click();
  await page.waitForFunction(()=>{const video=document.querySelector('video');return video&&video.currentTime>0;}).catch(async error=>{
    console.error({videoRequests,...await page.locator('video').evaluate(video=>({src:video.currentSrc,time:video.currentTime,paused:video.paused,ended:video.ended,readyState:video.readyState,error:video.error?.message,code:video.error?.code}))});
    throw error;
  });
  ok(true,'Native video really plays after one click on mobile');
  ok(await page.locator('video').getAttribute('playsinline')!==null,'Native mobile video stays inline');
  await context.close();
  record=await save('announcements',announcementKey,announcement,'unpublish',record.revision);
  ok(!(await html()).includes(announcement.title),'Unpublishing removes the announcement');
  await save('media',videoKey,video.value.draft,'unpublish',video.revision);
  ok(errors.length===0,'No browser runtime errors: '+errors.join('; '));
  console.log(`${checks} homepage integration checks passed`);
}
main().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{
  if(server&&server.exitCode===null) {
    if(process.platform==='win32')await new Promise(resolve=>{const kill=spawn('taskkill',['/PID',String(server.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});kill.on('exit',resolve);});
    else server.kill('SIGTERM');
  }
  await browser?.close();
});
