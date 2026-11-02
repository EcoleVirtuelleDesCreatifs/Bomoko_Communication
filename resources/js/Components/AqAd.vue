<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { usePage } from '@inertiajs/vue3';

const props = defineProps({
    slot: { type: String, required: true },
    variant: { type: String, default: 'pave' },
    format: { type: String, default: '300 × 250' },
});

const el = ref(null);
const ad = computed(() => (usePage().props.ads || []).find((a) => a.slot === props.slot));
let observer = null;

function xsrf() {
    return decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || '');
}
function track(type) {
    if (!ad.value?.id) return;
    fetch('/ad-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'X-XSRF-TOKEN': xsrf() },
        body: JSON.stringify({ ad: ad.value.id, slot: props.slot, type }),
        credentials: 'same-origin',
        keepalive: true,
    }).catch(() => {});
}

onMounted(() => {
    if (!ad.value || !el.value || !('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { track('imp'); observer.disconnect(); }
    }, { threshold: 0.5 });
    observer.observe(el.value);
});
onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <div ref="el" class="aq-ad" :class="'aq-ad--' + variant" role="complementary" aria-label="Publicité">
    <span>Publicité</span>
    <template v-if="ad">
      <a v-if="ad.url" class="aq-ad__link" :href="ad.url" target="_blank" rel="noopener sponsored" @click="track('clk')">
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
