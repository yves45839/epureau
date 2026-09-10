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
  classList = { toggle: (name, value) => value ? this.classes.add(name) : this.classes.delete(name) };
  querySelector(selector) { return this.nodes.get(selector); }
  querySelectorAll(selector) { return this.nodes.get(selector) ?? []; }
  setAttribute(name, value) { this.attrs.set(name, value); }
  toggleAttribute(name, value) { if (value) this.attrs.set(name, ''); else this.attrs.delete(name); }
  getBoundingClientRect() { return { width: 100 }; }
  closest() { return null; }
}

function fixture() {
  const element = () => new ElementStub();
  const root = element(), hero = element(), rail = element(), clients = element();
  const motion = element(), document = element();
  motion.matches = false;
  const timers = new Map(), frames = new Map(), observers = [];
  let id = 0;
  const slides = Array.from({ length: 3 }, (_, i) => { const el = element(); el.dataset.caption = `Métier ${i + 1}`; return el; });
  const dots = Array.from({ length: 3 }, element);
  for (const name of ['controls', 'rotation', 'announcement', 'count', 'caption', 'prev', 'next']) hero.nodes.set(`[data-hero-${name}]`, element());
  const rotation = hero.querySelector('[data-hero-rotation]');
  rotation.nodes.set('[data-pause-icon]', element());
  rotation.nodes.set('[data-play-icon]', element());
  hero.nodes.set('[data-hero-slide]', slides);
  hero.nodes.set('[data-hero-dot]', dots);
  rail.nodes.set('.company-logo', Array.from({ length: 6 }, element));
  Object.assign(rail, { scrollLeft: 0, clientWidth: 344, scrollWidth: 686 });
  rail.scrollBy = options => { rail.lastScroll = options; };
  rail.scrollTo = options => { rail.lastScroll = options; };
  clients.nodes.set('[data-logo-rail]', rail);
  for (const name of ['controls', 'count', 'prev', 'next']) clients.nodes.set(`[data-logo-${name}]`, element());
  root.nodes.set('[data-hero-carousel]', hero);
  root.nodes.set('[data-logo-carousel]', clients);
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
  return { hero, rail, clients, rotation, motion, document, timers, observers, fire, tick, count, cleanup, dots };
}

test('rotation à huit secondes, navigation circulaire et arrêt hors écran ou onglet caché', () => {
  const f = fixture();
  assert.equal(f.timers.size, 0);
  f.observers[0].callback([{ isIntersecting: true }]);
  assert.equal([...f.timers.values()][0].delay, 8000);
  f.tick(); assert.equal(f.count(), '02 / 03');
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
  assert.equal(f.clients.querySelector('[data-logo-prev]').disabled, true);
  f.fire(f.clients.querySelector('[data-logo-next]'), 'click');
  assert.equal(f.rail.lastScroll.left, 342); assert.equal(f.rail.lastScroll.behavior, 'instant');
  f.cleanup(); assert.ok(f.observers.every(observer => observer.disconnected));
  f.fire(f.hero.querySelector('[data-hero-next]'), 'click'); assert.equal(f.count(), '02 / 03');
});
