<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { usePage } from '@inertiajs/vue3';

const page = usePage();
const ad = computed(() => (page.props.ads || []).find((a) => a.slot === 'habillage' && a.visual));

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

const el = ref(null);
const seen = new Set();
let observer = null;
function observe() {
    observer?.disconnect();
    if (!ad.value || !el.value || seen.has(ad.value.id) || !('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5)) {
            seen.add(ad.value.id); track('imp'); observer.disconnect();
        }
    }, { threshold: 0.5 });
    el.value.querySelectorAll('.aq-skin__side').forEach((side) => observer.observe(side));
}
onMounted(observe);
watch(() => ad.value?.id, observe, { flush: 'post' });
onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <div v-if="ad" ref="el" class="aq-skin" role="complementary" aria-label="Publicité">
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
