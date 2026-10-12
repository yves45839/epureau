import { mountCarousels } from "../../public/maquette/carousels.js";
import {uiText} from "@/content/ui-english";
import { domaines } from "@/content/site";

/** Interactions de la maquette validée, limitées à l'accueil et nettoyées au départ. */
export function mountHomeInteractions(root: HTMLElement, language:"fr"|"en"="fr") {
  const ui=(text:string)=>uiText(text,language);
  const cleanupCarousels = mountCarousels(root,ui);
  const lifecycle = new AbortController();
  const { signal } = lifecycle;
  let alive = true;
  const q = <T extends Element = HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const qa = <T extends Element = HTMLElement>(selector: string) => [...root.querySelectorAll<T>(selector)];
  const on = (target: EventTarget, name: string, handler: (event: Event) => void, options: AddEventListenerOptions = {}) => target.addEventListener(name, handler, { ...options, signal });
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reveals = qa(".reveal");
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add("visible"); revealObserver.unobserve(entry.target); }
  }), { threshold: .08, rootMargin: "0px 0px -25px 0px" });
  const syncMotion = () => {
    revealObserver.disconnect();
    root.classList.toggle("motion-ready", !motion.matches);
    reveals.forEach(element => {
      if (motion.matches) element.classList.add("visible");
      else if (!element.classList.contains("visible")) revealObserver.observe(element);
    });
  };
  syncMotion();
  on(motion, "change", syncMotion);
  on(root, "focusin", event => { if (event.target instanceof Element) event.target.closest(".reveal")?.classList.add("visible"); });

  const menuToggle = q<HTMLButtonElement>(".menu-toggle");
  const mobileMenu = q("#mobile-menu");
  const closeMenu = () => {
    mobileMenu.hidden = true; menuToggle.setAttribute("aria-expanded", "false"); menuToggle.setAttribute("aria-label", ui("Ouvrir le menu"));
  };
  on(menuToggle, "click", () => {
    const open = menuToggle.getAttribute("aria-expanded") !== "true";
    mobileMenu.hidden = !open; menuToggle.setAttribute("aria-expanded", String(open)); menuToggle.setAttribute("aria-label", ui(open ? "Fermer le menu" : "Ouvrir le menu"));
  });
  on(mobileMenu, "click", event => { if (event.target instanceof Element && event.target.closest("a")) closeMenu(); });
  on(document, "keydown", event => { if ((event as KeyboardEvent).key === "Escape" && !mobileMenu.hidden) { closeMenu(); menuToggle.focus(); } });
  on(window.matchMedia("(min-width:701px)"), "change", closeMenu);

  const cleanupCases = (() => {
  const story = q(".proof-story");
  if (!story) return () => {};
  const cases = qa("[data-case]");
  const header = q(".site-header");
  const previous = q<HTMLButtonElement>("[data-case-prev]");
  const next = q<HTMLButtonElement>("[data-case-next]");
  let caseFrame = 0;
  let caseInView = false;
  let activeCase = 0;
  let caseHeight = 0;
  const activateCase = (active: number) => {
    activeCase = active;
    const staged = story.classList.contains("proof-motion");
    cases.forEach((card, index) => {
      const hidden = staged && index !== active;
      card.classList.toggle("active", index === active);
      card.inert = hidden;
      if (hidden) card.setAttribute("aria-hidden", "true");
      else card.removeAttribute("aria-hidden");
    });
    previous.disabled = active === 0;
    next.disabled = active >= cases.length - 1;
    q("[data-case-current]").textContent = String(active + 1).padStart(2, "0");
    q(".stage-rail i").style.width = `${cases.length ? (active + 1) / cases.length * 100 : 0}%`;
  };
  const updateCase = () => {
    caseFrame = 0;
    if (!story.classList.contains("proof-motion")) return;
    // Un seul panneau contient la photo et le texte : ils changent ensemble.
    const progress = (header.offsetHeight - story.getBoundingClientRect().top) / caseHeight;
    activateCase(Math.max(0, Math.min(cases.length - 1, Math.floor(progress + .5))));
  };
  const queueCase = () => { if (caseInView && !caseFrame) caseFrame = requestAnimationFrame(updateCase); };
  const layoutCases = () => {
    if (!alive) return;
    caseHeight = window.innerHeight - header.offsetHeight;
    story.style.setProperty("--proof-height", `${caseHeight}px`);
    story.style.setProperty("--proof-count", String(cases.length));
    const candidate = !motion.matches && window.innerWidth > 900 && caseHeight >= 520 && cases.length > 1;
    story.classList.toggle("proof-motion", candidate);
    if (candidate && cases.some(card => card.scrollHeight > caseHeight - 112)) story.classList.remove("proof-motion");
    if (story.classList.contains("proof-motion")) updateCase();
    else activateCase(activeCase);
  };
  const goToCase = (index: number) => {
    if (!story.classList.contains("proof-motion")) return;
    window.scrollTo({ top: window.scrollY + story.getBoundingClientRect().top - header.offsetHeight + index * caseHeight, behavior: "smooth" });
  };
  on(previous, "click", () => goToCase(Math.max(0, activeCase - 1)));
  on(next, "click", () => goToCase(Math.min(cases.length - 1, activeCase + 1)));
  const caseObserver = new IntersectionObserver(([entry]) => { caseInView = entry.isIntersecting; queueCase(); }, {rootMargin:"100px 0px"});
  caseObserver.observe(story);
  on(window, "scroll", queueCase, {passive:true});
  on(window, "resize", layoutCases, {passive:true});
  on(motion, "change", layoutCases);
  const caseResizeObserver = new ResizeObserver(layoutCases);
  cases.forEach(card => caseResizeObserver.observe(card.querySelector(".case-copy")!));
  document.fonts.ready.then(layoutCases);
  layoutCases();

  return () => {
    caseObserver.disconnect(); caseResizeObserver.disconnect(); cancelAnimationFrame(caseFrame);
    story.classList.remove("proof-motion");
    story.style.removeProperty("--proof-height"); story.style.removeProperty("--proof-count");
    cases.forEach(card => { card.inert = false; card.removeAttribute("aria-hidden"); });
  };
  })();

  const serviceKeys = ["ingenierie", "industries", "hygiene", "produits"];
  const points = [["Conception", "Réalisation", "Mise en service"], ["Produits formulés", "Utilités industrielles", "Nettoyage industriel"], ["Entretien du linge", "Hygiène des locaux", "Cuisines professionnelles"], ["NALCO", "ECOLAB", "Commodités & réactifs"]];
  const dialog = q<HTMLDialogElement>("#service-dialog");
  let selectedService = "";
  let previousOverflow = "";
  let focusAfterClose: HTMLElement | null = null;
  qa<HTMLAnchorElement>("[data-detail]").forEach(link => on(link, "click", event => {
    event.preventDefault();
    selectedService = link.dataset.detail ?? "";
    const index = serviceKeys.indexOf(selectedService);
    const service = domaines[index];
    if (!service) return;
    focusAfterClose = link;
    q("#dialog-title").textContent = ui(service.titre);
    q("#dialog-description").textContent = ui(service.texte);
    q("#dialog-points").replaceChildren(...points[index].map(text => { const span = document.createElement("span"); span.textContent = ui(text); return span; }));
    q<HTMLAnchorElement>("#dialog-page").href = "/"+language+service.lien;
    dialog.setAttribute("aria-labelledby", "dialog-title");
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
  }));
  on(dialog, "close", () => {
    document.body.style.overflow = previousOverflow;
    const target = focusAfterClose?.getClientRects().length ? focusAfterClose : menuToggle;
    target.focus({ preventScroll: true });
  });
  on(q(".dialog-close"), "click", () => dialog.close());
  on(dialog, "click", event => {
    if (event.target !== dialog) return;
    const click = event as MouseEvent;
    const rect = dialog.getBoundingClientRect();
    if (click.clientX < rect.left || click.clientX > rect.right || click.clientY < rect.top || click.clientY > rect.bottom) dialog.close();
  });
  on(q("#dialog-contact"), "click", event => {
    event.preventDefault();
    root.dispatchEvent(new CustomEvent("epureau:service", { detail: selectedService }));
    focusAfterClose = q<HTMLInputElement>("#need"); dialog.close();
    const contact = q("#contact");
    if (contact) contact.scrollIntoView({ behavior: motion.matches ? "instant" : "smooth" });
    else window.location.assign("/"+language+"/contact");
  });

  const cleanupServices = (() => {
  const servicesSection = q(".services-section");
  if (!servicesSection) return () => {};
  const servicesShell = q(".services-shell");
  const serviceCards = qa(".service-card");
  const clamp = (value: number) => Math.min(1, Math.max(0, value));
  let servicesFrame = 0;
  let servicesInView = false;
  const displayedProgress = serviceCards.map(() => 0);
  let lastServiceTime = 0;
  const animateServices = (time = performance.now()) => {
    servicesFrame = 0;
    if (!servicesSection.classList.contains("scroll-staging")) return;
    const progress = clamp((q(".site-header").offsetHeight + 24 - servicesSection.getBoundingClientRect().top) / (window.innerHeight * .55));
    const dt = lastServiceTime ? Math.min(time - lastServiceTime, 64) : 16;
    lastServiceTime = time;
    const blend = 1 - Math.exp(-dt / 85);
    let moving = false;
    serviceCards.forEach((card, index) => {
      const local = card.contains(document.activeElement) ? 1 : clamp((progress - index * .15) / .55);
      const target = 1 - Math.pow(1 - local, 3);
      displayedProgress[index] += (target - displayedProgress[index]) * blend;
      if (Math.abs(target - displayedProgress[index]) < .001) displayedProgress[index] = target;
      else moving = true;
      card.style.setProperty("--card-progress", displayedProgress[index].toFixed(4));
    });
    if (moving && servicesInView) servicesFrame = requestAnimationFrame(animateServices);
  };
  const queueServices = () => { if (servicesInView && !servicesFrame) servicesFrame = requestAnimationFrame(animateServices); };
  const layoutServices = () => {
    if (!alive) return;
    const candidate = !motion.matches && window.innerWidth >= 1050 && window.innerHeight >= 720;
    servicesSection.classList.toggle("scroll-staging", candidate);
    if (candidate && servicesShell.offsetHeight + q(".site-header").offsetHeight + 48 > window.innerHeight) servicesSection.classList.remove("scroll-staging");
    if (!servicesSection.classList.contains("scroll-staging")) serviceCards.forEach(card => card.style.removeProperty("--card-progress"));
    cancelAnimationFrame(servicesFrame);
    servicesFrame = 0;
    lastServiceTime = 0;
    animateServices();
  };
  const serviceObserver = new IntersectionObserver(([entry]) => { servicesInView = entry.isIntersecting; queueServices(); }, { rootMargin: "100px 0px" });
  serviceObserver.observe(servicesSection);
  on(window, "scroll", queueServices, { passive: true });
  on(window, "resize", layoutServices, { passive: true });
  on(motion, "change", layoutServices);
  on(servicesSection, "focusin", queueServices);
  on(servicesSection, "focusout", queueServices);
  document.fonts.ready.then(layoutServices);
  layoutServices();

  return () => { serviceObserver.disconnect(); cancelAnimationFrame(servicesFrame); };
  })();

  const closeLogos = () => qa(".company-logo").forEach(logo => { logo.classList.remove("show-name"); logo.setAttribute("aria-pressed", "false"); });
  on(root, "click", event => {
    const logo = event.target instanceof Element ? event.target.closest(".company-logo") : null;
    if (!logo) return;
    const open = !logo.classList.contains("show-name");
    closeLogos();
    qa(".company-logo").filter(item => item.getAttribute("aria-label") === logo.getAttribute("aria-label")).forEach(item => {
      item.classList.toggle("show-name", open); item.setAttribute("aria-pressed", String(open));
    });
  });
  on(document, "click", event => { if (event.target instanceof Element && !event.target.closest(".company-logo")) closeLogos(); });
  on(document, "keydown", event => { if ((event as KeyboardEvent).key === "Escape") closeLogos(); });

  return () => {
    alive = false;
    cleanupCarousels();
    lifecycle.abort(); revealObserver.disconnect(); cleanupServices(); cleanupCases();
    if (dialog.open) { document.body.style.overflow = previousOverflow; dialog.close(); }
    root.classList.remove("motion-ready");
  };
}
