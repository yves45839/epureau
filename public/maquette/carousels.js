/** Carrousels partagés entre l’accueil React et sa maquette interactive. */
export function mountCarousels(root) {
  const lifecycle = new AbortController();
  const on = (target, name, listener, options = {}) => target.addEventListener(name, listener, { ...options, signal: lifecycle.signal });
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hero = root.querySelector('[data-hero-carousel]');
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
    if (running) timer = window.setTimeout(() => show(index + 1), 8000);
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
    hero.querySelector('[data-hero-caption]').textContent = slides[index].dataset.caption;
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

  const clients = root.querySelector('[data-logo-carousel]');
  const rail = clients.querySelector('[data-logo-rail]');
  const logos = [...rail.querySelectorAll('.company-logo')];
  const previous = clients.querySelector('[data-logo-prev]');
  const next = clients.querySelector('[data-logo-next]');
  const counter = clients.querySelector('[data-logo-count]');
  let railFrame = 0;
  const geometry = () => {
    const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
    const stride = logos[0].getBoundingClientRect().width + gap;
    const visible = Math.max(1, Math.round((rail.clientWidth + gap - 16) / stride));
    return { stride, visible, pages: Math.ceil(logos.length / visible) };
  };
  function updateRail() {
    railFrame = 0;
    const { stride, visible, pages } = geometry();
    const end = rail.scrollWidth - rail.clientWidth;
    const page = rail.scrollLeft >= end - 2 ? pages : Math.min(pages, Math.floor((rail.scrollLeft + stride / 2) / (stride * visible)) + 1);
    previous.disabled = rail.scrollLeft < 2;
    next.disabled = rail.scrollLeft >= end - 2;
    counter.textContent = `${String(page).padStart(2, '0')} / ${String(pages).padStart(2, '0')}`;
  }
  function moveRail(direction) {
    const { stride, visible } = geometry();
    rail.scrollBy({ left: direction * stride * visible, behavior: motion.matches ? 'instant' : 'smooth' });
  }
  clients.querySelector('[data-logo-controls]').hidden = false;
  on(previous, 'click', () => moveRail(-1));
  on(next, 'click', () => moveRail(1));
  on(rail, 'scroll', () => { if (!railFrame) railFrame = requestAnimationFrame(updateRail); }, { passive: true });
  on(rail, 'keydown', event => {
    if (event.target !== rail) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); moveRail(event.key === 'ArrowRight' ? 1 : -1); }
    if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); rail.scrollTo({ left: event.key === 'Home' ? 0 : rail.scrollWidth, behavior: motion.matches ? 'instant' : 'smooth' }); }
  });
  const resizeObserver = new ResizeObserver(updateRail);
  resizeObserver.observe(rail);
  updateRail();

  return () => {
    lifecycle.abort();
    window.clearTimeout(timer);
    cancelAnimationFrame(railFrame);
    heroObserver.disconnect();
    resizeObserver.disconnect();
  };
}
