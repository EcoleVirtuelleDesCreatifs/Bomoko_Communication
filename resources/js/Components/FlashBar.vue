<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { Link } from '@inertiajs/vue3';
import { fr, reduceMotion } from '../utils';

const props = defineProps({ items: { type: Array, default: () => [] } });
const paused = ref(false);
const n = computed(() => props.items.length);
const duration = computed(() => Math.max(20, n.value * 12) + 's');

const idx = ref(0);
const cur = computed(() => props.items[idx.value] ?? {});
let timer = null;
onMounted(() => {
  if (!reduceMotion) timer = setInterval(() => { if (!paused.value) idx.value = (idx.value + 1) % n.value; }, 4500);
});
onUnmounted(() => clearInterval(timer));
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
  </div>

  <div class="aq-flash__rotator" role="group" aria-label="Flashs en cours" @click="paused = !paused">
    <transition name="aqflash" mode="out-in">
      <Link v-if="cur.url" :key="idx" class="aq-flash__ritem" :href="cur.url">{{ fr(cur.text) }}</Link>
      <span v-else :key="idx" class="aq-flash__ritem">{{ fr(cur.text) }}</span>
    </transition>
    <div class="aq-flash__dots" v-if="n > 1">
      <button v-for="(f, i) in items" :key="i" type="button" :class="{ on: i === idx }" :aria-label="'Flash ' + (i + 1) + ' sur ' + n" :aria-pressed="i === idx" @click.stop="idx = i"></button>
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

/* Rotateur mobile (un flash à la fois) — masqué sur desktop */
.aq-flash__rotator { display: none; }

@media (max-width: 575.98px) {
  .aq-flash__ticker, .aq-flash__nav { display: none; }
  .aq-flash__label strong { animation: aq-flash-blink 1.1s ease-in-out infinite; }
  .aq-flash__rotator { display: flex; flex-direction: column; gap: .55rem; padding: .65rem 0 .7rem; min-height: 3.6em; }
  .aq-flash__ritem { font-size: .95rem; font-weight: 600; line-height: 1.35; color: #f3f0eb; text-decoration: none; }
  .aq-flash__ritem::before { content: "⚡"; margin-right: .55rem; color: var(--aq-orange, #e8650f); font-size: .8rem; }
  a.aq-flash__ritem:active { color: #ff9d5c; }
  .aq-flash__dots { display: flex; gap: .4rem; }
  .aq-flash__dots button { width: 1.4rem; height: 3px; border: 0; border-radius: 2px; background: rgba(255,255,255,.28); padding: 0; cursor: pointer; transition: background .2s, width .2s; }
  .aq-flash__dots button.on { background: var(--aq-orange, #e8650f); width: 2rem; }
}
.aqflash-enter-active, .aqflash-leave-active { transition: opacity .32s ease, transform .32s ease; }
.aqflash-enter-from { opacity: 0; transform: translateY(.9rem); }
.aqflash-leave-to { opacity: 0; transform: translateY(-.9rem); }
@keyframes aq-flash-blink { 0%, 100% { opacity: 1; } 50% { opacity: .3; } }
@media (prefers-reduced-motion: reduce) {
  .aq-flash__label strong { animation: none; }
  .aqflash-enter-active, .aqflash-leave-active { transition: none; }
}
</style>
