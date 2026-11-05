<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { usePage } from '@inertiajs/vue3';

const props = defineProps({
    slot: { type: String, required: true },
    variant: { type: String, default: 'pave' },
});

const el = ref(null);
const page = usePage();
const ad = computed(() => (page.props.ads || []).find((a) => a.slot === props.slot));
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

const seen = new Set();
function observe() {
    observer?.disconnect();
    if (!ad.value || !el.value || seen.has(ad.value.id) || !('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && entries[0].intersectionRatio >= 0.5) {
            seen.add(ad.value.id); track('imp'); observer.disconnect();
        }
    }, { threshold: 0.5 });
    observer.observe(el.value);
}
onMounted(observe);
watch(() => ad.value?.id, observe, { flush: 'post' });
onBeforeUnmount(() => observer?.disconnect());
</script>

<template>
  <div v-if="ad" ref="el" class="aq-ad" :class="'aq-ad--' + variant" role="complementary" aria-label="Publicité"
       :style="variant === 'mobile' ? 'overflow:hidden;text-align:center;background:#0d0d0f' : null">
    <span :style="variant === 'mobile' ? 'display:block;padding:.3rem .6rem .15rem;font-size:.5625rem;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.55);text-align:right' : null">Publicité</span>
    <a v-if="ad.url" class="aq-ad__link" :href="ad.url" target="_blank" rel="noopener sponsored" @click="track('clk')">
      <img v-if="ad.visual" :src="ad.visual" :alt="ad.advertiser" loading="lazy"
           :style="variant === 'mobile' ? 'display:block;width:100%;max-width:100%;height:auto;max-height:100px;object-fit:contain;margin:0 auto' : null">
      <span v-else class="aq-ad__text"><strong>{{ ad.advertiser }}</strong><small v-if="ad.name">{{ ad.name }}</small></span>
    </a>
    <span v-else class="aq-ad__text">
      <img v-if="ad.visual" :src="ad.visual" :alt="ad.advertiser" loading="lazy"
           :style="variant === 'mobile' ? 'display:block;width:100%;max-width:100%;height:auto;max-height:100px;object-fit:contain;margin:0 auto' : null">
      <strong v-else>{{ ad.advertiser }}</strong><small v-if="!ad.visual && ad.name">{{ ad.name }}</small>
    </span>
  </div>
</template>
