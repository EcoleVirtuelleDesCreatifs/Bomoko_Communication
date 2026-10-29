<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { Link } from '@inertiajs/vue3';
import { fr, reduceMotion } from '../utils';

const props = defineProps({ items: { type: Array, default: () => [] } });
const paused = ref(false);
const cur = ref(0);
const n = computed(() => props.items.length);
let timer = null;

function go(delta, user) {
    if (n.value) cur.value = ((cur.value + delta) % n.value + n.value) % n.value;
    if (user) arm();
}
function arm() {
    clearInterval(timer);
    if (!reduceMotion && n.value > 1) timer = setInterval(() => { if (!paused.value) cur.value = (cur.value + 1) % n.value; }, 5000);
}

onMounted(arm);
onBeforeUnmount(() => clearInterval(timer));
</script>

<template>
  <div v-if="n" class="aq-flashbar"><div class="container-xl"><div class="aq-flash" :class="{ 'is-paused': paused }" role="region" aria-label="Flash info" aria-roledescription="carrousel">
    <div class="aq-flash__label"><span class="aq-flash__dot" aria-hidden="true"></span><span><small>En direct</small><strong>Flash info</strong></span></div>

    <div class="aq-flash__viewport aq-flash__single" aria-live="off">
      <Transition :name="reduceMotion ? '' : 'flash-fade'" mode="out-in">
        <Link v-if="items[cur]?.url" :key="cur" class="aq-flash__item" :href="items[cur].url" role="group" :aria-roledescription="'flash'" :aria-label="(cur + 1) + ' sur ' + n + ' : ' + items[cur].text">{{ fr(items[cur].text) }}</Link>
        <span v-else :key="cur" class="aq-flash__item">{{ fr(items[cur]?.text) }}</span>
      </Transition>
    </div>

    <div class="aq-flash__nav" v-if="n > 1">
      <span class="aq-flash__pos tnum" aria-hidden="true">{{ cur + 1 }}/{{ n }}</span>
      <button class="aq-flash__arrow" type="button" aria-label="Flash précédent" @click="go(-1, true)"><i class="bi bi-chevron-left" aria-hidden="true"></i></button>
      <button class="aq-flash__arrow" type="button" aria-label="Flash suivant" @click="go(1, true)"><i class="bi bi-chevron-right" aria-hidden="true"></i></button>
      <button class="aq-flash__pause" type="button" :aria-label="paused ? 'Reprendre le défilement' : 'Mettre le défilement en pause'" :aria-pressed="paused" @click="paused = !paused">
        <i class="bi" :class="paused ? 'bi-play-fill' : 'bi-pause-fill'" aria-hidden="true"></i>
      </button>
    </div>
  </div></div></div>
</template>

<style scoped>
.aq-flash__single { display: flex; align-items: center; }
.aq-flash__single .aq-flash__item {
  display: block; width: 100%; overflow: hidden;
  text-overflow: ellipsis; white-space: nowrap;
  font-size: .9375rem; font-weight: 500;
}
.aq-flash__nav { flex: none; display: flex; align-items: center; gap: .15rem; padding-left: .75rem; }
.aq-flash__pos { color: #8f887f; font-size: .75rem; margin-right: .4rem; }
.aq-flash__arrow {
  border: 0; background: none; color: #bdb7af; padding: .35rem;
  font-size: .9rem; line-height: 1; border-radius: 3px; cursor: pointer;
}
.aq-flash__arrow:hover, .aq-flash__arrow:focus-visible { color: #fff; background: rgba(255, 255, 255, .12); }
.flash-fade-enter-active, .flash-fade-leave-active { transition: opacity .3s ease, transform .3s ease; }
.flash-fade-enter-from { opacity: 0; transform: translateX(14px); }
.flash-fade-leave-to { opacity: 0; transform: translateX(-14px); }
@media (max-width: 575.98px) { .aq-flash__pos { display: none; } }
</style>
