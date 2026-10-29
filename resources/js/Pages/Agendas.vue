<script setup>
import { computed, ref } from 'vue';
import { Link } from '@inertiajs/vue3';
import ChapterHead from '../Components/ChapterHead.vue';
import Crumbs from '../Components/Crumbs.vue';
import EventItem from '../Components/EventItem.vue';
import { evMonthLong } from '../utils';

const props = defineProps({ events: { type: Array, default: () => [] } });

const cats = computed(() => [...new Set(props.events.map((e) => e.cat).filter(Boolean))]);
const filter = ref('all');
const list = computed(() => filter.value === 'all' ? props.events : props.events.filter((e) => e.cat === filter.value));
const grouped = computed(() => {
    const out = [];
    let month = null;
    list.value.forEach((e) => {
        const m = evMonthLong(e);
        if (m !== month) { out.push({ month: m, events: [e] }); month = m; }
        else out[out.length - 1].events.push(e);
    });
    return out;
});
</script>

<template>
  <div class="container-xl aq-page-head">
    <Crumbs :items="[{ label: 'Agendas' }]" />
    <ChapterHead title="Agendas" tagline="Les rendez-vous à ne pas manquer sur le continent" :level="1" />
    <div class="row g-5 mb-5"><div class="col-lg-8">
      <div class="aq-filters" role="group" aria-label="Filtrer par thème">
        <button type="button" :aria-pressed="filter === 'all'" @click="filter = 'all'">Tous<small>{{ events.length }}</small></button>
        <button v-for="c in cats" :key="c" type="button" :aria-pressed="filter === c" @click="filter = c">{{ c }}<small>{{ events.filter(e => e.cat === c).length }}</small></button>
      </div>
      <div aria-live="polite">
        <template v-for="g in grouped" :key="g.month">
          <h2 class="aq-month">{{ g.month }}</h2>
          <EventItem v-for="e in g.events" :key="e.slug" :e="e" />
        </template>
        <p v-if="!grouped.length" class="aq-empty">Aucun événement à venir dans ce thème.</p>
      </div>
    </div>
    <aside class="col-lg-4"><div class="aq-sticky"><div class="aq-side-box"><h2>Vous organisez un événement ?</h2>
      <p class="mb-3 aq-serif">Proposez-le à la rédaction pour figurer dans l’agenda.</p>
      <Link class="aq-btn aq-btn--primary" href="/contact?sujet=agenda">Proposer un événement</Link></div>
    </div></aside></div>
  </div>
</template>
