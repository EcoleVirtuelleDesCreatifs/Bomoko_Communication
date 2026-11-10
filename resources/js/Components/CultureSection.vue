<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { Link } from '@inertiajs/vue3'
import AqMedia from './AqMedia.vue'
import { fr } from '../utils'

const props = defineProps({
  items: { type: Array, default: () => [] },
  moreHref: { type: String, default: '/rubrique/culture' },
  title: { type: String, default: 'Culture' },
  tagline: { type: String, default: 'Vivez au rythme de la culture africaine' },
})

const splitKind = (kind = '') => {
  const i = kind.indexOf(',')
  return i === -1
    ? { place: kind.trim(), label: '' }
    : { place: kind.slice(0, i).trim(), label: kind.slice(i + 1).trim() }
}

const lead = computed(() => props.items[0] && { ...props.items[0], ...splitKind(props.items[0].country || '') })
const rest = computed(() => props.items.slice(1).map((it) => ({ ...it, ...splitKind(it.country || '') })))

const rail = ref(null)
const progress = ref(0)
const atStart = ref(true)
const atEnd = ref(false)

const update = () => {
  const el = rail.value
  if (!el) return
  const max = el.scrollWidth - el.clientWidth
  progress.value = max > 0 ? el.scrollLeft / max : 1
  atStart.value = el.scrollLeft <= 4
  atEnd.value = el.scrollLeft >= max - 4
}

const scrollByCard = (dir) => {
  const el = rail.value
  if (!el) return
  const card = el.querySelector('.aq-cc')
  const step = card ? card.getBoundingClientRect().width + 20 : el.clientWidth * 0.8
  el.scrollBy({ left: dir * step, behavior: 'smooth' })
}

const onKey = (e) => {
  if (e.key === 'ArrowRight') { e.preventDefault(); scrollByCard(1) }
  if (e.key === 'ArrowLeft') { e.preventDefault(); scrollByCard(-1) }
}

onMounted(() => { update(); window.addEventListener('resize', update) })
onBeforeUnmount(() => window.removeEventListener('resize', update))
</script>

<template>
  <section v-if="items.length" class="aq-culture" id="culture" aria-labelledby="h-culture">
    <div class="container-xl">
      <header class="aq-culture__head">
        <div class="aq-culture__titles">
          <p class="aq-culture__eyebrow"><span aria-hidden="true"></span>Rubrique</p>
          <h2 class="aq-culture__title" id="h-culture">{{ title }}</h2>
          <p class="aq-culture__tagline">{{ tagline }}</p>
        </div>
        <div class="aq-culture__actions">
          <div v-if="rest.length > 1" class="aq-culture__nav" role="group" aria-label="Faire défiler les articles">
            <button type="button" class="aq-culture__btn" :disabled="atStart" aria-label="Articles précédents" @click="scrollByCard(-1)">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <button type="button" class="aq-culture__btn" :disabled="atEnd" aria-label="Articles suivants" @click="scrollByCard(1)">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
            </button>
          </div>
          <Link class="aq-culture__more" :href="moreHref">
            Toute la rubrique
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </Link>
        </div>
      </header>

      <div class="aq-culture__grid" :class="{ 'is-solo': !rest.length }">
        <Link v-if="lead" class="aq-cc aq-cc--lead" :href="lead.url">
          <div class="aq-cc__media"><AqMedia :a="lead" /></div>
          <div class="aq-cc__body">
            <p class="aq-cc__kicker">
              <span class="aq-cc__place">{{ lead.place }}</span>
              <span v-if="lead.label" class="aq-cc__label">{{ lead.label }}</span>
            </p>
            <h3 class="aq-cc__title"><span>{{ fr(lead.title) }}</span></h3>
            <span class="aq-cc__cta">Lire l'article</span>
          </div>
        </Link>

        <div v-if="rest.length" class="aq-culture__railwrap">
          <div ref="rail" class="aq-culture__rail" tabindex="0" aria-label="Autres articles culture" @scroll.passive="update" @keydown="onKey">
            <Link v-for="it in rest" :key="it.id" class="aq-cc" :href="it.url">
              <div class="aq-cc__media"><AqMedia :a="it" /></div>
              <div class="aq-cc__body">
                <p class="aq-cc__kicker"><span class="aq-cc__place">{{ it.place }}</span></p>
                <h3 class="aq-cc__title"><span>{{ fr(it.title) }}</span></h3>
              </div>
            </Link>
          </div>
          <div class="aq-culture__progress" aria-hidden="true">
            <span :style="{ transform: `scaleX(${Math.max(progress, 0.08)})` }"></span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.aq-culture {
  --ink: #14110e;
  --ink-2: #1f1a15;
  --paper: #f5efe4;
  --muted: rgba(245, 239, 228, .62);
  --accent: var(--orange);
  --radius: 14px;
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: var(--ink);
  color: var(--paper);
  padding: clamp(56px, 8vw, 112px) 0;
}
.aq-culture::before {
  content: ""; position: absolute; inset: -30% -10% auto auto; width: 70vw; aspect-ratio: 1; z-index: -1;
  background: radial-gradient(closest-side, rgba(222, 80, 17, .2), transparent 70%);
}
.aq-culture::after {
  content: ""; position: absolute; inset: 0; z-index: -1; opacity: .05; pointer-events: none;
  background-image: radial-gradient(circle at 1px 1px, var(--paper) 1px, transparent 0);
  background-size: 22px 22px;
  mask-image: linear-gradient(180deg, #000, transparent 55%);
}

.aq-culture__head { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; flex-wrap: wrap; margin-bottom: clamp(28px, 4vw, 48px); }
.aq-culture__eyebrow { display: flex; align-items: center; gap: 10px; margin: 0 0 10px; font-size: 12px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; color: var(--accent); }
.aq-culture__eyebrow span { width: 28px; height: 2px; background: currentColor; }
.aq-culture__title { margin: 0; font-family: var(--display); font-weight: 700; font-size: clamp(1.6rem, 1.3rem + .9vw, 2.1rem); line-height: 1.1; letter-spacing: -.02em; }
.aq-culture__tagline { margin: 14px 0 0; max-width: 34ch; font-size: clamp(16px, 1.5vw, 19px); color: var(--muted); }
.aq-culture__actions { display: flex; align-items: center; gap: 20px; }
.aq-culture__nav { display: flex; gap: 8px; }
.aq-culture__btn {
  display: grid; place-items: center; width: 46px; height: 46px; border-radius: 50%; cursor: pointer;
  background: transparent; color: var(--paper); border: 1px solid rgba(245, 239, 228, .25);
  transition: background .25s, border-color .25s, color .25s, opacity .25s;
}
.aq-culture__btn:hover:not(:disabled) { background: var(--accent); border-color: var(--accent); color: var(--ink); }
.aq-culture__btn:disabled { opacity: .3; cursor: default; }
.aq-culture__btn svg, .aq-culture__more svg { width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.aq-culture__more { display: inline-flex; align-items: center; gap: 8px; padding: 12px 20px; border-radius: 999px; font-weight: 600; font-size: 14px; color: var(--ink); background: var(--paper); text-decoration: none; transition: background .25s, gap .25s; }
.aq-culture__more:hover { background: var(--accent); gap: 12px; }

.aq-culture__grid { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.9fr); gap: 20px; align-items: stretch; }
.aq-culture__grid.is-solo { grid-template-columns: 1fr; }
.aq-culture__railwrap { display: flex; flex-direction: column; min-width: 0; }
.aq-culture__rail {
  flex: 1; display: grid; grid-auto-flow: column; grid-auto-columns: calc((100% - 40px) / 2.4); gap: 20px;
  overflow-x: auto; scroll-snap-type: x mandatory; overscroll-behavior-x: contain; scrollbar-width: none; border-radius: var(--radius);
}
.aq-culture__rail::-webkit-scrollbar { display: none; }
.aq-culture__progress { height: 2px; margin-top: 18px; background: rgba(245, 239, 228, .14); border-radius: 2px; overflow: hidden; }
.aq-culture__progress span { display: block; height: 100%; background: var(--accent); transform-origin: left; transition: transform .2s linear; }

.aq-cc { position: relative; display: flex; flex-direction: column; justify-content: flex-end; min-height: 380px; border-radius: var(--radius); overflow: hidden; color: var(--paper); text-decoration: none; background: var(--ink-2); scroll-snap-align: start; isolation: isolate; }
.aq-cc__media { position: absolute; inset: 0; z-index: -1; }
.aq-cc__media :deep(.aq-media) { position: absolute; inset: 0; aspect-ratio: auto; }
.aq-cc__media :deep(.aq-media)::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(20, 17, 14, 0) 30%, rgba(20, 17, 14, .55) 60%, rgba(20, 17, 14, .95) 100%); }
.aq-cc__media :deep(img), .aq-cc__media :deep(.aq-ph) { transition: transform .8s cubic-bezier(.2, .7, .2, 1), filter .5s; filter: saturate(.92); }
.aq-cc__body { padding: clamp(18px, 2vw, 28px); }
.aq-cc__kicker { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 10px; margin: 0 0 12px; font-size: 12px; }
.aq-cc__place { padding: 5px 10px; border-radius: 999px; background: var(--accent); color: var(--ink); font-weight: 700; letter-spacing: .08em; text-transform: uppercase; }
.aq-cc__label { color: var(--muted); font-weight: 500; }
.aq-cc__title { margin: 0; font-family: var(--display); font-weight: 600; font-size: clamp(18px, 1.6vw, 21px); line-height: 1.22; text-wrap: balance; }
.aq-cc__title span { background: linear-gradient(var(--accent), var(--accent)) 0 100% / 0 2px no-repeat; transition: background-size .45s; }
.aq-cc:hover .aq-cc__media :deep(img), .aq-cc:focus-visible .aq-cc__media :deep(img) { transform: scale(1.06); filter: saturate(1.05); }
.aq-cc:hover .aq-cc__title span, .aq-cc:focus-visible .aq-cc__title span { background-size: 100% 2px; }
.aq-cc:focus-visible, .aq-culture__rail:focus-visible, .aq-culture__btn:focus-visible, .aq-culture__more:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }

.aq-cc--lead { min-height: clamp(460px, 44vw, 600px); }
.aq-cc--lead .aq-cc__title { font-size: clamp(26px, 2.8vw, 38px); line-height: 1.1; letter-spacing: -.01em; }
.aq-cc__cta { display: inline-block; margin-top: 18px; font-size: 13px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--accent); }
.aq-cc__cta::after { content: " →"; transition: margin .25s; }
.aq-cc:hover .aq-cc__cta::after { margin-left: 4px; }

@media (max-width: 1024px) {
  .aq-culture__rail { grid-auto-columns: calc((100% - 20px) / 1.6); }
}
@media (max-width: 860px) {
  .aq-culture__grid { grid-template-columns: 1fr; }
  .aq-cc--lead { min-height: 440px; }
  .aq-culture__rail { grid-auto-columns: 72%; }
  .aq-cc { min-height: 340px; }
}
@media (max-width: 520px) {
  .aq-culture__actions { width: 100%; justify-content: space-between; }
  .aq-culture__rail { grid-auto-columns: 82%; }
}
@media (prefers-reduced-motion: reduce) {
  .aq-cc__media :deep(img), .aq-cc__title span, .aq-culture__progress span { transition: none; }
}
</style>
