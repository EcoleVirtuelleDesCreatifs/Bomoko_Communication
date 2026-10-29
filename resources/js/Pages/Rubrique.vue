<script setup>
import { computed, ref } from 'vue';
import { Link, usePage } from '@inertiajs/vue3';
import AqMedia from '../Components/AqMedia.vue';
import ArticleCard from '../Components/ArticleCard.vue';
import ChapterHead from '../Components/ChapterHead.vue';
import Crumbs from '../Components/Crumbs.vue';
import FlashBar from '../Components/FlashBar.vue';
import Newsletter from '../Components/Newsletter.vue';
import { fr, kicker, rel } from '../utils';

const props = defineProps({
    mode: { type: String, required: true }, // rubrique | region | afriques
    slug: { type: String, required: true },
    title: { type: String, required: true },
    tagline: { type: String, default: '' },
    articles: { type: Array, default: () => [] },
    top: { type: Array, default: () => [] },
});

const nav = usePage().props.nav;
const rubLabels = Object.fromEntries((nav?.rubriques || []).map((r) => [r.slug, r.label]));
rubLabels.portraits = 'Portraits';
const regionLabels = Object.fromEntries((nav?.regions || []).map((r) => [r.slug, r.label]));

const crumb = computed(() => {
    if (props.mode === 'region') return [{ label: 'Les Afriques', href: '/afriques' }, { label: props.title }];
    return [{ label: props.title }];
});
const flash = computed(() => props.articles.slice(0, 5).map((a) => ({ text: a.title, url: a.url })));

// Filtres : par région pour une rubrique, par rubrique pour une région/afriques
const filterKey = computed(() => (props.mode === 'rubrique' ? 'region' : 'rub'));
const filterLabel = (v) => (filterKey.value === 'region' ? regionLabels[v] : rubLabels[v]) || v;
const chips = computed(() => {
    const seen = [];
    props.articles.forEach((a) => { const v = a[filterKey.value]; if (v && !seen.includes(v)) seen.push(v); });
    return seen.map((v) => ({ value: v, label: filterLabel(v), count: props.articles.filter((a) => a[filterKey.value] === v).length }));
});

const filter = ref('all');
const shown = ref(0);
const PAGE_SIZE = 6;
const current = computed(() => filter.value === 'all' ? props.articles : props.articles.filter((a) => a[filterKey.value] === filter.value));
const lead = computed(() => current.value[0]);
const grid = computed(() => current.value.slice(1, 1 + shown.value + PAGE_SIZE));
const moreLeft = computed(() => current.value.length - 1 > grid.value.length);
function pickFilter(v) { filter.value = v; shown.value = 0; }
function loadMore() { shown.value += PAGE_SIZE; }

const top5 = computed(() => (props.articles.length >= 3 ? props.articles : props.top).slice().sort((a, b) => b.views - a.views).slice(0, 5));
const kickerMode = computed(() => (props.mode === 'rubrique' ? null : 'rub'));
</script>

<template>
  <FlashBar v-if="slug !== 'tips'" :items="flash" />
  <div class="aq-pagehero"><div class="container-xl">
    <Crumbs :items="crumb" />
    <ChapterHead :title="title" :tagline="tagline" :level="1" />
  </div></div>
  <div class="container-xl"><div class="row g-5"><div class="col-lg-8">
    <div v-if="chips.length > 1" class="aq-filters" role="group" aria-label="Filtrer">
      <button type="button" :aria-pressed="filter === 'all'" @click="pickFilter('all')">Tout<small>{{ articles.length }}</small></button>
      <button v-for="c in chips" :key="c.value" type="button" :aria-pressed="filter === c.value" @click="pickFilter(c.value)">{{ c.label }}<small>{{ c.count }}</small></button>
    </div>
    <article v-if="lead" class="aq-lead aq-fade"><Link :href="lead.url">
      <div class="aq-media aq-media--cut aq-media--wide"><AqMedia :a="lead" /></div>
      <span class="aq-card__place mt-3">{{ fr(kicker(lead, kickerMode)) }}</span>
      <h2 class="aq-lead__title mt-1">{{ fr(lead.title) }}</h2>
      <p class="aq-lead__text">{{ fr(lead.chapo) }}</p></Link></article>
    <p v-else class="aq-empty">Aucun article pour ce filtre. Choisissez « Tout » pour tout afficher.</p>
    <div class="row g-4 mt-1" aria-live="polite">
      <ArticleCard v-for="a in grid" :key="a.id" :a="a" col="col-md-6 aq-fade" :kicker-mode="kickerMode" />
    </div>
    <div class="aq-loadmore"><button v-if="moreLeft" type="button" class="aq-btn aq-btn--outline" @click="loadMore">Afficher plus d’articles</button></div>
  </div>
  <aside class="col-lg-4"><div class="aq-sticky"><div class="aq-side-box"><h2>Les plus lus</h2>
    <ol class="aq-top5"><li v-for="a in top5" :key="a.id"><Link :href="a.url"><span>{{ fr(a.title) }}</span></Link></li></ol>
  </div>
  <div class="aq-ad aq-ad--pave mb-4" role="complementary" aria-label="Publicité"><span>Publicité</span><b>300 × 250</b></div></div></aside>
  </div></div>
  <Newsletter />
</template>
