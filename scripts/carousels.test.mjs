import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

// Test du contrôleur avec événements et horloge simulés, sans navigateur.
class ElementStub extends EventTarget {
  attrs = new Map();
  nodes = new Map();
  classes = new Set();
  hidden = false;
  disabled = false;
  textContent = '';
  dataset = {};
  childNodes = [];
  parent = null;
  className = '';
  append(...nodes) { nodes.forEach(node => { node.parent = this; this.childNodes.push(node); }); }
  prepend(...nodes) { nodes.forEach(node => { node.parent = this; }); this.childNodes.unshift(...nodes); }
  remove() { if (this.parent) this.parent.childNodes = this.parent.childNodes.filter(node => node !== this); }
  contains(node) { return node === this || this.childNodes.some(child => child.contains(node)); }
  getAttribute(name) { return this.attrs.get(name); }
  classList = { toggle: (name, value) => value ? this.classes.add(name) : this.classes.delete(name) };
  querySelector(selector) { return this.nodes.get(selector); }
  querySelectorAll(selector) { return this.nodes.get(selector) ?? []; }
  setAttribute(name, value) { this.attrs.set(name, value); }
  toggleAttribute(name, value) { if (value) this.attrs.set(name, ''); else this.attrs.delete(name); }
  getBoundingClientRect() { return { width: 100, left: this.parent ? this.parent.childNodes.indexOf(this) * 114 - this.parent.scrollLeft : 0 }; }
  closest() { return null; }
}

function fixture({heroVisible=true,logosVisible=true}={}) {
  const element = () => new ElementStub();
  const root = element(), hero = element(), rail = element(), clients = element();
  const motion = element(), document = element();
  motion.matches = false;
  document.createElement = () => element();
  document.activeElement = null;
  const timers = new Map(), frames = new Map(), observers = [];
  let id = 0;
  const slides = Array.from({ length: 3 }, (_, i) => { const el = element(); el.dataset.caption = `Métier ${i + 1}`; el.dataset.title = `Titre ${i + 1}`; el.dataset.description = `Description ${i + 1}`; return el; });
  const dots = Array.from({ length: 3 }, element);
  for (const name of ['controls', 'rotation', 'announcement', 'count', 'title', 'description', 'prev', 'next']) hero.nodes.set(`[data-hero-${name}]`, element());
  const rotation = hero.querySelector('[data-hero-rotation]');
  rotation.nodes.set('[data-pause-icon]', element());
  rotation.nodes.set('[data-play-icon]', element());
  hero.nodes.set('[data-hero-slide]', slides);
  hero.nodes.set('[data-hero-dot]', dots);
  const logos = Array.from({ length: 6 }, (_, i) => { const logo = element(); logo.setAttribute('aria-label', `Client ${i}`); return logo; });
  rail.nodes.set('.company-logo', logos);
  rail.append(...logos);
  Object.assign(rail, { scrollLeft: 0, clientWidth: 344 });
  Object.defineProperty(rail, 'scrollWidth', { get: () => rail.childNodes.length * 114 + 2 });
  rail.scrollBy = options => { rail.lastScroll = options; rail.scrollLeft += options.left; };
  rail.scrollTo = options => { rail.lastScroll = options; rail.scrollLeft = options.left; };
  clients.nodes.set('[data-logo-rail]', rail);
  for (const name of ['controls', 'rotation', 'prev', 'next']) clients.nodes.set(`[data-logo-${name}]`, element());
  const logoRotation = clients.querySelector('[data-logo-rotation]');
  logoRotation.nodes.set('[data-pause-icon]', element());
  logoRotation.nodes.set('[data-play-icon]', element());
  if(heroVisible)root.nodes.set('[data-hero-carousel]', hero);
  if(logosVisible)root.nodes.set('[data-logo-carousel]', clients);
  const globals = {
    AbortController,
    document,
    window: { matchMedia: () => motion, setTimeout: (fn, delay) => { timers.set(++id, { fn, delay }); return id; }, clearTimeout: key => timers.delete(key) },
    requestAnimationFrame: fn => { frames.set(++id, fn); return id; },
    cancelAnimationFrame: key => frames.delete(key),
    getComputedStyle: () => ({ columnGap: '14px' }),
    IntersectionObserver: class { constructor(callback) { this.callback = callback; observers.push(this); } observe() {} disconnect() { this.disconnected = true; } },
    ResizeObserver: class { constructor(callback) { this.callback = callback; observers.push(this); } observe() {} disconnect() { this.disconnected = true; } },
  };
  const source = readFileSync(new URL('../public/maquette/carousels.js', import.meta.url), 'utf8');
  const mount = vm.runInNewContext(source.replace('export function', 'function') + '\nmountCarousels;', globals);
  const cleanup = mount(root);
  const fire = (node, name, extra = {}) => { const event = new Event(name, { cancelable: true }); Object.assign(event, extra); node.dispatchEvent(event); return event; };
  const tick = () => { const [key, { fn }] = timers.entries().next().value; timers.delete(key); fn(); };
  const count = () => hero.querySelector('[data-hero-count]').textContent;
  const step = time => { const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn(time)); };
  return { hero, rail, clients, rotation, motion, document, timers, observers, fire, tick, count, cleanup, dots, frames, step, logos };
}

test('rotation à quatre secondes avec titre associé, navigation circulaire et arrêt hors écran ou onglet caché', () => {
  const f = fixture();
  assert.equal(f.timers.size, 0);
  f.observers[0].callback([{ isIntersecting: true }]);
  assert.equal([...f.timers.values()][0].delay, 4000);
  f.tick(); assert.equal(f.count(), '02 / 03');
  assert.equal(f.hero.querySelector('[data-hero-title]').textContent, 'Titre 2');
  assert.equal(f.hero.querySelector('[data-hero-description]').textContent, 'Description 2');
  f.tick(); f.tick(); assert.equal(f.count(), '01 / 03');
  f.document.hidden = true; f.fire(f.document, 'visibilitychange'); assert.equal(f.timers.size, 0);
  f.document.hidden = false; f.fire(f.document, 'visibilitychange'); assert.equal(f.timers.size, 1);
  f.observers[0].callback([{ isIntersecting: false }]); assert.equal(f.timers.size, 0);
  f.cleanup();
});

test('le premier clic sur Pause reste une pause malgré le focus ; reprise et sélection manuelles', () => {
  const f = fixture();
  f.observers[0].callback([{ isIntersecting: true }]);
  f.fire(f.rotation, 'pointerdown', { button: 0 });
  f.fire(f.hero, 'focusin');
  f.fire(f.rotation, 'click');
  assert.equal(f.timers.size, 0);
  assert.equal(f.rotation.attrs.get('aria-label'), 'Reprendre le défilement automatique');
  f.fire(f.rotation, 'click'); assert.equal(f.timers.size, 1);
  f.fire(f.dots[2], 'click'); assert.equal(f.count(), '03 / 03'); assert.equal(f.timers.size, 0);
  f.fire(f.hero.querySelector('[data-hero-next]'), 'click'); assert.equal(f.count(), '01 / 03');
  f.cleanup();
});

test('réduction des mouvements, geste vertical préservé, rail manuel et nettoyage', () => {
  const f = fixture();
  f.observers[0].callback([{ isIntersecting: true }]);
  f.motion.matches = true; f.fire(f.motion, 'change');
  assert.equal(f.timers.size, 0); assert.equal(f.rotation.hidden, true);
  f.fire(f.hero, 'touchstart', { touches: [{ clientX: 200, clientY: 200 }] });
  f.fire(f.hero, 'touchend', { changedTouches: [{ clientX: 180, clientY: 60 }] });
  assert.equal(f.count(), '01 / 03');
  f.fire(f.hero, 'touchstart', { touches: [{ clientX: 200, clientY: 200 }] });
  f.fire(f.hero, 'touchend', { changedTouches: [{ clientX: 70, clientY: 190 }] });
  assert.equal(f.count(), '02 / 03');
  assert.equal(f.clients.querySelector('[data-logo-prev]').disabled, false);
  f.fire(f.clients.querySelector('[data-logo-next]'), 'click');
  assert.equal(f.rail.lastScroll.left, 342); assert.equal(f.rail.lastScroll.behavior, 'instant');
  f.cleanup(); assert.ok(f.observers.every(observer => observer.disconnected));
  f.fire(f.hero.querySelector('[data-hero-next]'), 'click'); assert.equal(f.count(), '02 / 03');
});


test('boucle de logos sans retour visible, pause au survol, mode réduit et retrait des copies', () => {
  const f = fixture();
  const cycle = 684;
  assert.equal(f.rail.childNodes.length, 18);
  assert.equal(f.rail.childNodes.filter(node => node.attrs.get('aria-hidden') === 'true').length, 12);
  assert.equal(f.rail.scrollLeft, cycle);
  f.observers[2].callback([{ isIntersecting: true }]);
  f.step(1000); f.step(1050);
  assert.equal(f.rail.scrollLeft, cycle + 2);
  f.rail.scrollLeft = cycle * 2 - 1;
  f.fire(f.document, 'visibilitychange');
  f.step(2000); f.step(2050);
  assert.equal(f.rail.scrollLeft, cycle + 1);
  f.fire(f.clients, 'pointerenter', { pointerType: 'mouse' });
  assert.equal(f.frames.size, 0);
  f.fire(f.clients, 'pointerleave');
  f.step(30000);
  assert.equal(f.rail.scrollLeft, cycle + 1);
  f.motion.matches = true; f.fire(f.motion, 'change');
  assert.equal(f.rail.childNodes.length, 6); assert.equal(f.frames.size, 0);
  f.motion.matches = false; f.fire(f.motion, 'change');
  assert.equal(f.rail.childNodes.length, 18);
  f.cleanup(); assert.equal(f.rail.childNodes.length, 6); assert.equal(f.frames.size, 0);
});

test('retirer le carrousel principal ou les références ne casse pas les autres sections',()=>{for(const options of [{heroVisible:false},{logosVisible:false},{heroVisible:false,logosVisible:false}]){const f=fixture(options);f.cleanup();assert.equal(f.timers.size,0);assert.equal(f.frames.size,0);assert.ok(f.observers.every(o=>o.disconnected));}});
