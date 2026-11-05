<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Link, usePage } from '@inertiajs/vue3';
import AqAd from '../Components/AqAd.vue';
import AqMedia from '../Components/AqMedia.vue';
import AqSkin from '../Components/AqSkin.vue';
import ArticleCard from '../Components/ArticleCard.vue';
import ChapterHead from '../Components/ChapterHead.vue';
import EventItem from '../Components/EventItem.vue';
import FlashBar from '../Components/FlashBar.vue';
import Newsletter from '../Components/Newsletter.vue';
import { fr, initials, kicker, reduceMotion, rel, store } from '../utils';

const props = defineProps({
    articles: { type: Array, required: true },
    flashes: { type: Array, default: () => [] },
    events: { type: Array, default: () => [] },
    debate: { type: Object, default: null },
});

const sorted = computed(() => [...props.articles].sort((a, b) => b.date.localeCompare(a.date)));
const byRub = (r) => sorted.value.filter((a) => a.rub === r);
const byRegion = (g) => sorted.value.filter((a) => a.region === g);

// À la une
const slides = computed(() => sorted.value.filter((a) => a.une).slice(0, 4));
const fil = computed(() => sorted.value.filter((a) => !slides.value.includes(a) && a.rub !== 'portraits').slice(0, 4));
// Flash info : 3 items par visite, priorité à ceux jamais vus (rotation mémorisée)
const FLASH_N = 3;
const flashAll = computed(() => props.flashes);
const flash = ref(flashAll.value.slice(0, FLASH_N));

const seen = computed(() => [...slides.value, ...fil.value]);
function pick(list, n) {
    const fresh = list.filter((a) => !seen.value.includes(a));
    let out = fresh.slice(0, n);
    if (out.length < n) out = out.concat(list.filter((a) => !out.includes(a)).slice(0, n - out.length));
    out.forEach((a) => { if (!seen.value.includes(a)) seen.value.push(a); });
    return out;
}
const afr = computed(() => pick(sorted.value.filter((a) => a.region && a.rub !== 'portraits'), 6));
const pol = computed(() => pick(byRub('politique'), 5));
const eco = computed(() => pick(byRub('economie'), 5));
const soc = computed(() => pick(byRub('societe'), 3));
const cul = computed(() => pick(byRub('culture'), 6));
const spo = computed(() => pick(byRub('sports'), 5));
const opi = computed(() => byRub('opinion'));
const tips = computed(() => byRub('tips'));
const por = computed(() => byRub('portraits'));

const regions = usePage().props.nav?.regions || [];

// Filtre régions accueil
const regionFilter = ref('all');
const regionList = computed(() => {
    const l = regionFilter.value === 'all'
        ? afr.value
        : byRegion(regionFilter.value).filter((a) => a.rub !== 'portraits');
    return l.slice(0, 6);
});

// Slider — navigation manuelle uniquement (pas de défilement automatique)
const cur = ref(0);
const progress = ref([]);

function go(n) {
    if (!slides.value.length) return;
    cur.value = ((n % slides.value.length) + slides.value.length) % slides.value.length;
    progress.value = slides.value.map((_, k) => (k === cur.value ? 1 : 0));
}

onMounted(() => {
    // Choisit 3 flashs non encore vus par ce visiteur ; repart à zéro quand tout a été vu
    try {
        let seenIds = JSON.parse(store('aq-flash-seen') || '[]');
        let unseen = flashAll.value.filter((f) => !seenIds.includes(f.id));
        if (unseen.length < FLASH_N) { seenIds = []; unseen = flashAll.value; }
        const pickFlash = unseen.slice(0, FLASH_N);
        store('aq-flash-seen', JSON.stringify(seenIds.concat(pickFlash.map((f) => f.id))));
        flash.value = pickFlash;
    } catch (e) {}
    progress.value = slides.value.map((_, k) => (k === 0 ? 1 : 0));
    const rail = document.getElementById('cultureRail');
    if (rail) checkRail();
    window.addEventListener('resize', checkRail);
});
onBeforeUnmount(() => window.removeEventListener('resize', checkRail));

const railNav = ref(false);
function checkRail() {
    const rail = document.getElementById('cultureRail');
    railNav.value = rail ? rail.scrollWidth > rail.clientWidth + 4 : false;
}
function railScroll(dir) {
    const rail = document.getElementById('cultureRail');
    if (!rail) return;
    const item = rail.firstElementChild;
    const step = item ? item.getBoundingClientRect().width + 20 : 280;
    rail.scrollBy({ left: step * dir, behavior: reduceMotion ? 'auto' : 'smooth' });
}

function sliderKey(e) {
    if (e.key === 'ArrowRight') { go(cur.value + 1, true); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { go(cur.value - 1, true); e.preventDefault(); }
}
let x0 = null;
function pdown(e) { x0 = e.clientX; }
function pup(e) {
    if (x0 === null) return;
    const dx = e.clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) go(cur.value + (dx < 0 ? 1 : -1), true);
}

// Sondage débat
const voted = ref(props.debate?.voted || null);
const voting = ref(false);
const voteError = ref('');
const counts = ref(props.debate?.base || null);
watch(() => props.debate, (debate) => { counts.value = debate?.base || null; voted.value = debate?.voted || null; voteError.value = ''; });
const poll = computed(() => {
    if (!counts.value) return null;
    const pour = Number(counts.value.pour), contre = Number(counts.value.contre), total = pour + contre;
    const pctP = total ? Math.round((pour / total) * 100) : 0;
    return { pour, contre, total, pctP, pctC: total ? 100 - pctP : 0 };
});
const pollLabel = computed(() => poll.value ? poll.value.pctP + ' % pour, ' + poll.value.pctC + ' % contre' : '');
async function vote(side) {
    if (!props.debate?.open || voted.value || voting.value) return;
    voting.value = true; voteError.value = '';
    try {
        const response = await fetch('/debat/' + props.debate.id + '/vote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'X-XSRF-TOKEN': decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || '') },
            body: JSON.stringify({ side }), credentials: 'same-origin',
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Le vote n’a pas été enregistré.');
        counts.value = { pour: data.pour, contre: data.contre }; voted.value = data.side;
    } catch (error) { voteError.value = error.message; }
    finally { voting.value = false; }
}

const two = (n) => (n < 10 ? '0' + n : String(n));
</script>

<template>
  <FlashBar :items="flashAll" />
  <AqSkin />
  <h1 class="visually-hidden">Afriquinfos, l’actualité panafricaine</h1>
  <div class="aq-hero">
    <section v-if="slides.length" class="aq-slider" aria-roledescription="carrousel" aria-label="À la une" @keydown="sliderKey"><div class="container-xl">
      <div class="aq-slider__stage" aria-live="off" @pointerdown="pdown" @pointerup="pup">
        <article v-for="(a, i) in slides" :key="a.id" class="aq-slide" :class="{ 'is-active': i === cur }" :id="'slide-' + i" role="group" aria-roledescription="diapositive" :aria-label="(i + 1) + ' sur ' + slides.length" :aria-hidden="i === cur ? null : 'true'">
          <Link class="aq-slide__media" :href="a.url" tabindex="-1" aria-hidden="true"><AqMedia :a="a" :priority="i === 0" sizes="(min-width: 992px) 58vw, 100vw" /></Link>
          <div class="aq-slide__text">
            <span class="aq-slide__kicker">{{ fr(kicker(a, 'rub')) }}</span>
            <h2 class="aq-slide__title"><Link :href="a.url" :tabindex="i === cur ? null : '-1'">{{ fr(a.title) }}</Link></h2>
            <p class="aq-slide__chapo">{{ fr(a.chapo) }}</p>
            <p class="aq-slide__meta">Par {{ a.author }}, {{ rel(a.date) }}, {{ a.read }} min de lecture</p>
            <Link class="aq-slide__cta" :href="a.url" :tabindex="i === cur ? null : '-1'">Lire l’article</Link>
          </div>
        </article>
      </div>
      <div class="aq-slider__nav">
        <div class="aq-slider__tabs" role="tablist" aria-label="Articles à la une">
          <button v-for="(a, i) in slides" :key="a.id" type="button" role="tab" class="aq-slider__tab" :aria-controls="'slide-' + i" :aria-selected="i === cur" @click="go(i, true)">
            <span class="aq-slider__progress" aria-hidden="true" :style="{ '--p': progress[i] || 0 }"></span>
            <small><b>{{ two(i + 1) }}</b>{{ a.rub_label }}</small><span class="aq-slider__tabtitle">{{ fr(a.title) }}</span>
          </button>
        </div>
        <div class="aq-slider__btns">
          <button type="button" class="aq-slider__btn" aria-label="Article précédent" @click="go(cur - 1)"><i class="bi bi-arrow-left" aria-hidden="true"></i></button>
          <button type="button" class="aq-slider__btn" aria-label="Article suivant" @click="go(cur + 1)"><i class="bi bi-arrow-right" aria-hidden="true"></i></button>
        </div>
      </div>
    </div></section>
  </div>

  <section class="aq-section aq-section--white aq-section--fil" aria-labelledby="filTitre"><div class="container-xl"><div class="aq-filrow">
    <h2 class="aq-filrow__title" id="filTitre"><span class="aq-live" aria-hidden="true"></span>Le fil</h2>
    <ol class="aq-filrow__list">
      <li v-for="a in fil" :key="a.id"><Link :href="a.url"><span class="aq-filrow__meta"><time :datetime="a.date">{{ rel(a.date) }}</time>{{ a.rub_label }}</span><strong>{{ fr(a.title) }}</strong></Link></li>
    </ol>
  </div></div></section>

  <section class="aq-section aq-section--white" id="afriques" aria-labelledby="h-afriques"><div class="container-xl">
    <ChapterHead id="afriques" title="Les Afriques" tagline="Toutes les Afriques, sans détour" href="/afriques" />
    <div class="aq-filters" role="group" aria-label="Filtrer par région">
      <button type="button" :aria-pressed="regionFilter === 'all'" @click="regionFilter = 'all'">Toutes</button>
      <button v-for="g in regions" :key="g.slug" type="button" :aria-pressed="regionFilter === g.slug" @click="regionFilter = g.slug">{{ g.label }}</button>
    </div>
    <div class="row g-4 g-xl-5" aria-live="polite">
      <ArticleCard v-for="a in regionList" :key="a.id" :a="a" col="col-md-6 col-xl-4 aq-fade" kicker-mode="rub" />
      <p v-if="!regionList.length" class="aq-empty">Aucun article récent pour cette région.</p>
    </div>
  </div></section>

  <section class="aq-section aq-section--white" id="politique" aria-labelledby="h-politique"><div class="container-xl" v-if="pol.length">
    <ChapterHead id="politique" title="Politique" tagline="Les arcanes de la politique africaine" href="/rubrique/politique" more="Toute la rubrique" />
    <div class="row g-5">
      <article class="col-lg-7 aq-lead"><Link :href="pol[0].url">
        <div class="aq-media aq-media--cut aq-media--wide"><AqMedia :a="pol[0]" /></div>
        <span class="aq-card__place">{{ fr(kicker(pol[0])) }}</span><h3 class="aq-lead__title">{{ fr(pol[0].title) }}</h3><p class="aq-lead__text">{{ fr(pol[0].chapo) }}</p></Link></article>
      <div class="col-lg-5 aq-stack">
        <Link v-for="a in pol.slice(1, 5)" :key="a.id" class="aq-stack__item" :href="a.url"><span class="aq-card__place">{{ fr(kicker(a)) }}</span><h3>{{ fr(a.title) }}</h3><time class="aq-card__meta">{{ rel(a.date) }}</time></Link>
      </div>
    </div>
  </div></section>

  <div class="container-xl"><AqAd slot="billboard" variant="billboard" /></div>

  <section class="aq-section aq-section--ink" id="economie" aria-labelledby="h-economie"><div class="container-xl" v-if="eco.length">
    <ChapterHead id="economie" title="Économie" tagline="L’information économique panafricaine de référence" href="/rubrique/economie" more="Toute la rubrique" />
    <div class="row g-5">
      <article class="col-lg-6 aq-lead"><Link :href="eco[0].url">
        <div class="aq-media aq-media--cut aq-media--wide"><AqMedia :a="eco[0]" /></div>
        <span class="aq-card__place">{{ fr(eco[0].country) }}</span><h3 class="aq-lead__title">{{ fr(eco[0].title) }}</h3><p class="aq-lead__text">{{ fr(eco[0].chapo) }}</p></Link></article>
      <div class="col-lg-6 aq-hlist"><ArticleCard v-for="a in eco.slice(1, 5)" :key="a.id" :a="a" h /></div>
    </div>
  </div></section>

  <section class="aq-section aq-section--white aq-below" id="societe" aria-labelledby="h-societe"><div class="container-xl">
    <ChapterHead id="societe" title="Société" tagline="La société africaine en mouvement" href="/rubrique/societe" more="Toute la rubrique" />
    <div class="row g-4 g-xl-5"><ArticleCard v-for="a in soc.slice(0, 3)" :key="a.id" :a="a" col="col-md-4" /></div>
  </div></section>

  <section class="aq-section aq-section--white aq-below" id="culture" aria-labelledby="h-culture"><div class="container-xl">
    <ChapterHead id="culture" title="Culture" tagline="Vivez au rythme de la culture africaine" href="/rubrique/culture" more="Toute la rubrique" />
    <div class="aq-rail-x" id="cultureRail" tabindex="0" aria-label="Articles culture">
      <Link v-for="a in cul" :key="a.id" class="aq-poster" :href="a.url"><AqMedia :a="a" /><span class="aq-poster__kind">{{ fr(a.country) }}</span><h3>{{ fr(a.title) }}</h3></Link>
    </div>
    <div class="aq-rail-x__nav" v-if="railNav">
      <button type="button" class="aq-icon aq-icon--outline" aria-label="Précédent" @click="railScroll(-1)"><i class="bi bi-arrow-left" aria-hidden="true"></i></button>
      <button type="button" class="aq-icon aq-icon--outline" aria-label="Suivant" @click="railScroll(1)"><i class="bi bi-arrow-right" aria-hidden="true"></i></button>
    </div>
  </div></section>

  <section class="aq-section aq-section--white aq-below" id="sports" aria-labelledby="h-sports"><div class="container-xl" v-if="spo.length">
    <ChapterHead id="sports" title="Sports" tagline="La passion du sport africain est contagieuse" href="/rubrique/sports" more="Toute la rubrique" />
    <div class="row g-5">
      <article class="col-lg-7 aq-lead"><Link :href="spo[0].url">
        <div class="aq-media aq-media--cut aq-media--wide"><AqMedia :a="spo[0]" /></div>
        <span class="aq-card__place">{{ fr(spo[0].country) }}</span><h3 class="aq-lead__title">{{ fr(spo[0].title) }}</h3><p class="aq-lead__text">{{ fr(spo[0].chapo) }}</p></Link></article>
      <div class="col-lg-5 aq-stack">
        <Link v-for="a in spo.slice(1, 5)" :key="a.id" class="aq-stack__item" :href="a.url"><span class="aq-card__place">{{ fr(a.country) }}</span><h3>{{ fr(a.title) }}</h3><time class="aq-card__meta">{{ rel(a.date) }}</time></Link>
      </div>
    </div>
  </div></section>

  <section class="aq-section aq-section--stone aq-below" id="portraits" aria-labelledby="h-portraits"><div class="container-xl">
    <ChapterHead id="portraits" title="Portraits" tagline="Celles et ceux qui font l’Afrique d’aujourd’hui" href="/portraits" />
    <div class="row g-4">
      <article v-for="a in por.slice(0, 4)" :key="a.id" class="aq-portrait col-sm-6 col-lg-3"><Link :href="a.url">
        <div class="aq-portrait__visual"><AqMedia :a="a" /></div>
        <h3 class="aq-portrait__name">{{ a.person?.name }}</h3>
        <p class="aq-portrait__role">{{ fr((a.person?.role || '') + ', ' + (a.person?.city || '') + ' (' + a.country + ')') }}</p>
        <p class="aq-portrait__chapo">{{ fr(a.chapo) }}</p></Link></article>
    </div>
  </div></section>

  <section class="aq-section aq-section--orange aq-below" id="opinion" aria-labelledby="h-opinion"><div class="container-xl">
    <ChapterHead id="opinion" title="Opinion/Tribune" tagline="Afriquinfos vous invite au débat" href="/rubrique/opinion" more="Toutes les tribunes" />
    <div class="aq-debate" v-if="debate">
      <p class="aq-debate__q">Le débat de la semaine</p><h3 class="aq-debate__title">{{ fr(debate.question) }}</h3>
      <div class="aq-debate__sides">
        <article class="aq-side"><span class="aq-side__label">Pour</span><blockquote>« {{ fr(debate.pour.text) }} »</blockquote><p class="aq-side__who">{{ fr(debate.pour.who) }}</p></article>
        <article class="aq-side"><span class="aq-side__label">Contre</span><blockquote>« {{ fr(debate.contre.text) }} »</blockquote><p class="aq-side__who">{{ fr(debate.contre.who) }}</p></article>
      </div>
      <div class="aq-poll"><p class="aq-poll__ask">Et vous, qu’en pensez-vous ?</p>
        <div class="aq-poll__buttons">
          <button type="button" class="aq-btn aq-btn--ink" :aria-pressed="voted === 'pour'" :disabled="voting || !!voted || !debate.open" @click="vote('pour')">Je suis pour</button>
          <button type="button" class="aq-btn aq-btn--outline" :aria-pressed="voted === 'contre'" :disabled="voting || !!voted || !debate.open" @click="vote('contre')">Je suis contre</button>
        </div>
        <p v-if="voteError" role="alert">{{ voteError }}</p>
        <p v-if="!debate.open" class="aq-poll__thanks">Ce débat est fermé aux votes.</p>
        <div v-if="(voted || !debate.open) && poll">
          <div class="aq-poll__bar" role="img" :aria-label="pollLabel"><span class="aq-poll__pour" :style="{ width: poll.pctP + '%' }"></span><span class="aq-poll__contre" :style="{ width: poll.pctC + '%' }"></span></div>
          <p class="aq-poll__legend"><b>{{ poll.pctP }} %</b> pour, <b>{{ poll.pctC }} %</b> contre, <b>{{ poll.total }}</b> votes</p>
          <p v-if="voted" class="aq-poll__thanks" role="status">Vote confirmé : vous êtes {{ voted }}. Un vote par navigateur et par débat.</p>
        </div>
      </div>
    </div>
    <div class="row g-4">
      <article v-for="a in opi.slice(0, 3)" :key="a.id" class="col-md-4 aq-tribune"><Link :href="a.url">
        <span class="aq-avatar" aria-hidden="true">{{ initials(a.author) }}</span><h3>{{ fr(a.title) }}</h3><p>{{ fr(a.author) }}</p></Link></article>
    </div>
  </div></section>

  <section class="aq-section aq-section--white aq-below" id="tips" aria-labelledby="h-tips"><div class="container-xl">
    <ChapterHead id="tips" title="Tips" tagline="Conseils pratiques pour voyager, entreprendre et mieux vivre" href="/rubrique/tips" more="Tout voir" />
    <div class="row g-4 g-xl-5">
      <article v-for="a in tips.slice(0, 3)" :key="a.id" class="col-md-4 aq-tip"><Link :href="a.url">
        <i class="bi" :class="a.icon || 'bi-lightbulb'" aria-hidden="true"></i><h3>{{ fr(a.title) }}</h3><p>{{ fr(a.chapo) }}</p></Link></article>
    </div>
  </div></section>

  <section class="aq-section aq-section--white aq-below" id="agenda" aria-labelledby="h-agenda"><div class="container-xl">
    <ChapterHead id="agenda" title="Agenda" tagline="Les rendez-vous à ne pas manquer" href="/agendas" more="Tout l’agenda" />
    <div class="aq-agenda-row" v-if="events.length"><EventItem v-for="e in events.slice(0, 3)" :key="e.slug" :e="e" /></div>
    <p v-else class="aq-empty">Aucun événement à venir pour le moment.</p>
  </div></section>

  <Newsletter />
</template>

<style scoped>
#cultureRail { grid-auto-columns: min(78%, 280px); justify-content: start; }
#cultureRail .aq-poster { min-width: 0; }
#cultureRail .aq-poster :deep(img) { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; }
@media (min-width: 992px) {
  #cultureRail { grid-auto-columns: 360px; }
  #cultureRail .aq-poster { width: 360px; height: 225px; aspect-ratio: 8 / 5; }
  #cultureRail .aq-poster__kind { right: 1.25rem; width: fit-content; max-width: calc(100% - 2.5rem); }
}
</style>
