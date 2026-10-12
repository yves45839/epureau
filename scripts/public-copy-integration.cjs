// Run against a local preview with Playwright installed or available via NODE_PATH.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('playwright');
const definitions = require('../src/content/page-definitions.json');
const products = require('../src/content/imported-products.json').products;
const english = require('../src/content/imported-products-en.json');

(async () => {
  const base = process.env.SITE_URL || 'http://127.0.0.1:3001';
  assert(['localhost', '127.0.0.1'].includes(new URL(base).hostname), 'Use a local preview');
  const output = path.resolve('.local/copy-audit/browser');
  fs.mkdirSync(output, {recursive:true});
  const browser = await chromium.launch({headless:true, executablePath:process.env.BROWSER_EXECUTABLE_PATH || undefined});
  try {
    const page = await browser.newPage({viewport:{width:1440,height:900}, reducedMotion:'reduce'});
    page.setDefaultNavigationTimeout(120000);
    page.setDefaultTimeout(15000);
    await page.addInitScript(() => localStorage.setItem('epureau-cookies', JSON.stringify({mesure:false})));
    await page.route('**/api/audience', route => route.fulfill({status:204}));
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const report = [];
    const visit = async (route, language) => {
      console.log(`Checking /${language}${route}`);
      const response = await page.goto(`${base}/${language}${route === '/' ? '' : route}`, {waitUntil:'domcontentloaded'});
      assert.equal(response.status(),200,route);
      assert.equal(await page.locator('html').getAttribute('lang'),language);
      const h1 = page.locator('h1');
      assert(await h1.count() > 0,route);
      assert((await h1.first().innerText()).trim(),route);
      const body = await page.locator('body').innerText();
      assert.doesNotMatch(body,/vaisseille|textilles|détergeant|tpempérature|blinchimant|chllorhexdine|sallissures|usagepour|\uFFFD/i,route);
      if(language === 'en') assert.doesNotMatch(body,/Demander une cotation|Votre demande concerne|Nos métiers|Nous contacter|Spécialisée dans le traitement|société de services/);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2);
      assert.equal(overflow,false,`${language}${route}: horizontal overflow`);
      report.push({path:`/${language}${route}`,title:await page.title(),status:response.status()});
    };
    for(const language of ['fr','en']) {
      for(const definition of definitions) {
        await visit(definition.path,language);
        if(definition.key === 'negoce') {
          await page.waitForLoadState('load');
          const search = page.locator('.catalog-filters input[type=search]');
          await search.fill('DryExx SF');
          await page.waitForFunction(() => /^1 (produit|product)$/.test(document.querySelector('.catalog-results [role=status]').textContent.trim()));
          assert.equal((await page.locator('.catalog-results [role=status]').innerText()).trim(),language === 'fr' ? '1 produit' : '1 product');
          await search.fill('');
          await page.waitForFunction(() => /^(?!1 )\d+ (produits|products)$/.test(document.querySelector('.catalog-results [role=status]').textContent.trim()));
          assert.match(await page.locator('.catalog-results [role=status]').innerText(),language === 'fr' ? /\d+ produits$/ : /\d+ products$/);
          assert(await page.locator('.catalog-group .produit').count() > 0);
          assert.equal(await page.locator('.catalog-group .produit-corps > p, .catalog-group .produit-corps > dl, .catalog-group .produit-corps > ul').count(),0,'Compact cards keep descriptions on product pages');
        }
      }
      for(const slug of ['autres-marques-liquide-vaisselle','ecolab-carpet-a','ecolab-ecobrite-oxy','commodites-reactifs-acide-chlorhidrique-38','autres-marques-regulateur-dulcometer-analyseur-de-chlore-en-lig']) {
        await visit(`/negoce/${slug}`,language);
        const data = products.find(product => product.slug === slug).data;
        assert.equal((await page.locator('h1').innerText()).trim(),language === 'en' ? english[slug].nom || data.nom : data.nom);
        assert.equal((await page.locator('.product-detail .lead').innerText()).trim(),language === 'en' ? english[slug].texte : data.texte);
        if(slug === 'autres-marques-liquide-vaisselle') await page.screenshot({path:path.join(output,`product-${language}.png`),fullPage:true});
      }
    }
    for(const width of [1280,1100]) {
      await page.setViewportSize({width,height:800});
      await visit('/a-propos','fr');
      assert(await page.locator('.nav .burger').isVisible());
      assert.equal(await page.locator('.nav .menu').isVisible(),false);
    }
    await page.setViewportSize({width:390,height:844});
    for(const language of ['fr','en']) {
      for(const route of ['/negoce','/contact','/negoce/autres-marques-regulateur-dulcometer-analyseur-de-chlore-en-lig']) await visit(route,language);
      await page.screenshot({path:path.join(output,`mobile-${language}.png`),fullPage:true});
    }
    assert.deepEqual(errors,[],'No browser runtime errors');
    fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(report,null,2));
    console.log(`PASS: ${report.length} public pages, FR/EN copy, product names/descriptions, plural labels, desktop/mobile overflow and browser errors.`);
  } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exitCode=1;});
