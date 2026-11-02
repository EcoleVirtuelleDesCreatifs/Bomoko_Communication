<script setup>
import { computed } from 'vue';
import { usePage } from '@inertiajs/vue3';

const props = defineProps({
    slot: { type: String, required: true },
    variant: { type: String, default: 'pave' },
    format: { type: String, default: '300 × 250' },
});

const ad = computed(() => (usePage().props.ads || []).find((a) => a.slot === props.slot));
</script>

<template>
  <div class="aq-ad" :class="'aq-ad--' + variant" role="complementary" aria-label="Publicité">
    <span>Publicité</span>
    <template v-if="ad">
      <a v-if="ad.url" class="aq-ad__link" :href="ad.url" target="_blank" rel="noopener sponsored">
        <img v-if="ad.visual" :src="ad.visual" :alt="ad.advertiser" loading="lazy">
        <span v-else class="aq-ad__text"><strong>{{ ad.advertiser }}</strong><small v-if="ad.name">{{ ad.name }}</small></span>
      </a>
      <span v-else class="aq-ad__text">
        <img v-if="ad.visual" :src="ad.visual" :alt="ad.advertiser" loading="lazy">
        <strong v-else>{{ ad.advertiser }}</strong><small v-if="!ad.visual && ad.name">{{ ad.name }}</small>
      </span>
    </template>
    <b v-else>{{ format }}</b>
  </div>
</template>
