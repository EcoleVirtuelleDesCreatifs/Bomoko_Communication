<script setup>
import { computed } from 'vue';
import { usePage } from '@inertiajs/vue3';

const ad = computed(() => (usePage().props.ads || []).find((a) => a.slot === 'habillage' && a.visual));
</script>

<template>
  <div v-if="ad" class="aq-skin" aria-hidden="true">
    <component :is="ad.url ? 'a' : 'span'" v-for="side in ['l', 'r']" :key="side"
      class="aq-skin__side" :class="'aq-skin__side--' + side"
      :href="ad.url || null" :target="ad.url ? '_blank' : null" :rel="ad.url ? 'noopener sponsored' : null"
      :aria-label="ad.url ? 'Publicité — ' + ad.advertiser : null"
      :style="{ backgroundImage: 'url(' + ad.visual + ')' }">
      <span class="aq-skin__tag">Publicité</span>
    </component>
  </div>
</template>
