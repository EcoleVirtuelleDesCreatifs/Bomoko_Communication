<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { Link, router, usePage } from '@inertiajs/vue3';
import AqMedia from '../Components/AqMedia.vue';
import Crumbs from '../Components/Crumbs.vue';
import { fr, kicker, norm, rel } from '../utils';

const props = defineProps({
    q: { type: String, default: '' },
    articles: { type: Array, default: () => [] },
});

const regions = usePage().props.nav?.regions || [];
const regionLabels = Object.fromEntries(regions.map((r) => [r.slug, r.label]));

const query = ref(props.q);
const rubFilter = ref('all');
const input = ref(null);

const sorted = computed(() => [...props.articles].sort((a, b) => b.date.localeCompare(a.date)));
const terms = computed(() => norm(query.value).split(/\s+/).filter(Boolean));

const results = computed(() => {
    if (!terms.value.length) return sorted.value;
    return sorted.value.filter((a) => {
        const hay = norm([a.title, a.chapo, a.country, a.author, a.rub_label, a.region_label, (a.tags || []).join(' '), (a.body || []).join(' ')].join(' '));
        return terms.value.every((t) => hay.includes(t));
    });
});

const rubs = computed(() => {
    const seen = [];
    results.value.forEach((a) => { if (!seen.includes(a.rub)) seen.push(a.rub); });
    return seen;
});
watch(rubs, () => { if (rubFilter.value !== 'all' && !rubs.value.includes(rubFilter.value)) rubFilter.value = 'all'; });

const shown = computed(() => rubFilter.value === 'all' ? results.value : results.value.filter((a) => a.rub === rubFilter.value));

// Surlignage des termes
function parts(text) {
    const raw = fr(text);
    const t = terms.value.filter((x) => x.length >= 2);
    if (!t.length) return [{ mark: false, text: raw }];
    const re = new RegExp('(' + t.map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'gi');
    const out = [];
    let last = 0, m;
    while ((m = re.exec(raw))) {
        if (m.index > last) out.push({ mark: false, text: raw.slice(last, m.index) });
        out.push({ mark: true, text: m[0] });
        last = m.index + m[0].length;
    }
    if (last < raw.length) out.push({ mark: false, text: raw.slice(last) });
    return out;
}

let timer = null;
watch(query, () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
        router.get('/recherche', query.value.trim() ? { q: query.value.trim() } : {}, { preserveState: true, preserveScroll: true, replace: true });
    }, 300);
});

const suggestions = ['Cameroun', 'Sahel', 'Climat', 'Football', 'Paiement mobile'];
onMounted(() => { if (!props.q && input.value) input.value.focus(); });
</script>

<template>
  <div class="container-xl aq-page-head mb-5">
    <Crumbs :items="[{ label: 'Recherche' }]" />
    <h1 class="visually-hidden">Rechercher sur Afriquinfos</h1>
    <form role="search" @submit.prevent><label class="visually-hidden" for="bigq">Rechercher sur Afriquinfos</label>
      <div class="aq-bigsearch"><i class="bi bi-search" aria-hidden="true"></i>
        <input id="bigq" ref="input" name="q" type="search" autocomplete="off" placeholder="Un pays, un sujet, une personnalité…" v-model="query"></div></form>
    <p class="fw-semibold" role="status">{{ query.trim() ? results.length + ' résultat' + (results.length > 1 ? 's' : '') + ' pour « ' + query.trim() + ' »' : 'Toute l’actualité, de la plus récente à la plus ancienne' }}</p>
    <div v-if="results.length" class="aq-filters" role="group" aria-label="Filtrer par rubrique">
      <button type="button" :aria-pressed="rubFilter === 'all'" @click="rubFilter = 'all'">Tout<small>{{ results.length }}</small></button>
      <button v-for="r in rubs" :key="r" type="button" :aria-pressed="rubFilter === r" @click="rubFilter = r">{{ results.find(a => a.rub === r)?.rub_label }}<small>{{ results.filter(a => a.rub === r).length }}</small></button>
    </div>
    <div>
      <article v-for="a in shown" :key="a.id" class="aq-result aq-fade"><Link :href="a.url">
        <div class="aq-media aq-media--cut"><AqMedia :a="a" /></div>
        <div><span class="aq-card__place">{{ fr(kicker(a, 'rub')) }}</span>
          <h3><template v-for="(p, i) in parts(a.title)" :key="i"><mark v-if="p.mark">{{ p.text }}</mark><template v-else>{{ p.text }}</template></template></h3>
          <p><template v-for="(p, i) in parts(a.chapo)" :key="i"><mark v-if="p.mark">{{ p.text }}</mark><template v-else>{{ p.text }}</template></template></p>
          <time class="aq-card__meta">{{ rel(a.date) }}</time></div></Link></article>
      <div v-if="!shown.length" class="aq-empty"><h2>Aucun résultat</h2>
        <p>Vérifiez l’orthographe ou essayez un mot plus général, par exemple un pays ou une rubrique :
          <a v-for="s in suggestions" :key="s" class="aq-more" href="#" @click.prevent="query = s">{{ s }}</a></p></div>
    </div>
  </div>
</template>
