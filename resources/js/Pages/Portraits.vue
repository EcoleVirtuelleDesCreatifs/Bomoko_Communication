<script setup>
import { computed, ref } from 'vue';
import { Link, usePage } from '@inertiajs/vue3';
import AqMedia from '../Components/AqMedia.vue';
import ChapterHead from '../Components/ChapterHead.vue';
import Crumbs from '../Components/Crumbs.vue';
import Newsletter from '../Components/Newsletter.vue';
import { fr } from '../utils';

const props = defineProps({
    articles: { type: Array, default: () => [] },
    tagline: { type: String, default: '' },
});

const regions = usePage().props.nav?.regions || [];
const regionLabels = Object.fromEntries(regions.map((r) => [r.slug, r.label]));

const used = computed(() => {
    const seen = [];
    props.articles.forEach((a) => { if (a.region && !seen.includes(a.region)) seen.push(a.region); });
    return seen;
});
const filter = ref('all');
const list = computed(() => filter.value === 'all' ? props.articles : props.articles.filter((a) => a.region === filter.value));
</script>

<template>
  <div class="aq-pagehero"><div class="container-xl">
    <Crumbs :items="[{ label: 'Portraits' }]" />
    <ChapterHead title="Portraits" :tagline="tagline" :level="1" />
  </div></div>
  <div class="container-xl aq-page-head">
    <div class="aq-filters" role="group" aria-label="Filtrer par région">
      <button type="button" :aria-pressed="filter === 'all'" @click="filter = 'all'">Tous<small>{{ articles.length }}</small></button>
      <button v-for="g in used" :key="g" type="button" :aria-pressed="filter === g" @click="filter = g">{{ regionLabels[g] }}<small>{{ articles.filter(a => a.region === g).length }}</small></button>
    </div>
    <div class="row g-4 mb-5" aria-live="polite">
      <article v-for="a in list" :key="a.id" class="aq-portrait col-sm-6 col-lg-3 aq-fade"><Link :href="a.url">
        <div class="aq-portrait__visual"><AqMedia :a="a" /></div>
        <h3 class="aq-portrait__name">{{ a.person?.name }}</h3>
        <p class="aq-portrait__role">{{ fr((a.person?.role || '') + ', ' + (a.person?.city || '') + ' (' + a.country + ')') }}</p>
        <p class="aq-portrait__chapo">{{ fr(a.chapo) }}</p></Link></article>
    </div>
  </div>
  <Newsletter />
</template>
