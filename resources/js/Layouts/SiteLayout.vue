<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { Link, usePage } from '@inertiajs/vue3';
import { todayLong, store, asset } from '../utils';

const page = usePage();
const nav = computed(() => page.props.nav);
const url = computed(() => page.url);

const today = todayLong();
const theme = ref(typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') || 'light' : 'light');
const isDark = computed(() => theme.value === 'dark');

function toggleTheme() {
    theme.value = isDark.value ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme.value);
    store('aq-theme', theme.value);
}

const urlRub = (r) => r === 'portraits' ? '/portraits' : '/rubrique/' + r;
const urlRegion = (g) => '/afriques/' + g;
const cur = (key) => url.value.startsWith('/rubrique/' + key) || (key === 'portraits' && url.value.startsWith('/portraits')) || (key === 'afriques' && url.value.startsWith('/afriques')) ? 'page' : null;

const social = `
    <a href="https://www.facebook.com/afriquinfoscom/" aria-label="Afriquinfos sur Facebook" rel="noopener"><i class="bi bi-facebook" aria-hidden="true"></i></a>
    <a href="https://x.com/AfriquinfosActu" aria-label="Afriquinfos sur X" rel="noopener"><i class="bi bi-twitter-x" aria-hidden="true"></i></a>`;

const menuRubs = computed(() => (nav.value?.rubriques || []).filter((r) => r.slug !== 'tips' && r.slug !== 'portraits'));
const year = new Date().getFullYear();

const showTop = ref(false);
const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let lastScrollY = 0;
function onScroll() {
    showTop.value = window.scrollY > 600;
    const navEl = document.getElementById('mainNav');
    if (navEl) {
        const y = window.scrollY;
        navEl.classList.toggle('is-tucked', y > 200 && y > lastScrollY && !document.getElementById('menu')?.classList.contains('show'));
        lastScrollY = y;
    }
}
function toTop() { window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); }

// Reveal au scroll : les blocs apparaissent en fondu glissé avec un léger décalage
const REVEAL_SEL = '.aq-section .row > *, .aq-lead, .aq-stack__item, .aq-poster, .aq-portrait, .aq-tip, .aq-tribune, .aq-filrow__list li, .aq-agenda-row > *, .aq-debate, .aq-newsletter, .aq-legal__doc > section';
let revealObs = null;
function initReveals() {
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    revealObs?.disconnect();
    revealObs = new IntersectionObserver((entries) => {
        let batch = 0;
        entries.forEach((e) => {
            if (!e.isIntersecting) return;
            e.target.style.setProperty('--rd', Math.min(batch++ * 60, 300) + 'ms');
            e.target.classList.add('is-in');
            revealObs.unobserve(e.target);
        });
    }, { rootMargin: '0px 0px -4% 0px', threshold: 0.02 });
    document.querySelectorAll(REVEAL_SEL).forEach((el) => {
        if (el.classList.contains('is-in')) return;
        el.classList.add('aq-reveal');
        revealObs.observe(el);
    });
}

onMounted(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    const navEl = document.getElementById('mainNav');
    const head = document.querySelector('.aq-head');
    if (navEl && head && 'IntersectionObserver' in window) {
        new IntersectionObserver((e) => navEl.classList.toggle('is-stuck', !e[0].isIntersecting)).observe(head);
    }
    // Dropdown au survol sur grand écran
    const dd = document.querySelector('.aq-menu .dropdown');
    function hoverDropdown() {
        if (!dd || !window.bootstrap || !window.matchMedia('(hover: hover) and (min-width: 992px)').matches) return;
        const t = dd.querySelector('.dropdown-toggle');
        const inst = window.bootstrap.Dropdown.getOrCreateInstance(t);
        let timer;
        dd.addEventListener('mouseenter', () => { clearTimeout(timer); inst.show(); });
        dd.addEventListener('mouseleave', () => { timer = setTimeout(() => inst.hide(), 150); });
    }
    if (window.bootstrap) hoverDropdown(); else window.addEventListener('load', hoverDropdown);
    setTimeout(initReveals, 60);
});

watch(() => page.url, () => setTimeout(initReveals, 80));

// Consentement cookies : bandeau affiché jusqu'à un choix explicite (6 mois)
const consent = ref(store('aq-consent'));
function setConsent(v) {
    consent.value = v;
    store('aq-consent', v);
    document.cookie = 'aq_consent=' + v + ';max-age=' + 60 * 60 * 24 * 180 + ';path=/;samesite=lax';
}

onUnmounted(() => { window.removeEventListener('scroll', onScroll); revealObs?.disconnect(); });
</script>

<template>
  <a class="visually-hidden-focusable aq-skip" href="#contenu">Aller au contenu</a>

  <div class="aq-top"><div class="container-xl"><span class="aq-top__date">{{ today }}</span><nav aria-label="Liens utiles">
    <Link class="d-none d-sm-inline" href="/portraits" :aria-current="url === '/portraits' ? 'page' : null">Portraits</Link>
    <Link class="d-none d-sm-inline" href="/agendas" :aria-current="url === '/agendas' ? 'page' : null">Agendas</Link>
    <Link class="d-none d-md-inline" href="/contact" :aria-current="url === '/contact' ? 'page' : null">Contact</Link>
    <a class="d-none d-md-inline" href="/rss.xml"><i class="bi bi-rss" aria-hidden="true"></i> RSS</a>
    <span class="aq-social aq-social--top d-none d-lg-flex" v-html="social"></span>
    <button class="aq-theme" type="button" :aria-pressed="isDark" @click="toggleTheme">
      <i class="bi" :class="isDark ? 'bi-sun' : 'bi-moon-stars'" aria-hidden="true"></i><span>{{ isDark ? 'Clair' : 'Sombre' }}</span>
    </button>
  </nav></div></div>

  <header class="aq-head"><div class="container-xl aq-head__row">
    <button class="aq-icon d-lg-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#menu" aria-controls="menu" aria-label="Ouvrir le menu"><i class="bi bi-list" aria-hidden="true"></i></button>
    <Link class="aq-head__brand" href="/" aria-label="Afriquinfos, accueil">
      <picture class="aq-logo--light"><source media="(max-width: 575.98px)" :srcset="asset('assets/img/logo-compact.png')" width="600" height="158"><img :src="asset('assets/img/logo-afriquinfos.png')" alt="Afriquinfos — Ni totems, ni tabous" width="600" height="214"></picture>
      <picture class="aq-logo--dark"><source media="(max-width: 575.98px)" :srcset="asset('assets/img/logo-compact-negatif.png')" width="600" height="158"><img :src="asset('assets/img/logo-afriquinfos-negatif.png')" alt="Afriquinfos — Ni totems, ni tabous" width="600" height="214" loading="lazy"></picture>
    </Link>
    <form class="aq-searchbar d-none d-lg-block" action="/recherche" role="search"><i class="bi bi-search" aria-hidden="true"></i>
      <label class="visually-hidden" for="hq">Rechercher</label><input id="hq" name="q" type="search" placeholder="Rechercher une actualité, un pays, un sujet…"></form>
    <a class="aq-btn aq-btn--primary aq-head__cta d-none d-lg-inline-flex" href="/#newsletter"><i class="bi bi-envelope" aria-hidden="true"></i>Recevoir le brief</a>
    <Link class="aq-icon d-lg-none" href="/recherche" aria-label="Rechercher"><i class="bi bi-search" aria-hidden="true"></i></Link>
  </div></header>

  <nav class="aq-mainnav" id="mainNav" aria-label="Rubriques"><div class="container-xl">
    <Link class="aq-mainnav__mini" href="/" aria-label="Afriquinfos, accueil"><img :src="asset('assets/img/logo-compact-negatif.png')" alt="" width="600" height="158" loading="lazy"></Link>
    <ul class="aq-menu d-none d-lg-flex">
      <li v-for="r in menuRubs" :key="r.slug"><Link :href="urlRub(r.slug)" :aria-current="cur(r.slug)">{{ r.label }}</Link></li>
      <li class="dropdown"><a href="/afriques" class="dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" role="button" :aria-current="cur('afriques')">Les Afriques <i class="bi bi-chevron-down" aria-hidden="true"></i></a>
        <ul class="dropdown-menu aq-dropdown"><li><a class="dropdown-item dropdown-item--all" href="/afriques">Toutes les Afriques</a></li>
          <li v-for="g in nav?.regions || []" :key="g.slug"><a class="dropdown-item" :href="urlRegion(g.slug)" :aria-current="url === urlRegion(g.slug) ? 'page' : null">{{ g.label }}</a></li></ul></li>
      <li><Link href="/rubrique/tips" :aria-current="cur('tips')">Tips</Link></li>
    </ul>
    <div class="aq-menu-scroll d-lg-none">
      <Link v-for="r in menuRubs" :key="r.slug" :href="urlRub(r.slug)" :aria-current="cur(r.slug)">{{ r.label }}</Link>
      <Link href="/afriques" :aria-current="cur('afriques')">Les Afriques</Link><Link href="/rubrique/tips">Tips</Link><Link href="/portraits">Portraits</Link>
    </div>
    <div class="aq-mainnav__tools ms-auto"><Link class="aq-icon aq-icon--light aq-mainnav__search" href="/recherche" aria-label="Rechercher"><i class="bi bi-search" aria-hidden="true"></i></Link></div>
  </div></nav>

  <div class="offcanvas offcanvas-start aq-offcanvas" tabindex="-1" id="menu" aria-labelledby="menuTitre"><div class="offcanvas-header">
    <h2 class="visually-hidden" id="menuTitre">Menu</h2><img :src="asset('assets/img/logo-compact-negatif.png')" alt="Afriquinfos" width="129" height="34" loading="lazy">
    <button type="button" class="aq-icon aq-icon--light" data-bs-dismiss="offcanvas" aria-label="Fermer le menu"><i class="bi bi-x-lg" aria-hidden="true"></i></button></div>
    <div class="offcanvas-body"><form class="aq-searchbar mb-3" action="/recherche" role="search"><i class="bi bi-search" aria-hidden="true"></i><label class="visually-hidden" for="mq">Rechercher</label><input id="mq" name="q" type="search" placeholder="Rechercher…"></form>
    <nav class="aq-offcanvas__nav" aria-label="Rubriques">
      <Link v-for="r in menuRubs" :key="r.slug" :href="urlRub(r.slug)">{{ r.label }}</Link>
      <Link href="/afriques">Les Afriques</Link>
      <Link v-for="g in nav?.regions || []" :key="g.slug" class="is-sub" :href="urlRegion(g.slug)">{{ g.label }}</Link>
      <Link href="/rubrique/tips">Tips</Link></nav>
    <p class="aq-offcanvas__label">Afriquinfos</p><nav class="aq-offcanvas__nav" aria-label="Liens utiles"><Link class="is-sub" href="/portraits">Portraits</Link><Link class="is-sub" href="/agendas">Agendas</Link><Link class="is-sub" href="/contact">Contact</Link><a class="is-sub" href="/rss.xml">Flux RSS</a></nav>
    <div class="aq-social mt-4" v-html="social"></div></div></div>

  <main id="contenu" tabindex="-1"><slot /></main>

  <footer class="aq-footer"><div class="container-xl"><div class="aq-footer__top">
    <img :src="asset('assets/img/logo-afriquinfos-negatif.png')" alt="Afriquinfos — Ni totems, ni tabous. L’actualité panafricaine" width="600" height="214" loading="lazy">
    <div class="aq-social"><a href="https://www.facebook.com/afriquinfoscom/" aria-label="Afriquinfos sur Facebook" rel="noopener"><i class="bi bi-facebook" aria-hidden="true"></i></a><a href="https://x.com/AfriquinfosActu" aria-label="Afriquinfos sur X" rel="noopener"><i class="bi bi-twitter-x" aria-hidden="true"></i></a><a href="/rss.xml" aria-label="Flux RSS"><i class="bi bi-rss" aria-hidden="true"></i></a></div></div>
    <div class="row g-4">
      <nav class="col-6 col-md-3" aria-label="Rubriques"><h2>Rubriques</h2><Link v-for="r in nav?.rubriques || []" :key="r.slug" :href="urlRub(r.slug)">{{ r.label }}</Link></nav>
      <nav class="col-6 col-md-3" aria-label="Les Afriques"><h2>Les Afriques</h2><Link v-for="g in nav?.regions || []" :key="g.slug" :href="urlRegion(g.slug)">{{ g.label }}</Link></nav>
      <nav class="col-6 col-md-3" aria-label="Afriquinfos"><h2>Afriquinfos</h2><Link href="/portraits">Portraits</Link><Link href="/agendas">Agendas</Link><Link href="/contact">Contact</Link><a href="/rss.xml">Flux RSS</a></nav>
      <nav class="col-6 col-md-3" aria-label="Annonceurs"><h2>Annonceurs</h2><Link href="/contact?sujet=publicite">Kit média</Link><Link href="/contact?sujet=publicite">Publicité</Link><Link href="/contact?sujet=publicite">Contenus de marque</Link></nav>
    </div><div class="aq-footer__bottom"><span>© {{ year }} Afriquinfos. Tous droits réservés.</span><span><Link href="/mentions-legales">Mentions légales</Link><Link href="/confidentialite">Confidentialité</Link><Link href="/cookies">Cookies</Link></span></div></div>
  </footer>

  <div v-if="!consent" class="aq-consent" role="dialog" aria-label="Consentement aux cookies" aria-describedby="aqConsentTxt">
    <div class="aq-consent__txt"><i class="bi bi-cookie" aria-hidden="true"></i><p id="aqConsentTxt">Afriquinfos utilise des cookies pour assurer le fonctionnement du site, mémoriser vos préférences et mesurer l’audience. <Link href="/cookies">En savoir plus</Link></p></div>
    <div class="aq-consent__btns">
      <button type="button" class="aq-consent__btn aq-consent__btn--ghost" @click="setConsent('none')">Tout refuser</button>
      <button type="button" class="aq-consent__btn aq-consent__btn--accept" @click="setConsent('all')">Tout accepter</button>
    </div>
  </div>

  <button class="aq-totop" type="button" :class="{ 'is-on': showTop }" aria-label="Retour en haut de page" title="Retour en haut" @click="toTop">
    <i class="bi bi-arrow-up" aria-hidden="true"></i>
  </button>
</template>

<style scoped>
.aq-totop {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 1040;
  width: 2.75rem;
  height: 2.75rem;
  border: 0;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 1.125rem;
  color: #fff;
  background: var(--orange, #de5011);
  box-shadow: 0 6px 18px rgba(0, 0, 0, .25);
  opacity: 0;
  visibility: hidden;
  transform: translateY(.75rem);
  transition: opacity .25s ease, transform .25s ease, visibility .25s;
  cursor: pointer;
}
.aq-totop.is-on { opacity: 1; visibility: visible; transform: none; }
.aq-totop:hover { background: var(--orange-600, #c44310); }
.aq-totop:focus-visible { outline: 3px solid rgba(222, 80, 17, .4); outline-offset: 2px; }
@media (prefers-reduced-motion: reduce) { .aq-totop { transition: none; } }

.aq-consent {
  position: fixed;
  left: 1rem;
  right: 1rem;
  bottom: 1rem;
  z-index: 1050;
  margin-inline: auto;
  max-width: 60rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: .75rem 1.25rem;
  padding: .9rem 1.15rem;
  background: #1a1918;
  color: #f4f1ec;
  border-radius: .75rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, .35);
  animation: consent-in .35s ease;
}
@keyframes consent-in { from { opacity: 0; transform: translateY(.75rem); } }
.aq-consent__txt { display: flex; align-items: flex-start; gap: .65rem; flex: 1 1 24rem; font-size: .8125rem; line-height: 1.45; }
.aq-consent__txt i { font-size: 1.4rem; color: var(--orange, #de5011); flex-shrink: 0; margin-top: .1rem; }
.aq-consent__txt p { margin: 0; }
.aq-consent__txt a { color: var(--orange, #de5011); text-decoration: underline; }
.aq-consent__btns { display: flex; gap: .5rem; flex-shrink: 0; margin-left: auto; }
.aq-consent__btn { border: 0; border-radius: .45rem; padding: .5rem 1rem; font-size: .8125rem; font-weight: 600; cursor: pointer; transition: background .15s ease; }
.aq-consent__btn--accept { background: var(--orange, #de5011); color: #fff; }
.aq-consent__btn--accept:hover { background: var(--orange-600, #c44310); }
.aq-consent__btn--ghost { background: transparent; color: #f4f1ec; border: 1px solid rgba(255, 255, 255, .3); }
.aq-consent__btn--ghost:hover { border-color: #f4f1ec; }
@media (max-width: 575.98px) {
  .aq-consent { flex-direction: column; align-items: stretch; }
  .aq-consent__btns { margin-left: 0; }
  .aq-consent__btn { flex: 1; }
}
@media (prefers-reduced-motion: reduce) { .aq-consent { animation: none; } }
</style>
