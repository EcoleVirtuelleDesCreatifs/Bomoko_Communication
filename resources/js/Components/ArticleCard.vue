<script setup>
import { Link } from '@inertiajs/vue3';
import AqMedia from './AqMedia.vue';
import { fr, kicker, rel } from '../utils';

defineProps({
    a: { type: Object, required: true },
    h: { type: Boolean, default: false },
    col: { type: String, default: '' },
    kickerMode: { type: String, default: null },
});
</script>

<template>
  <article class="aq-card" :class="[h ? 'aq-card--h' : '', col]">
    <Link :href="a.url">
      <div class="aq-media aq-media--cut"><AqMedia :a="a" /></div>
      <div><span class="aq-card__place">{{ fr(kicker(a, kickerMode)) }}</span><h3 class="aq-card__title">{{ fr(a.title) }}</h3>
      <time class="aq-card__meta" :datetime="a.date">{{ rel(a.date) }}</time></div>
    </Link>
  </article>
</template>
