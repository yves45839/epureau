// Run against a local preview with Playwright installed or available via NODE_PATH.
const assert = require('node:assert/strict');
const path = require('node:path');
const { mkdir } = require('node:fs/promises');
const { chromium } = require('playwright');

(async () => {
  const base = process.env.SITE_URL || 'http://127.0.0.1:3001';
  assert(['localhost', '127.0.0.1'].includes(new URL(base).hostname), 'Use a local preview');
  const output = path.resolve('.local/project-scroll');
  await mkdir(output, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE_PATH || undefined });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.setDefaultNavigationTimeout(120000);
  page.setDefaultTimeout(15000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem('epureau-cookies', JSON.stringify({ mesure: false })));
  await page.route('**/api/audience', route => route.fulfill({ status: 204 }));
  const ready = async language => {
    await page.goto(`${base}/${language}`, { waitUntil: 'networkidle' });
    const refuse = page.getByRole('button', { name: 'Refuser', exact: true });
    if (await refuse.isVisible()) await refuse.click();
    await page.evaluate(() => document.fonts.ready);
  };
  const scroll = async progress => {
    await page.evaluate(progress => {
      const story = document.querySelector('.proof-story');
      const header = document.querySelector('.site-header').offsetHeight;
      const height = innerHeight - header;
      window.scrollTo({ top: scrollY + story.getBoundingClientRect().top - header + height * progress, behavior: 'instant' });
    }, progress);
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  };
  const checkPanel = async expected => {
    const state = await page.locator('.proof-story').evaluate(story => {
      const visible = [...story.querySelectorAll('[data-case]')].filter(card => getComputedStyle(card).visibility === 'visible');
      const card = visible[0];
      const rect = card?.getBoundingClientRect();
      const image = card?.querySelector('.case-photo');
      return {
        count: visible.length,
        index: card?.dataset.case,
        text: card?.querySelector('h3').textContent,
        imageAlt: image?.alt,
        imageLoaded: image?.complete && image?.naturalWidth > 0,
        top: rect?.top,
        bottom: rect?.bottom,
        header: document.querySelector('.site-header').getBoundingClientRect().bottom,
        height: innerHeight,
        hiddenAccessible: [...story.querySelectorAll('[data-case]')].some(card => getComputedStyle(card).visibility === 'hidden' && (!card.inert || card.getAttribute('aria-hidden') !== 'true')),
        current: story.querySelector('[data-case-current]').textContent,
      };
    });
    assert.equal(state.count, 1, 'One complete project is visible during every transition');
    if (expected !== undefined) assert.equal(state.index, String(expected));
    assert(state.imageAlt.includes(state.text), 'The visible image belongs to the visible text');
    assert(state.imageLoaded, 'Project photograph loaded');
    assert(state.top >= state.header - 1 && state.bottom <= state.height + 1, 'The complete project fits below the navigation');
    assert.equal(state.hiddenAccessible, false);
    assert.equal(state.current, String(Number(state.index) + 1).padStart(2, '0'));
  };
  const screenshot = async name => {
    await page.waitForFunction(() => getComputedStyle(document.querySelector('[data-case].active')).opacity === '1');
    await page.screenshot({ path: path.join(output, `${name}.png`) });
  };
  try {
    await ready('fr');
    for (const viewport of [{ width: 1440, height: 900 }, { width: 1280, height: 720 }, { width: 1024, height: 768 }]) {
      await page.setViewportSize(viewport);
      await page.locator('.proof-motion').waitFor();
      for (const progress of [0, .2, .45, .49, .5, .51, .55, .8, 1, .8, .51, .5, .49, .2, 0]) {
        await scroll(progress);
        // Fractional scroll positions can round to either side of the exact midpoint.
        await checkPanel(progress === .5 ? undefined : progress < .5 ? 0 : 1);
      }
      await screenshot(`eurolait-${viewport.width}`);
      await page.locator('[data-case-next]').click();
      await page.waitForFunction(() => document.querySelector('[data-case-next]').disabled);
      await page.waitForFunction(() => Math.abs(document.querySelector('.proof-story').getBoundingClientRect().bottom - innerHeight) < 2);
      await checkPanel(1);
      await screenshot(`adzope-${viewport.width}`);
      await page.locator('[data-case-prev]').click();
      await page.waitForFunction(() => Math.abs(document.querySelector('.proof-story').getBoundingClientRect().top - document.querySelector('.site-header').offsetHeight) < 2);
      await checkPanel(0);
      await page.locator('[data-case="0"] a').focus();
      await scroll(.8);
      await checkPanel(1);
      console.log(`PASS: scroll forward/backward, transition boundaries and controls at ${viewport.width}x${viewport.height}`);
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    await ready('en');
    await scroll(.2);
    await checkPanel(0);
    await scroll(.8);
    await checkPanel(1);
    console.log('PASS: English project panels');

    for (const viewport of [{ width: 390, height: 844 }, { width: 768, height: 1024 }, { width: 1280, height: 500 }]) {
      await page.setViewportSize(viewport);
      await page.waitForFunction(() => !document.querySelector('.proof-story').classList.contains('proof-motion'));
      assert.equal(await page.locator('.case-card:visible').count(), 2);
      assert.equal(await page.locator('.case-photo:visible').count(), 2);
      assert.equal(await page.locator('.case-card[inert], .case-card[aria-hidden="true"]').count(), 0);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.locator('[data-case="1"]').scrollIntoViewIfNeeded();
      await page.screenshot({ path: path.join(output, `static-${viewport.width}x${viewport.height}.png`) });
      console.log(`PASS: readable static projects at ${viewport.width}x${viewport.height}`);
    }

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => !document.querySelector('.proof-story').classList.contains('proof-motion'));
    assert.equal(await page.locator('.case-photo:visible').count(), 2);
    assert.equal(await page.locator('.case-card[inert]').count(), 0);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.locator('.proof-motion').waitFor();
    await page.locator('.case-copy p').first().evaluate(el => { el.textContent = Array(15).fill(el.textContent).join(' '); });
    await page.waitForFunction(() => !document.querySelector('.proof-story').classList.contains('proof-motion'));
    assert.equal(await page.locator('.case-card[inert]').count(), 0);
    console.log('PASS: reduced motion and long CMS descriptions keep both projects readable');

    const staticPage = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
    await staticPage.goto(`${base}/fr`, { waitUntil: 'networkidle', timeout: 120000 });
    assert.equal(await staticPage.locator('.case-card:visible').count(), 2);
    assert.equal(await staticPage.locator('.case-photo:visible').count(), 2);
    console.log('PASS: projects remain accessible without JavaScript');
    assert.deepEqual(errors, []);
    console.log('PASS: no browser errors');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
