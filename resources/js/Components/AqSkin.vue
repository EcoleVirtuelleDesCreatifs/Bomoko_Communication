<script setup>
import { computed, onMounted } from 'vue';
import { usePage } from '@inertiajs/vue3';

const ad = computed(() => (usePage().props.ads || []).find((a) => a.slot === 'habillage' && a.visual));

function track(type) {
    if (!ad.value?.id) return;
    fetch('/ad-event', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || ''),
        },
        body: JSON.stringify({ ad: ad.value.id, slot: 'habillage', type }),
        credentials: 'same-origin',
        keepalive: true,
    }).catch(() => {});
}

onMounted(() => {
    if (ad.value && window.matchMedia('(min-width: 1440px)').matches) track('imp');
});
</script>

<template>
  <div v-if="ad" class="aq-skin" aria-hidden="true">
    <component :is="ad.url ? 'a' : 'span'" v-for="side in ['l', 'r']" :key="side"
      class="aq-skin__side" :class="'aq-skin__side--' + side"
      :href="ad.url || null" :target="ad.url ? '_blank' : null" :rel="ad.url ? 'noopener sponsored' : null"
      :aria-label="ad.url ? 'Publicité — ' + ad.advertiser : null"
      :style="{ backgroundImage: 'url(' + ad.visual + ')' }"
      @click="track('clk')">
      <span class="aq-skin__tag">Publicité</span>
    </component>
  </div>
</template>
