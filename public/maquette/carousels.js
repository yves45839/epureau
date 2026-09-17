/** Carrousels partagés entre l’accueil React et sa maquette interactive. */
export function mountCarousels(root) {
  const lifecycle = new AbortController();
  const on = (target, name, listener, options = {}) => target.addEventListener(name, listener, { ...options, signal: lifecycle.signal });
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hero = root.querySelector('[data-hero-carousel]');
  if (!hero) { const cleanup = mountLogoLoop(root, on, motion); return () => { lifecycle.abort(); cleanup(); }; }
  const slides = [...hero.querySelectorAll('[data-hero-slide]')];
  const dots = [...hero.querySelectorAll('[data-hero-dot]')];
  const controls = hero.querySelector('[data-hero-controls]');
  const rotation = hero.querySelector('[data-hero-rotation]');
  const announcement = hero.querySelector('[data-hero-announcement]');
  let index = 0;
  let paused = motion.matches;
  let hovered = false;
  let inView = false;
  let timer;
  let touch = null;
  let rotationIntent = null;

  function schedule() {
    window.clearTimeout(timer);
    const running = !paused && !hovered && !motion.matches && inView && !document.hidden;
    rotation.hidden = motion.matches;
    rotation.setAttribute('aria-label', paused ? 'Reprendre le défilement automatique' : 'Mettre le défilement en pause');
    rotation.querySelector('[data-pause-icon]').toggleAttribute('hidden', paused);
    rotation.querySelector('[data-play-icon]').toggleAttribute('hidden', !paused);
    hero.classList.toggle('carousel-playing', running);
    if (running) timer = window.setTimeout(() => show(index + 1), 4000);
  }

  function show(next, manual = false) {
    index = (next + slides.length) % slides.length;
    if (manual) paused = true;
    slides.forEach((slide, i) => {
      slide.classList.toggle('is-current', i === index);
      slide.setAttribute('aria-hidden', String(i !== index));
    });
    dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === index)));
    hero.querySelector('[data-hero-count]').textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    hero.querySelector('[data-hero-title]').textContent = slides[index].dataset.title;
    hero.querySelector('[data-hero-description]').textContent = slides[index].dataset.description;
    if (manual) announcement.textContent = `Photo ${index + 1} sur ${slides.length} : ${slides[index].dataset.caption}`;
    schedule();
  }

  controls.hidden = false;
  dots.forEach((dot, i) => on(dot, 'click', () => show(i, true)));
  on(hero.querySelector('[data-hero-prev]'), 'click', () => show(index - 1, true));
  on(hero.querySelector('[data-hero-next]'), 'click', () => show(index + 1, true));
  // Mémoriser le choix avant le focus provoqué par un clic sur Pause.
  on(rotation, 'pointerdown', event => { if (event.button === 0) rotationIntent = !paused; });
  on(rotation, 'pointercancel', () => { rotationIntent = null; });
  on(rotation, 'blur', () => { rotationIntent = null; });
  on(rotation, 'click', () => { paused = rotationIntent ?? !paused; rotationIntent = null; schedule(); });
  on(hero, 'focusin', () => { paused = true; schedule(); });
  on(hero, 'pointerenter', event => { if (event.pointerType === 'mouse') { hovered = true; schedule(); } });
  on(hero, 'pointerleave', () => { hovered = false; schedule(); });
  on(controls, 'keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); show(index + (event.key === 'ArrowRight' ? 1 : -1), true); }
    if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); show(event.key === 'Home' ? 0 : slides.length - 1, true); }
  });
  on(hero, 'touchstart', event => {
    touch = event.touches.length === 1 && !event.target.closest('a,button') ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }, { passive: true });
  on(hero, 'touchend', event => {
    if (!touch) return;
    const dx = event.changedTouches[0].clientX - touch.x;
    const dy = event.changedTouches[0].clientY - touch.y;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.3) show(index + (dx < 0 ? 1 : -1), true);
    touch = null;
  }, { passive: true });
  on(hero, 'touchcancel', () => { touch = null; });
  on(document, 'visibilitychange', schedule);
  on(motion, 'change', () => { paused = true; schedule(); });
  const heroObserver = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; schedule(); }, { threshold: .05 });
  heroObserver.observe(hero);
  show(0);

  const cleanupLogos = mountLogoLoop(root, on, motion);

  return () => {
    lifecycle.abort();
    window.clearTimeout(timer);
    heroObserver.disconnect();
    cleanupLogos();
  };
}

function mountLogoLoop(root, on, motion) {
  const clients = root.querySelector('[data-logo-carousel]');
  if (!clients) return () => {};
  const rail = clients.querySelector('[data-logo-rail]');
  const logos = [...rail.querySelectorAll('.company-logo')];
  const rotation = clients.querySelector('[data-logo-rotation]');
  const previous = clients.querySelector('[data-logo-prev]');
  const next = clients.querySelector('[data-logo-next]');
  let copies = [], trailing = [];
  let cycle = 0, position = 0, frame = 0, lastTime = 0, settleTimer;
  let paused = false, hovered = false, inView = false, running = false;
  let rotationIntent = null;

  function geometry() {
    const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
    const stride = logos[0].getBoundingClientRect().width + gap;
    const visible = Math.max(1, Math.round((rail.clientWidth + gap - 16) / stride));
    return { stride, visible };
  }
  function normalize(value) {
    return cycle ? cycle + ((value - cycle) % cycle + cycle) % cycle : value;
  }
  function advance(time) {
    frame = 0;
    if (!running) return;
    const elapsed = lastTime ? Math.min((time - lastTime) / 1000, .05) : 0;
    lastTime = time;
    position = normalize(position + elapsed * 40);
    rail.scrollLeft = position;
    frame = requestAnimationFrame(advance);
  }
  function schedule() {
    cancelAnimationFrame(frame); frame = 0; lastTime = 0;
    window.clearTimeout(settleTimer);
    running = !paused && !hovered && !motion.matches && inView && !document.hidden && cycle > 0;
    rotation.hidden = motion.matches;
    rotation.setAttribute('aria-label', paused ? 'Reprendre le défilement des logos' : 'Mettre le défilement des logos en pause');
    rotation.querySelector('[data-pause-icon]').toggleAttribute('hidden', paused);
    rotation.querySelector('[data-play-icon]').toggleAttribute('hidden', !paused);
    if (running) { position = normalize(rail.scrollLeft); frame = requestAnimationFrame(advance); }
  }
  function measure() {
    const relative = cycle ? (rail.scrollLeft - cycle) / cycle : 0;
    cycle = trailing.length ? trailing[0].getBoundingClientRect().left - logos[0].getBoundingClientRect().left : 0;
    if (cycle && !rail.contains(document.activeElement)) rail.scrollLeft = normalize(cycle * (1 + relative));
    position = rail.scrollLeft;
    schedule();
  }
  function copyLogo(logo) {
    // Une copie visuelle n'ajoute ni arrêt de tabulation ni bouton aux lecteurs d'écran.
    const copy = document.createElement('div');
    copy.className = 'company-logo';
    copy.setAttribute('aria-hidden', 'true');
    copy.setAttribute('aria-label', logo.getAttribute('aria-label'));
    copy.setAttribute('data-logo-clone', '');
    logo.childNodes.forEach(child => copy.append(child.cloneNode(true)));
    return copy;
  }
  function configure() {
    const logical = cycle ? normalize(rail.scrollLeft) - cycle : rail.scrollLeft;
    copies.forEach(copy => copy.remove());
    copies = []; trailing = []; cycle = 0;
    rail.classList.toggle('is-looping', !motion.matches);
    if (!motion.matches) {
      const leading = logos.map(copyLogo);
      trailing = logos.map(copyLogo);
      copies = [...leading, ...trailing];
      rail.prepend(...leading); rail.append(...trailing);
    }
    rail.scrollLeft = 0;
    measure();
    rail.scrollLeft = cycle ? normalize(cycle + logical) : logical;
    position = rail.scrollLeft;
  }
  function stop() { paused = true; schedule(); }
  function move(direction) {
    stop();
    const { stride, visible } = geometry();
    const end = rail.scrollWidth - rail.clientWidth;
    let target = rail.scrollLeft + direction * stride * visible;
    if (cycle) target = normalize(target);
    else if (direction > 0 && rail.scrollLeft >= end - 2) target = 0;
    else if (direction < 0 && rail.scrollLeft < 2) target = end;
    // Le repositionnement par un cycle conserve exactement la même rangée visible.
    rail.scrollTo({ left: target, behavior: 'instant' });
    position = rail.scrollLeft;
  }

  clients.querySelector('[data-logo-controls]').hidden = false;
  previous.disabled = false; next.disabled = false;
  on(previous, 'click', () => move(-1));
  on(next, 'click', () => move(1));
  on(rotation, 'pointerdown', event => { if (event.button === 0) rotationIntent = !paused; });
  on(rotation, 'pointercancel', () => { rotationIntent = null; });
  on(rotation, 'blur', () => { rotationIntent = null; });
  on(rotation, 'click', () => { paused = rotationIntent ?? !paused; rotationIntent = null; schedule(); });
  on(clients, 'focusin', stop);
  on(clients, 'pointerenter', event => { if (event.pointerType === 'mouse') { hovered = true; schedule(); } });
  on(clients, 'pointerleave', () => { hovered = false; schedule(); });
  on(rail, 'touchstart', stop, { passive: true });
  on(rail, 'click', stop);
  on(rail, 'wheel', event => { if (event.deltaX || event.shiftKey) stop(); }, { passive: true });
  on(rail, 'scroll', () => {
    if (running) return;
    position = rail.scrollLeft;
    window.clearTimeout(settleTimer);
    if (cycle && !rail.contains(document.activeElement)) settleTimer = window.setTimeout(() => {
      const aligned = normalize(rail.scrollLeft);
      if (Math.abs(aligned - rail.scrollLeft) > 1) rail.scrollLeft = aligned;
      position = rail.scrollLeft;
    }, 200);
  }, { passive: true });
  on(rail, 'keydown', event => {
    if (event.target !== rail) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); }
    if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault(); stop();
      const { stride, visible } = geometry();
      rail.scrollTo({ left: (cycle || 0) + (event.key === 'End' ? stride * (logos.length - visible) : 0), behavior: 'instant' });
    }
  });
  on(document, 'visibilitychange', schedule);
  on(motion, 'change', configure);
  const resizeObserver = new ResizeObserver(measure);
  resizeObserver.observe(rail);
  const visibilityObserver = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; schedule(); });
  visibilityObserver.observe(clients);
  configure();

  return () => {
    running = false;
    cancelAnimationFrame(frame);
    window.clearTimeout(settleTimer);
    resizeObserver.disconnect(); visibilityObserver.disconnect();
    copies.forEach(copy => copy.remove());
    rail.classList.toggle('is-looping', false);
  };
}
