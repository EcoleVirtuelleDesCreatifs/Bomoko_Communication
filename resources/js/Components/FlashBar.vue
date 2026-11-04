<script setup>
import { computed, ref } from 'vue';
import { Link } from '@inertiajs/vue3';
import { fr, reduceMotion } from '../utils';

const props = defineProps({ items: { type: Array, default: () => [] } });
const paused = ref(false);
const n = computed(() => props.items.length);
const duration = computed(() => Math.max(20, n.value * 12) + 's');
</script>

<template>
  <div v-if="n" class="aq-flashbar"><div class="container-xl"><div class="aq-flash" role="region" aria-label="Flash info">
    <div class="aq-flash__label"><span class="aq-flash__dot" aria-hidden="true"></span><span><small>En direct</small><strong>Flash info</strong></span></div>

    <div class="aq-flash__viewport aq-flash__ticker" @mouseenter="paused = true" @mouseleave="paused = false">
      <div class="aq-flash__track" :style="{ animationDuration: duration, animationPlayState: paused || reduceMotion ? 'paused' : 'running' }">
        <template v-for="rep in 2" :key="rep">
          <template v-for="(f, i) in items" :key="rep + '-' + i">
            <Link v-if="f.url" class="aq-flash__item" :href="f.url" :aria-hidden="rep === 2">{{ fr(f.text) }}</Link>
            <span v-else class="aq-flash__item" :aria-hidden="rep === 2">{{ fr(f.text) }}</span>
          </template>
        </template>
      </div>
    </div>

    <div class="aq-flash__nav" v-if="n > 1">
      <button class="aq-flash__pause" type="button" :aria-label="paused ? 'Reprendre le défilement' : 'Mettre le défilement en pause'" :aria-pressed="paused" @click="paused = !paused">
        <i class="bi" :class="paused ? 'bi-play-fill' : 'bi-pause-fill'" aria-hidden="true"></i>
      </button>
    </div>
  </div></div></div>
</template>

<style scoped>
.aq-flash__ticker { overflow: hidden; flex: 1; display: flex; align-items: center; }
.aq-flash__track {
  display: inline-flex; align-items: center; gap: 3rem; padding-right: 3rem;
  white-space: nowrap; will-change: transform;
  animation-name: aq-flash-marquee;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
@keyframes aq-flash-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.aq-flash__item { flex: none; font-size: .9375rem; font-weight: 500; }
.aq-flash__item::before { content: "⚡"; margin-right: .6rem; color: var(--aq-orange, #e8650f); font-size: .8rem; }
a.aq-flash__item { color: inherit; text-decoration: none; }
a.aq-flash__item:hover { text-decoration: underline; }
.aq-flash__nav { flex: none; display: flex; align-items: center; gap: .15rem; padding-left: .75rem; }
.aq-flash__pause {
  border: 1px solid #3a3a3d; background: none; color: #bdb7af; width: 28px; height: 28px;
  font-size: .8rem; line-height: 1; border-radius: 3px; cursor: pointer;
}
.aq-flash__pause:hover { color: #fff; border-color: #6b6b70; }
</style>
