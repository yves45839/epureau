'use strict';

const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const reveals = [...document.querySelectorAll('.reveal')];
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); } });
}, { threshold: .08, rootMargin: '0px 0px -25px 0px' });
function syncMotion() {
  revealObserver.disconnect();
  document.documentElement.classList.toggle('motion-ready', !motion.matches);
  reveals.forEach(element => { if (motion.matches) element.classList.add('visible'); else if (!element.classList.contains('visible')) revealObserver.observe(element); });
}
syncMotion(); motion.addEventListener('change', syncMotion);
document.addEventListener('focusin', event => { const reveal = event.target.closest('.reveal'); if (reveal) reveal.classList.add('visible'); });

const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');
function closeMenu() { mobileMenu.hidden = true; menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.setAttribute('aria-label', 'Ouvrir le menu'); }
menuToggle.addEventListener('click', () => { const open = menuToggle.getAttribute('aria-expanded') !== 'true'; mobileMenu.hidden = !open; menuToggle.setAttribute('aria-expanded', String(open)); menuToggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu'); });
mobileMenu.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobileMenu.hidden) { closeMenu(); menuToggle.focus(); } });
window.matchMedia('(min-width:701px)').addEventListener('change', closeMenu);

const casePhotos = [...document.querySelectorAll('[data-case-image]')];
const cases = [...document.querySelectorAll('[data-case]')];
let scrollFrame = 0;
function updateCase() {
  scrollFrame = 0;
  const middle = window.innerHeight * .57;
  let active = 0;
  cases.forEach((card, index) => { if (card.getBoundingClientRect().top < middle) active = index; });
  casePhotos.forEach((photo, index) => photo.classList.toggle('active', index === active));
  document.querySelector('.stage-rail i').style.width = active ? '100%' : '50%';
}
function queueScroll() { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateCase); }
const sceneObserver = new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) { window.addEventListener('scroll', queueScroll, { passive: true }); queueScroll(); }
  else { window.removeEventListener('scroll', queueScroll); if (scrollFrame) cancelAnimationFrame(scrollFrame); scrollFrame = 0; }
});
sceneObserver.observe(document.querySelector('.proof-story'));
window.addEventListener('resize', queueScroll, { passive: true });

const services = {
  ingenierie: { title: 'Ingénierie du traitement de l’eau', description: 'Bureau d’études, conception, réalisation et exploitation des ouvrages, en clé en main.', points: ['Conception', 'Réalisation', 'Mise en service'], page: '/ingenierie/notre-expertise', prompt: 'Type d’installation, localisation, besoins et contraintes…' },
  industries: { title: 'Service aux industries', description: 'Application de produits formulés, optimisation des utilités et services spéciaux ECOLAB F&B.', points: ['Produits formulés', 'Utilités industrielles', 'Nettoyage industriel'], page: '/service-aux-industries', prompt: 'Activité du site, installations concernées et besoin d’accompagnement…' },
  hygiene: { title: 'Hygiène institutionnelle', description: 'Hôpitaux, hôtels, cuisines professionnelles, buanderies et pressings : produits, dosage et expertise.', points: ['Entretien du linge', 'Hygiène des locaux', 'Cuisines professionnelles'], page: '/hygiene-institutionnelle', prompt: 'Type d’établissement, entretien du linge, locaux ou cuisines…' },
  produits: { title: 'Négoce de produits chimiques', description: 'Produits NALCO, gamme ECOLAB, commodités, réactifs de laboratoire et matériel de mesure.', points: ['NALCO', 'ECOLAB', 'Commodités & réactifs'], page: '/negoce', prompt: 'Produits recherchés, conditionnement et quantités souhaitées…' }
};
const dialog = document.querySelector('#service-dialog');
const need = document.querySelector('#need');
const message = document.querySelector('#message');
let selectedService = '';
let previousOverflow = '';
let focusAfterClose = null;
function updateNeed() { message.placeholder = services[need.value]?.prompt || 'Décrivez brièvement votre demande.'; }
need.addEventListener('change', updateNeed);
document.querySelectorAll('[data-detail]').forEach(link => link.addEventListener('click', event => {
  event.preventDefault(); selectedService = link.dataset.detail; focusAfterClose = link;
  const service = services[selectedService];
  document.querySelector('#dialog-title').textContent = service.title;
  document.querySelector('#dialog-description').textContent = service.description;
  const points = document.querySelector('#dialog-points'); points.replaceChildren();
  service.points.forEach(text => { const span = document.createElement('span'); span.textContent = text; points.append(span); });
  document.querySelector('#dialog-page').href = service.page;
  dialog.setAttribute('aria-labelledby', 'dialog-title'); previousOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden'; dialog.showModal();
}));
dialog.addEventListener('close', () => {
  document.body.style.overflow = previousOverflow;
  const target = focusAfterClose && focusAfterClose.getClientRects().length ? focusAfterClose : menuToggle;
  target.focus({ preventScroll: true });
});
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
document.querySelector('#dialog-contact').addEventListener('click', event => { event.preventDefault(); need.value = selectedService; updateNeed(); focusAfterClose = need; dialog.close(); document.querySelector('#contact').scrollIntoView({ behavior: motion.matches ? 'instant' : 'smooth' }); });
document.querySelector('#quote-form').addEventListener('submit', event => { event.preventDefault(); const result = document.querySelector('#form-result'); result.textContent = 'Aperçu de confirmation : votre demande serait transmise à l’équipe EPUREAU. Aucun envoi n’a été effectué dans cette maquette.'; result.hidden = false; result.scrollIntoView({ behavior: motion.matches ? 'instant' : 'smooth', block: 'nearest' }); });
document.querySelector('#demo-submit').disabled = false;

// La séquence reste fixée uniquement lorsque les quatre cartes tiennent à l'écran.
const servicesSection = document.querySelector('.services-section');
const servicesShell = document.querySelector('.services-shell');
const serviceCards = [...document.querySelectorAll('.service-card')];
let servicesInView = false;
let servicesFrame = 0;
const clamp = value => Math.min(1, Math.max(0, value));
function animateServices() {
  servicesFrame = 0;
  if (!servicesSection.classList.contains('scroll-staging')) return;
  const header = document.querySelector('.site-header').offsetHeight;
  const top = servicesSection.getBoundingClientRect().top;
  const progress = clamp((header + 24 - top) / (window.innerHeight * .55));
  serviceCards.forEach((card, index) => {
    const local = card.contains(document.activeElement) ? 1 : clamp((progress - index * .15) / .55);
    const eased = 1 - Math.pow(1 - local, 2);
    card.style.setProperty('--card-progress', eased.toFixed(4));
  });
}
function queueServices() { if (!servicesFrame) servicesFrame = requestAnimationFrame(animateServices); }
function layoutServices() {
  const candidate = !motion.matches && window.innerWidth >= 1050 && window.innerHeight >= 720;
  servicesSection.classList.toggle('scroll-staging', candidate);
  if (candidate) {
    const header = document.querySelector('.site-header').offsetHeight;
    if (servicesShell.offsetHeight + header + 48 > window.innerHeight) servicesSection.classList.remove('scroll-staging');
  }
  if (!servicesSection.classList.contains('scroll-staging')) serviceCards.forEach(card => card.style.removeProperty('--card-progress'));
  animateServices();
}
const servicesObserver = new IntersectionObserver(([entry]) => {
  servicesInView = entry.isIntersecting;
  if (servicesInView) { window.addEventListener('scroll', queueServices, { passive: true }); queueServices(); }
  else { window.removeEventListener('scroll', queueServices); if (servicesFrame) cancelAnimationFrame(servicesFrame); servicesFrame = 0; }
}, { rootMargin: '100px 0px' });
servicesObserver.observe(servicesSection);
window.addEventListener('resize', layoutServices, { passive: true });
motion.addEventListener('change', layoutServices);
document.fonts.ready.then(layoutServices);
servicesSection.addEventListener('focusin', queueServices);
servicesSection.addEventListener('focusout', queueServices);
layoutServices();

function closeLogoNames() {
  document.querySelectorAll('.company-logo').forEach(logo => { logo.classList.remove('show-name'); logo.setAttribute('aria-pressed', 'false'); });
}
document.addEventListener('click', event => {
  const logo = event.target.closest('.company-logo');
  if (!logo) { closeLogoNames(); return; }
  const open = !logo.classList.contains('show-name');
  closeLogoNames();
  document.querySelectorAll('.company-logo').forEach(item => {
    if (item.getAttribute('aria-label') === logo.getAttribute('aria-label')) {
      item.classList.toggle('show-name', open); item.setAttribute('aria-pressed', String(open));
    }
  });
});
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeLogoNames(); });
