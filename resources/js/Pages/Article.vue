<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { Link, useForm, usePage } from '@inertiajs/vue3';
import AqMedia from '../Components/AqMedia.vue';
import ArticleCard from '../Components/ArticleCard.vue';
import ChapterHead from '../Components/ChapterHead.vue';
import Crumbs from '../Components/Crumbs.vue';
import Newsletter from '../Components/Newsletter.vue';
import { fmtLongDate, fr, initials, kicker, rel, store, toast } from '../utils';

const props = defineProps({
    article: { type: Object, required: true },
    newer: { type: Object, default: null },
    older: { type: Object, default: null },
    related: { type: Array, default: () => [] },
    sameRegion: { type: Array, default: () => [] },
    top: { type: Array, default: () => [] },
    comments: { type: Array, default: () => [] },
});

const a = props.article;
const urlRub = (r) => r === 'portraits' ? '/portraits' : '/rubrique/' + r;

const crumb = computed(() => {
    const items = [{ label: a.rub_label, href: urlRub(a.rub) }];
    if (a.region) items.push({ label: a.region_label, href: '/afriques/' + a.region });
    items.push({ label: a.title.length > 48 ? a.title.slice(0, 46) + '…' : a.title });
    return items;
});

const blocks = computed(() => (a.body || []).map((b) => {
    if (b.startsWith('<')) return { t: 'html', x: b };
    if (b.startsWith('## ')) return { t: 'h2', x: b.slice(3) };
    if (b.startsWith('> ')) return { t: 'quote', x: b.slice(2) };
    return { t: 'p', x: b };
}));

const shareUrl = computed(() => encodeURIComponent(a.url));
const shareText = computed(() => encodeURIComponent(a.title));
const canShareNative = ref(false);

const size = ref(Number(store('aq-size')) || 0);
function applySize() {
    document.documentElement.style.setProperty('--aq-article-size', (1.1875 + size.value * 0.125) + 'rem');
}
function bumpSize(d) {
    size.value = Math.max(-2, Math.min(3, size.value + d));
    applySize(); store('aq-size', size.value);
}

const bar = ref(null), prose = ref(null);
let ticking = false;
function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
        if (bar.value && prose.value) {
            const r = prose.value.getBoundingClientRect();
            const total = r.height - window.innerHeight * 0.5;
            const p = Math.min(1, Math.max(0, (-r.top + window.innerHeight * 0.3) / Math.max(total, 1)));
            bar.value.style.width = (p * 100) + '%';
        }
        ticking = false;
    });
}

function copyLink() {
    const done = () => toast('Lien copié dans le presse-papiers');
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(location.href).then(done, fallback);
    } else fallback();
    function fallback() {
        const t = document.createElement('textarea');
        t.value = location.href; document.body.appendChild(t); t.select();
        try { document.execCommand('copy'); done(); } catch (e) { toast('Copiez l’adresse depuis la barre du navigateur'); }
        t.remove();
    }
}
function shareNative() {
    navigator.share({ title: a.title, text: a.chapo, url: location.href }).catch(() => {});
}

onMounted(() => {
    canShareNative.value = !!navigator.share;
    applySize();
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
});
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll));

// Commentaires
const page = usePage();
const cform = useForm({ author: '', email: '', text: '', website: '' });
const flashMsg = computed(() => page.props.flash?.success);
function sendComment() {
    cform.post('/article/' + a.id + '/commentaire', {
        preserveScroll: true,
        onSuccess: () => cform.reset('text'),
    });
}
</script>

<template>
  <div class="aq-progress" ref="bar" aria-hidden="true"></div>
  <article class="aq-article" itemscope itemtype="https://schema.org/NewsArticle"><div class="container-xl">
    <Crumbs :items="crumb" />
    <div class="row g-5"><div class="col-lg-8">
      <Link class="aq-tag" :href="urlRub(a.rub)">{{ a.rub_label }}</Link>
      <h1 class="aq-article__title" itemprop="headline">{{ fr(a.title) }}</h1>
      <p class="aq-article__chapo" itemprop="description">{{ fr(a.chapo) }}</p>
      <div class="aq-article__bar">
        <div class="aq-byline"><span class="aq-avatar" aria-hidden="true">{{ initials(a.author) }}</span>
          <div><strong itemprop="author">Par {{ a.author }}</strong>
          <time :datetime="a.date" itemprop="datePublished">{{ fmtLongDate(a.date) }}</time>, {{ a.read }} min de lecture</div></div>
        <div class="aq-tools">
          <button class="aq-icon" type="button" aria-label="Réduire la taille du texte" @click="bumpSize(-1)"><span class="aq-tools__size">A-</span></button>
          <button class="aq-icon" type="button" aria-label="Agrandir la taille du texte" @click="bumpSize(1)"><span class="aq-tools__size">A+</span></button>
          <span class="aq-tools__sep" aria-hidden="true"></span>
          <a class="aq-icon" :href="'https://www.facebook.com/sharer/sharer.php?u=' + shareUrl" target="_blank" rel="noopener" aria-label="Partager sur Facebook"><i class="bi bi-facebook" aria-hidden="true"></i></a>
          <a class="aq-icon" :href="'https://x.com/intent/post?url=' + shareUrl + '&text=' + shareText" target="_blank" rel="noopener" aria-label="Partager sur X"><i class="bi bi-twitter-x" aria-hidden="true"></i></a>
          <a class="aq-icon" :href="'https://www.linkedin.com/sharing/share-offsite/?url=' + shareUrl" target="_blank" rel="noopener" aria-label="Partager sur LinkedIn"><i class="bi bi-linkedin" aria-hidden="true"></i></a>
          <a class="aq-icon" :href="'https://wa.me/?text=' + shareText + '%20' + shareUrl" target="_blank" rel="noopener" aria-label="Partager sur WhatsApp"><i class="bi bi-whatsapp" aria-hidden="true"></i></a>
          <button class="aq-icon" type="button" aria-label="Copier le lien" @click="copyLink"><i class="bi bi-link-45deg" aria-hidden="true"></i></button>
          <button v-if="canShareNative" class="aq-btn aq-btn--ink aq-share-native" type="button" @click="shareNative"><i class="bi bi-share" aria-hidden="true"></i>Partager</button>
        </div>
      </div>

      <div v-if="a.person" class="aq-fiche"><div class="aq-fiche__mono" aria-hidden="true">{{ a.person.initials }}</div><dl>
        <div><dt>Nom</dt><dd>{{ a.person.name }}</dd></div>
        <div><dt>Activité</dt><dd>{{ a.person.role }}</dd></div>
        <div><dt>Ville</dt><dd>{{ a.person.city }}, {{ a.country }}</dd></div>
        <div><dt>Domaine</dt><dd>{{ a.person.field }}</dd></div>
        <div><dt>En activité depuis</dt><dd>{{ a.person.since }}</dd></div>
      </dl></div>

      <figure class="aq-figure"><div class="aq-media aq-media--cut"><AqMedia :a="a" :alt="true" :priority="true" sizes="(min-width: 992px) 760px, 100vw" /></div>
        <figcaption>{{ fr(a.img) }}<template v-if="!a.src">. Photo de démonstration.</template></figcaption></figure>

      <div class="aq-prose" itemprop="articleBody" ref="prose">
        <template v-for="(b, i) in blocks" :key="i">
          <h2 v-if="b.t === 'h2'">{{ fr(b.x) }}</h2>
          <blockquote v-else-if="b.t === 'quote'">{{ fr(b.x) }}</blockquote>
          <div v-else-if="b.t === 'html'" class="aq-legacy" v-html="b.x"></div>
          <p v-else>{{ fr(b.x) }}</p>
        </template>
      </div>

      <div class="aq-tags" aria-label="Mots-clés"><Link v-for="t in a.tags" :key="t" :href="'/recherche?q=' + encodeURIComponent(t)">{{ t }}</Link></div>

      <div class="aq-author"><span class="aq-avatar" aria-hidden="true">{{ initials(a.author) }}</span>
        <p><strong>{{ a.author }}</strong><br>{{ a.rub === 'opinion' ? 'Les tribunes publiées n’engagent que leurs auteurs.' : 'Journaliste à la rédaction d’Afriquinfos.' }}</p></div>

      <section class="aq-comments" aria-labelledby="hComments">
        <h2 id="hComments">Commentaires <small v-if="comments.length">({{ comments.length }})</small></h2>
        <div v-if="flashMsg" class="aq-success" role="status">{{ flashMsg }}</div>
        <ol class="aq-comments__list" v-if="comments.length">
          <li v-for="(c, i) in comments" :key="i" class="aq-comment">
            <span class="aq-avatar" aria-hidden="true">{{ initials(c.author) }}</span>
            <div><strong>{{ c.author }}</strong><time class="aq-comment__date">{{ rel(c.date) }}</time>
              <p>{{ fr(c.text) }}</p>
              <div v-if="c.reply" class="aq-comment__reply"><strong>Réponse de la rédaction</strong><p>{{ fr(c.reply) }}</p></div>
            </div>
          </li>
        </ol>
        <p v-else class="aq-comment__empty">Soyez le premier à commenter cet article.</p>
        <form class="aq-cform" @submit.prevent="sendComment" novalidate>
          <div class="row g-3">
            <div class="col-md-6"><label class="form-label" for="cAuthor">Nom ou pseudo</label>
              <input class="form-control" id="cAuthor" v-model="cform.author" maxlength="120" autocomplete="name" required>
              <p v-if="cform.errors.author" class="aq-err">{{ cform.errors.author }}</p></div>
            <div class="col-md-6"><label class="form-label" for="cEmail">E-mail <small class="text-body-secondary">(jamais publié)</small></label>
              <input class="form-control" id="cEmail" type="email" v-model="cform.email" maxlength="160" autocomplete="email" required>
              <p v-if="cform.errors.email" class="aq-err">{{ cform.errors.email }}</p></div>
          </div>
          <label class="visually-hidden" for="cWeb">Ne pas remplir</label>
          <input class="aq-hp" id="cWeb" v-model="cform.website" tabindex="-1" autocomplete="off" aria-hidden="true">
          <label class="form-label mt-3" for="cText">Votre commentaire</label>
          <textarea class="form-control" id="cText" v-model="cform.text" rows="4" maxlength="2000" required placeholder="Votre avis, votre analyse, votre question…"></textarea>
          <p v-if="cform.errors.text" class="aq-err">{{ cform.errors.text }}</p>
          <button class="aq-btn aq-btn--primary mt-3" type="submit" :disabled="cform.processing">{{ cform.processing ? 'Envoi…' : 'Publier mon commentaire' }}</button>
        </form>
      </section>

      <nav class="aq-prevnext" aria-label="Articles de la même rubrique">
        <Link v-if="older" :href="older.url"><small><i class="bi bi-arrow-left" aria-hidden="true"></i> Article précédent</small><strong>{{ fr(older.title) }}</strong></Link><span v-else></span>
        <Link v-if="newer" class="is-next" :href="newer.url"><small>Article suivant <i class="bi bi-arrow-right" aria-hidden="true"></i></small><strong>{{ fr(newer.title) }}</strong></Link>
      </nav>
    </div>
    <aside class="col-lg-4"><div class="aq-sticky">
      <div class="aq-side-box"><h2>À lire aussi</h2>
        <Link v-for="x in related" :key="x.id" class="aq-stack__item" :href="x.url"><span class="aq-card__place">{{ fr(kicker(x)) }}</span><h3>{{ fr(x.title) }}</h3></Link>
      </div>
      <div class="aq-side-box"><h2>Les plus lus</h2>
        <ol class="aq-top5"><li v-for="x in top" :key="x.id"><Link :href="x.url"><span>{{ fr(x.title) }}</span></Link></li></ol>
      </div>
      <div class="aq-ad aq-ad--pave" role="complementary" aria-label="Publicité"><span>Publicité</span><b>300 × 250</b></div>
    </div></aside></div>
  </div></article>

  <section v-if="sameRegion.length" class="aq-section aq-section--related aq-below" aria-label="Dans la même région"><div class="container-xl">
    <ChapterHead :title="a.region_label" tagline="Dans la même région" :href="'/afriques/' + a.region" more="Toute la région" />
    <div class="row g-4"><ArticleCard v-for="x in sameRegion" :key="x.id" :a="x" col="col-md-4" kicker-mode="rub" /></div>
  </div></section>

  <Newsletter />
</template>
