const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../../public/assets/js/admin.js'), 'utf8');
const sync = source.slice(source.indexOf('  var saveTimer,'), source.indexOf('  function log(what)'));
const wait = () => new Promise(resolve => setTimeout(resolve, 20));
const { parseHTML } = require('linkedom');

function editor() {
  const { document } = parseHTML('<html><body></body></html>');
  const ctx = vm.createContext({ document, window: { AQ_ASSET: 'https://example.test' },
    esc: s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
  });
  vm.runInContext('function fr(s) { return esc(s); }' + source.slice(source.indexOf('  function inline(s)'), source.indexOf('  function previewHtml(a)')), ctx);
  return { document, ctx };
}

function articlePreview() {
  const { document, ctx } = editor();
  const requests = [], toasts = [], opened = [];
  document.body.innerHTML = '<div id="bigBody"></div>';
  Object.assign(ctx, { document, $: s => document.querySelector(s), bigViewVersion: 0,
    window: { AQ_API: '/admin/api/state', AQ_ASSET: 'https://example.test' },
    rubLabel: r => r, dlong: () => 'Date', coverOf: () => '<div>Couverture</div>',
    toast: (message, type) => toasts.push({ message, type }),
    openBig: (title, html) => { ctx.bigViewVersion++; opened.push(title); document.querySelector('#bigBody').innerHTML = html; },
    fetch: (url, options) => new Promise(resolve => requests.push({ url, options, resolve })),
  });
  vm.runInContext(source.slice(source.indexOf('  function previewHtml(a)'), source.indexOf('  /* ===================== Éditeur')), ctx);
  return { ctx, document, requests, toasts, opened };
}

function previewArticle(id = 'article-test') {
  return { id, slug: id, rub: 'culture', title: 'Titre de l’article', chapo: 'Chapô', author: 'Auteur', date: '2026-11-06T12:00:00Z' };
}

test('eye preview loads missing article content on demand without mutating the article', async () => {
  const e = articlePreview(), article = previewArticle(), button = e.document.createElement('button');
  const before = JSON.stringify(article);
  const pending = e.ctx.preview(article, button);
  assert.equal(e.requests.length, 1);
  assert.equal(e.requests[0].url, '/admin/api/article/article-test');
  assert.equal(e.requests[0].options.cache, 'no-store');
  assert.equal(e.requests[0].options.credentials, 'same-origin');
  assert.equal(button.disabled, true);
  assert.match(e.document.querySelector('#bigBody').textContent, /Chargement/);
  e.requests[0].resolve({ ok: true, json: async () => ({ body: ['<p>Texte <strong>complet</strong>.</p>'], person: null, image_path: null }) });
  await pending;
  assert.equal(e.document.querySelector('#bigBody strong').textContent, 'complet');
  assert.equal(button.disabled, false);
  assert.equal(JSON.stringify(article), before);
});

test('repeated eye clicks do not duplicate the loading request and preview includes the cover URL', async () => {
  const e = articlePreview(), article = previewArticle(), button = e.document.createElement('button');
  let rendered;
  e.ctx.coverOf = a => { rendered = a; return '<div>Couverture</div>'; };
  const pending = e.ctx.preview(article, button);
  await e.ctx.preview(article, button);
  assert.equal(e.requests.length, 1);
  e.requests[0].resolve({ ok: true, json: async () => ({ body: ['Texte'], image_path: 'medias/photo.jpg' }) });
  await pending;
  assert.equal(rendered.src, 'https://example.test/storage/medias/photo.jpg');
  assert.equal(article.src, undefined);
  assert.equal(e.opened.length, 1);
  assert.equal(button.disabled, false);
});

test('preview uses current unsaved editor content instead of fetching an older version', async () => {
  const e = articlePreview(), article = { ...previewArticle(), body: ['<p>Brouillon non enregistré</p>'] };
  await e.ctx.preview(article);
  assert.equal(e.requests.length, 0);
  assert.match(e.document.querySelector('#bigBody').textContent, /Brouillon non enregistré/);
});

test('preview errors are displayed and never replace missing content with an empty body', async () => {
  const e = articlePreview(), article = previewArticle(), button = e.document.createElement('button');
  const pending = e.ctx.preview(article, button);
  e.requests[0].resolve({ ok: false, status: 403 });
  await pending;
  assert.match(e.document.querySelector('#bigBody').textContent, /403/);
  assert.equal(e.toasts.at(-1).type, 'error');
  assert.equal(button.disabled, false);
  assert.equal(article.body, undefined);
});

test('a late preview response cannot overwrite a newer dialog', async () => {
  const e = articlePreview();
  const pending = e.ctx.preview(previewArticle());
  e.ctx.openBig('Autre fenêtre', '<p>Contenu à conserver</p>');
  e.requests[0].resolve({ ok: true, json: async () => ({ body: ['Ancien aperçu'] }) });
  await pending;
  assert.equal(e.document.querySelector('#bigBody').textContent, 'Contenu à conserver');
});

test('invalid preview responses report an error rather than rendering or changing the article', async () => {
  const e = articlePreview(), article = previewArticle();
  const pending = e.ctx.preview(article);
  e.requests[0].resolve({ ok: true, json: async () => ({ body: 'Format invalide' }) });
  await pending;
  assert.equal(e.document.querySelector('#bigBody article'), null);
  assert.equal(e.toasts.at(-1).type, 'error');
  assert.equal(article.body, undefined);
});

async function homeMediaMotion({ reduced = false, supported = true, loaded = true } = {}) {
  const { createHomeMediaMotion } = await import('../../resources/js/utils.js');
  const { document, Event } = parseHTML('<html><body><div class="aq-home"><div class="aq-slide"><a class="aq-slide__media"><img></a></div><div class="aq-media" id="above"><img></div><div class="aq-media" id="below"><img></div><div class="aq-ad"><img id="ad"></div></div></body></html>');
  const root = document.querySelector('.aq-home'), above = document.querySelector('#above'), below = document.querySelector('#below');
  root.querySelectorAll('.aq-media, .aq-slide__media').forEach(frame => {
    frame.getBoundingClientRect = () => ({ top: frame === above ? 100 : 1100, bottom: frame === above ? 300 : 1300, left: 0, right: 400 });
    Object.defineProperty(frame.querySelector('img'), 'complete', { get: () => loaded });
  });
  const preference = document.createElement('span'); preference.matches = reduced;
  const observers = [];
  class Observer {
    constructor(callback) { this.callback = callback; this.targets = new Set(); this.disconnected = false; observers.push(this); }
    observe(target) { this.targets.add(target); }
    unobserve(target) { this.targets.delete(target); }
    disconnect() { this.targets.clear(); this.disconnected = true; }
  }
  const browser = { innerHeight: 800, innerWidth: 1200, matchMedia: () => preference };
  if (supported) browser.IntersectionObserver = Observer;
  const motion = createHomeMediaMotion(root, browser);
  return { root, document, Event, above, below, preference, observers, motion };
}

test('home image motion safely does nothing without a browser or a mounted root', async () => {
  const { createHomeMediaMotion } = await import('../../resources/js/utils.js');
  const motion = createHomeMediaMotion(null);
  assert.doesNotThrow(() => { motion.refresh(); motion.destroy(); });
});

test('home photos reveal once on entry without delaying above-fold images or ads', async () => {
  const e = await homeMediaMotion();
  assert.equal(e.above.classList.contains('aq-home-media-pending'), false);
  assert.equal(e.below.classList.contains('aq-home-media-pending'), true);
  assert.equal(e.observers[0].targets.size, 1);
  e.observers[0].callback([{ target: e.below, isIntersecting: false }]);
  assert.ok(e.below.classList.contains('aq-home-media-pending'));
  e.observers[0].callback([{ target: e.below, isIntersecting: true }]);
  assert.equal(e.below.classList.contains('aq-home-media-pending'), false);
  e.motion.refresh();
  assert.equal(e.observers[0].targets.size, 0);
  e.motion.destroy();
});

test('home photo motion respects reduced motion changes and unsupported browsers', async () => {
  const e = await homeMediaMotion({ reduced: true });
  assert.equal(e.observers.length, 0);
  e.preference.matches = false; e.preference.dispatchEvent(new e.Event('change'));
  assert.equal(e.observers.length, 1);
  assert.ok(e.below.classList.contains('aq-home-media-pending'));
  e.preference.matches = true; e.preference.dispatchEvent(new e.Event('change'));
  assert.equal(e.below.classList.contains('aq-home-media-pending'), false);
  assert.equal(e.observers[0].disconnected, true);
  e.motion.destroy();
  e.preference.matches = false; e.preference.dispatchEvent(new e.Event('change'));
  assert.equal(e.observers.length, 1);
  const unsupported = await homeMediaMotion({ supported: false });
  assert.equal(unsupported.observers.length, 0);
  assert.equal(unsupported.below.classList.contains('aq-home-media-pending'), false);
  unsupported.motion.destroy();
});

test('lazy home photos reveal after loading and are cleaned up after unmount', async () => {
  const e = await homeMediaMotion({ loaded: false });
  e.observers[0].callback([{ target: e.below, isIntersecting: true }]);
  assert.ok(e.below.classList.contains('aq-home-media-pending'));
  e.below.querySelector('img').dispatchEvent(new e.Event('load'));
  assert.equal(e.below.classList.contains('aq-home-media-pending'), false);
  e.motion.destroy();
  assert.equal(e.observers[0].disconnected, true);
  e.motion.refresh();
  assert.equal(e.observers.length, 1);
});

test('home motion handles filtered cards and ignores callbacks after it is destroyed', async () => {
  const e = await homeMediaMotion({ loaded: false });
  const observer = e.observers[0];
  observer.callback([{ target: e.below, isIntersecting: true }], observer);
  e.below.remove();
  const frame = e.document.createElement('div');
  frame.className = 'aq-media'; frame.innerHTML = '<img>';
  frame.getBoundingClientRect = () => ({ top: 1200, bottom: 1400, left: 0, right: 400 });
  e.root.appendChild(frame);
  e.motion.refresh();
  assert.equal(observer.targets.has(e.below), false);
  assert.equal(observer.targets.has(frame), true);
  assert.equal(e.below.classList.contains('aq-home-media-pending'), false);
  e.motion.destroy();
  observer.callback([{ target: frame, isIntersecting: true }], observer);
  assert.equal(frame.classList.contains('aq-home-media-pending'), false);
});

test('home image effects are scoped, use fine-pointer hover and disable motion when requested', () => {
  const css = fs.readFileSync(path.join(__dirname, '../../public/assets/css/afriquinfos.css'), 'utf8');
  const home = fs.readFileSync(path.join(__dirname, '../../resources/js/Pages/Home.vue'), 'utf8');
  assert.match(css, /\.aq-home \.aq-media > img/);
  assert.match(css, /@media \(hover: hover\) and \(pointer: fine\)/);
  assert.match(css, /\.aq-home \.aq-home-media-pending > img/);
  assert.match(css, /opacity: 1 !important; transform: none !important; transition: none !important/);
  assert.match(home, /createHomeMediaMotion\(homeRoot.value\)/);
  assert.match(home, /mediaMotion\?\.destroy\(\)/);
});

function notification() {
  const { document, Event } = parseHTML('<html><body><div class="ad-toast" id="toast" role="status" aria-live="polite" hidden></div></body></html>');
  const timers = new Map();
  let next = 0;
  const ctx = vm.createContext({ document, $: s => document.querySelector(s),
    setTimeout: (callback, delay) => { const id = ++next; timers.set(id, { callback, delay }); return id; },
    clearTimeout: id => timers.delete(id),
  });
  vm.runInContext(source.slice(source.indexOf('  var toastTimer;'), source.indexOf('  function confirmBox(')), ctx);
  return { ctx, document, Event, timers, element: document.querySelector('#toast') };
}

test('admin success notification is green, accessible and visible for ten seconds', () => {
  const n = notification();
  vm.runInContext('toast("Article enregistré", "success")', n.ctx);
  assert.equal(n.element.hidden, false);
  assert.ok(n.element.classList.contains('ad-toast--success'));
  assert.equal(n.element.getAttribute('role'), 'status');
  assert.equal(n.element.getAttribute('aria-live'), 'polite');
  assert.equal(n.element.querySelector('.ad-toast__message').textContent, 'Article enregistré');
  const timer = Array.from(n.timers.values())[0];
  assert.equal(timer.delay, 10000);
  timer.callback();
  assert.equal(n.element.hidden, true);
  assert.equal(n.element.classList.contains('is-on'), false);
});

test('admin errors are red and text is never rendered as executable HTML', () => {
  const n = notification();
  vm.runInContext('toast("<img src=x onerror=alert(1)>", "error")', n.ctx);
  assert.ok(n.element.classList.contains('ad-toast--error'));
  assert.equal(n.element.getAttribute('role'), 'alert');
  assert.equal(n.element.getAttribute('aria-live'), 'assertive');
  assert.equal(n.element.querySelector('.ad-toast__title').textContent, 'Erreur');
  assert.equal(n.element.querySelector('img'), null);
  assert.match(n.element.querySelector('.ad-toast__message').textContent, /<img/);
});

test('the notification close button dismisses immediately and cancels its timer', () => {
  const n = notification();
  vm.runInContext('toast("Message", "success")', n.ctx);
  const close = n.element.querySelector('button');
  assert.equal(close.type, 'button');
  assert.equal(close.getAttribute('aria-label'), 'Fermer la notification');
  close.dispatchEvent(new n.Event('click'));
  assert.equal(n.element.hidden, true);
  assert.equal(n.timers.size, 0);
});

test('each new notification replaces the previous one and gets a fresh ten seconds', () => {
  const n = notification();
  vm.runInContext('toast("Envoi en cours")', n.ctx);
  const old = Array.from(n.timers.keys())[0];
  assert.ok(n.element.classList.contains('ad-toast--info'));
  vm.runInContext('toast("Envoi confirmé", "success")', n.ctx);
  assert.equal(n.timers.has(old), false);
  assert.equal(n.timers.size, 1);
  assert.equal(Array.from(n.timers.values())[0].delay, 10000);
  assert.equal(n.element.querySelectorAll('button').length, 1);
  assert.equal(n.element.classList.contains('ad-toast--info'), false);
});

test('admin notification styling is top-aligned, wide, large and uses success/error colors', () => {
  const css = fs.readFileSync(path.join(__dirname, '../../public/assets/css/admin.css'), 'utf8');
  const style = css.match(/\.ad-toast \{([^}]+)\}/)[1];
  assert.match(style, /top:/);
  assert.doesNotMatch(style, /bottom:/);
  assert.match(style, /width: min\(1200px, calc\(100vw - 2rem\)\)/);
  assert.match(style, /font-size: clamp/);
  assert.match(css, /\.ad-toast--success \{ background: #166534;/);
  assert.match(css, /\.ad-toast--error \{ background: #b91c1c;/);
});

for (const html of [
  '<div>Premier paragraphe<div>Deuxième paragraphe<br>Suite de la ligne</div></div>',
  '<h2>Intertitre</h2><p>Du <strong>gras</strong> et de l’<em>italique</em>.</p><ol start="3"><li>Premier point</li><li>Deuxième point</li></ol><blockquote>Une citation</blockquote>',
  '<p>Avant<img src="/storage/photo.jpg" alt="Photo">Après</p><figure><img src="https://example.test/photo.jpg" alt="Autre photo"><figcaption>Légende</figcaption></figure>',
]) {
  test('editor save and reopening preserve structure: ' + html.slice(0, 45), () => {
    const { document, ctx } = editor();
    const el = document.createElement('div');
    el.innerHTML = html;
    ctx.el = el;
    const saved = vm.runInContext('richBlocks(el)', ctx);
    ctx.saved = saved;
    const reopened = vm.runInContext('bodyHtml(saved)', ctx);
    const result = document.createElement('div');
    result.innerHTML = reopened;
    assert.equal(result.textContent, el.textContent);
    for (const tag of ['h2', 'br', 'strong', 'em', 'ol', 'li', 'blockquote', 'img', 'figcaption']) {
      assert.equal(result.querySelectorAll(tag).length, el.querySelectorAll(tag).length, tag);
    }
    assert.equal(result.querySelector('ol')?.getAttribute('start'), el.querySelector('ol')?.getAttribute('start'));
    ctx.el = result;
    assert.equal(vm.runInContext('bodyHtml(richBlocks(el))', ctx).replace(/<div>|<\/div>/g, ''), reopened.replace(/<div>|<\/div>/g, ''));
  });
}

test('editor preview keeps safe formatting without executable markup or pasted fonts', () => {
  const { document, ctx } = editor();
  ctx.el = document.createElement('div');
  ctx.el.innerHTML = '<p style="font-family:Georgia" onclick="alert(1)">Texte<br><em>Suite</em></p><script>alert(1)</script><img src="javascript:alert(1)" onerror="alert(1)"><a href="javascript:alert(1)">Lien</a>';
  const html = vm.runInContext('bodyHtml(richBlocks(el))', ctx);
  assert.match(html, /<br>/);
  assert.match(html, /<em>Suite<\/em>/);
  assert.doesNotMatch(html, /onclick|onerror|javascript:|<script|font-family/);
});

test('pasted HTML line breaks survive removal of editor-only whitespace styles', () => {
  const { document, ctx } = editor();
  ctx.el = document.createElement('div');
  ctx.el.innerHTML = '<p><span style="white-space:pre-wrap">Premier\n\n<span style="font-weight:700">Second\nSuite</span></span></p>';
  const html = vm.runInContext('bodyHtml(richBlocks(el))', ctx);
  const result = document.createElement('div');
  result.innerHTML = html;
  assert.equal(result.querySelectorAll('br').length, 3);
  assert.equal(result.querySelector('strong').textContent, 'SecondSuite');
  assert.doesNotMatch(html, /style=/);
});

test('plain text paste becomes paragraphs and line breaks before being shown in the editor', () => {
  const { document, ctx } = editor();
  ctx.clipboard = { getData: type => type === 'text/plain' ? 'Premier\r\nSuite\r\n\r\nSecond <test>' : '' };
  const html = vm.runInContext('articlePasteHtml(clipboard)', ctx);
  const result = document.createElement('div');
  result.innerHTML = html;
  assert.equal(result.querySelectorAll('p').length, 2);
  assert.equal(result.querySelectorAll('br').length, 1);
  assert.match(result.textContent, /Second <test>/);
  ctx.el = result;
  assert.equal(vm.runInContext('bodyHtml(richBlocks(el))', ctx), html);
});

test('normal HTML indentation and preformatted code are not converted into extra breaks', () => {
  const { ctx } = editor();
  ctx.html = '<div>\n<p>Premier</p>\n<p>Second</p>\n<pre>Code\nSuite</pre></div>';
  const html = vm.runInContext('cleanArticleHtml(html)', ctx);
  assert.doesNotMatch(html, /<br/);
  assert.match(html, /Code\nSuite/);
});

test('legacy body images use the same storage URL as the public article', () => {
  const { ctx } = editor();
  assert.match(vm.runInContext('bodyHtml(["[img:medias/photo.jpg|Légende]"])', ctx), /src="https:\/\/example.test\/storage\/medias\/photo.jpg"/);
});

function environment(medias = []) {
  const requests = [], toasts = [], toastTypes = [];
  const { document, Event } = parseHTML('<html><head><meta name="csrf-token" content="test"></head><body></body></html>');
  const state = { articles: [{ id: 'a', updated: '2026-11-05T10:00:00Z', title: 'Original' }], revisions: {} };
  for (const key of ['rubriques', 'regions', 'agenda', 'comments', 'subscribers', 'messages', 'debats', 'users', 'flash', 'medias', 'ads', 'campaigns', 'slots', 'settings']) state[key] = [];
  state.medias = medias;
  const ctx = vm.createContext({ S: state, window: { AQ_API: '/admin/api/state' }, KEY: 'test',
    store() {}, toast: (message, type) => { toasts.push(message); toastTypes.push(type); }, clone: x => JSON.parse(JSON.stringify(x)), $: s => document.querySelector(s),
    document, Event, fmtTime: { format: () => '' },
    setTimeout, clearTimeout,
    art: id => state.articles.find(a => a.id === id),
    fetch: (url, options) => new Promise(resolve => requests.push({ body: JSON.parse(options.body), resolve })),
  });
  vm.runInContext(sync, ctx);
  return { ctx, state, requests, document, toasts, toastTypes, send: () => vm.runInContext('sendChanges()', ctx) };
}

function success(request, updated) {
  request.resolve({ ok: true, json: async () => ({ ok: true, articles: [{ id: 'a', updated }], resources: {}, revisions: {}, log: [] }) });
}

test('pasted emphasis and alignment remain semantic without keeping arbitrary CSS', () => {
  const { document, ctx } = editor();
  ctx.el = document.createElement('div');
  ctx.el.innerHTML = '<p style="text-align:center;font-family:Georgia"><span style="font-weight:700;font-style:italic">Important</span></p>';
  const html = vm.runInContext('bodyHtml(richBlocks(el))', ctx);
  assert.match(html, /align="center"/);
  const result = document.createElement('div');
  result.innerHTML = html;
  assert.equal(result.querySelector('strong em, em strong')?.textContent, 'Important');
  assert.doesNotMatch(html, /style=|Georgia/);
});

test('article reading uses responsive justified typography with preserved explicit alignments', () => {
  const files = ['afriquinfos.css', 'admin.css'].map(name => fs.readFileSync(path.join(__dirname, '../../public/assets/css/' + name), 'utf8'));
  for (const css of files) {
    assert.match(css, /--aq-article-size: clamp\(1\.0625rem, 1rem \+ \.25vw, 1\.1875rem\)/);
    assert.match(css, /font-size: max\(1rem, calc\(var\(--aq-article-size\) \+ var\(--aq-article-size-adjustment, 0rem\)\)\)/);
    assert.match(css, /text-align: justify/);
    assert.match(css, /text-justify: inter-word/);
    assert.match(css, /hyphens: auto/);
    assert.match(css, /hyphenate-limit-chars: 6 3 3/);
    assert.doesNotMatch(css, /text-align: justify\s*!important/);
    for (const align of ['left', 'center', 'right', 'justify']) {
      assert.ok(css.includes('[align="' + align + '"]'), align);
    }
  }
});

test('reading size controls change only the adjustment and safely bound stored preferences', () => {
  const vue = fs.readFileSync(path.join(__dirname, '../../resources/js/Pages/Article.vue'), 'utf8');
  const properties = new Map();
  const ctx = vm.createContext({ ref: value => ({ value }), store() {},
    document: { documentElement: { style: { setProperty: (key, value) => properties.set(key, value) } } },
  });
  const start = vue.indexOf('function normalizeReadingSize(');
  assert.notEqual(start, -1);
  vm.runInContext(vue.slice(start, vue.indexOf('const bar =', start)), ctx);
  assert.equal(vm.runInContext('size.value', ctx), 0);
  for (const [input, expected] of [['Infinity', 0], ['invalid', 0], ['100', 3], ['-100', -2], ['1.5', 1]]) {
    ctx.input = input;
    assert.equal(vm.runInContext('normalizeReadingSize(input)', ctx), expected);
  }
  vm.runInContext('size.value = 3; applySize(); bumpSize(1)', ctx);
  assert.equal(properties.get('--aq-article-size-adjustment'), '0.375rem');
  assert.equal(properties.has('--aq-article-size'), false);
  assert.match(vue, /removeProperty\('--aq-article-size-adjustment'\)/);
});

test('article text columns are centered below the full-width cover without centering paragraph text', () => {
  const css = name => fs.readFileSync(path.join(__dirname, '../../public/assets/css/' + name), 'utf8');
  const rules = (text, selector) => Array.from(text.matchAll(/([^{}]+)\{([^{}]*)\}/g))
    .filter(m => m[1].split(',').map(s => s.trim()).includes(selector)).map(m => m[2]).join(' ');
  const publicCss = css('afriquinfos.css'), adminCss = css('admin.css');
  for (const name of ['aq-article__title', 'aq-article__chapo', 'aq-prose', 'aq-tags', 'aq-author', 'aq-comments', 'aq-prevnext']) {
    assert.match(rules(publicCss, '.aq-article .' + name), /margin-inline: auto/, name);
  }
  assert.match(rules(publicCss, '.aq-prose'), /max-width: 680px/);
  assert.match(rules(publicCss, '.aq-prose'), /text-align: justify/);
  for (const selector of ['.ad-preview > h1', '.ad-preview__chapo', '.ad-prose']) {
    assert.match(rules(adminCss, selector), /margin-inline: auto/, selector);
  }
});

test('article typography stays identical in editor, preview and public stylesheet', () => {
  const css = name => fs.readFileSync(path.join(__dirname, '../../public/assets/css/' + name), 'utf8');
  const rule = (text, selector) => Array.from(text.matchAll(/([^{}]+)\{([^{}]*)\}/g))
    .filter(m => m[1].split(',').map(s => s.trim()).includes(selector))
    .map(m => m[2].trim().replace(/\s+/g, ' ')).join(' ');
  const publicCss = css('afriquinfos.css'), adminCss = css('admin.css');
  for (const element of ['p', 'h2', 'blockquote', 'ul', 'ol', 'img', 'figure', 'figcaption', 'table', 'th', 'td']) {
    const expected = rule(publicCss, '.aq-prose ' + element);
    assert.ok(expected, element);
    assert.equal(rule(adminCss, '.ad-prose ' + element), expected, 'preview ' + element);
    assert.equal(rule(adminCss, '.ad-editor__body ' + element), expected, 'editor ' + element);
  }
});

test('editor and filter category options include International / Reste du monde from server state', () => {
  const { document, ctx } = editor();
  ctx.S = { rubriques: [
    { id: 'culture', label: 'Culture', order: 1 },
    { id: 'international', label: 'International / Reste du monde', order: 2, menu: false },
  ] };
  vm.runInContext(source.slice(source.indexOf('  function rubsSorted()'), source.indexOf('  function regsSorted()')), ctx);
  vm.runInContext(source.slice(source.indexOf('  function options('), source.indexOf('  function setErr(')), ctx);
  const select = document.createElement('select');
  select.innerHTML = vm.runInContext('options(rubsSorted().map(function (r) { return { value: r.id, label: r.label }; }), "international")', ctx);
  const option = select.querySelector('option[value="international"]');
  assert.equal(option.textContent, 'International / Reste du monde');
  assert.ok(option.hasAttribute('selected'));
});

test('article publication choices match server roles without silently downgrading existing articles', () => {
  const { document } = parseHTML('<html><body></body></html>');
  const ctx = vm.createContext({ STATUS: { brouillon: 'Brouillon', relecture: 'En relecture', publie: 'Publié', programme: 'Programmé' } });
  vm.runInContext(source.slice(source.indexOf('  function canPublishArticles('), source.indexOf('  var ROLES =')), ctx);
  for (const role of ['journaliste', 'contributeur']) {
    ctx.role = role;
    const select = document.createElement('select');
    select.innerHTML = vm.runInContext('articleStatusOptions(role, "brouillon")', ctx);
    assert.equal(select.querySelectorAll('option').length, role === 'journaliste' ? 3 : 2);
    assert.equal(!!select.querySelector('option[value="programme"]'), role === 'journaliste');
    select.innerHTML = vm.runInContext('articleStatusOptions(role, "programme")', ctx);
    if (role === 'journaliste') assert.ok(select.querySelector('option[value="programme"][selected]'));
    else {
      assert.equal(select.querySelector('option[value="programme"]'), null);
      assert.ok(select.querySelector('option[value=""][selected]'));
    }
    select.innerHTML = vm.runInContext('articleStatusOptions(role, "publie")', ctx);
    assert.equal(select.querySelector('option[value="publie"]'), null);
    assert.ok(select.querySelector('option[value=""][selected]'));
    assert.equal(vm.runInContext('canPublishArticles(role)', ctx), false);
    assert.equal(vm.runInContext('canScheduleArticles(role)', ctx), role === 'journaliste');
    assert.equal(vm.runInContext('canSetArticleStatus(role, "publie")', ctx), false);
  }
  assert.equal(vm.runInContext('canPublishArticles("chef") && canPublishArticles("admin")', ctx), true);
});

test('due schedules appear as published without mutating saved status or timestamps', () => {
  const article = { status: 'programme', date: '2026-11-06T12:00:00Z', updated: '2026-11-06T10:00:00Z' };
  const before = JSON.stringify(article);
  const ctx = vm.createContext({ article, due: Date.parse(article.date) });
  vm.runInContext(source.slice(source.indexOf('  function canPublishArticles('), source.indexOf('  var ROLES =')), ctx);
  assert.equal(vm.runInContext('articleStatus(article, due - 1)', ctx), 'programme');
  assert.equal(vm.runInContext('articleStatus(article, due)', ctx), 'publie');
  assert.equal(vm.runInContext('articleStatus(article, due + 1)', ctx), 'publie');
  assert.equal(JSON.stringify(article), before);
  article.date = null;
  assert.equal(vm.runInContext('articleStatus(article, due)', ctx), 'programme');
  article.status = 'relecture';
  assert.equal(vm.runInContext('articleStatus(article, due)', ctx), 'relecture');
});

test('only acknowledged schedules can keep their date after the deadline', async () => {
  const e = environment();
  e.state.articles[0].status = 'programme';
  e.state.articles[0].date = '2026-11-06T12:00:00Z';
  e.state.articles[0].updated = '2026-11-05T10:01:00Z';
  assert.equal(vm.runInContext('scheduleAlreadyConfirmed(S.articles[0])', e.ctx), false);
  e.send();
  success(e.requests[0], '2026-11-05T10:01:01Z');
  await wait();
  assert.equal(vm.runInContext('scheduleAlreadyConfirmed(S.articles[0])', e.ctx), true);
  e.state.articles[0].date = '2026-11-06T11:00:00Z';
  assert.equal(vm.runInContext('scheduleAlreadyConfirmed(S.articles[0])', e.ctx), false);
});

test('unchanged or duplicate editor submissions do not alter the article or start another send', () => {
  const e = environment();
  e.state.articles[0].status = 'brouillon';
  Object.assign(e.ctx, { a: e.state.articles[0], isNew: false, dirty: false });
  vm.runInContext(source.slice(source.indexOf('    function persist('), source.indexOf('    function doSave()')), e.ctx);
  const before = JSON.stringify(e.state.articles[0]);
  assert.equal(vm.runInContext('persist("brouillon", "enregistrement")', e.ctx), false);
  assert.match(e.toasts.at(-1), /Aucune modification/);
  vm.runInContext('beginArticleSubmission(S.articles[0])', e.ctx);
  assert.equal(vm.runInContext('persist("brouillon", "enregistrement")', e.ctx), false);
  assert.match(e.toasts.at(-1), /déjà en cours/);
  assert.equal(JSON.stringify(e.state.articles[0]), before);
  assert.equal(e.requests.length, 0);
});

test('upload payload avoids duplicating image bytes while preserving the local preview and acknowledgement', async () => {
  const e = environment();
  const data = 'data:image/png;base64,' + 'A'.repeat(1000);
  const body = '<p>Avant<img src="' + data + '" data-mid="new" alt="Photo">Après</p>';
  e.state.medias.push({ id: 'new', data });
  e.state.articles[0].body = [body];
  e.state.articles[0].updated = '2026-11-05T10:01:00Z';
  vm.runInContext('beginArticleSubmission(S.articles[0])', e.ctx);
  e.send();
  const payload = e.requests[0].body;
  assert.equal(JSON.stringify(payload).split(data).length - 1, 1);
  assert.match(payload.articles[0].body[0], /data-mid="new"/);
  assert.doesNotMatch(payload.articles[0].body[0], /base64/);
  assert.equal(e.state.articles[0].body[0], body);
  e.requests[0].resolve({ ok: true, json: async () => ({ ok: true,
    articles: [{ id: 'a', updated: '2026-11-05T10:01:01Z' }],
    resources: { medias: [{ id: 'new', data: '/storage/new.png' }] }, revisions: { medias: 'version1' }, log: [],
  }) });
  await wait();
  assert.equal(vm.runInContext('hasPendingChanges()', e.ctx), false);
  assert.equal(e.state.articles[0].body[0], body);
  e.send();
  assert.equal(e.requests.length, 1);
});

test('article submission locks both buttons and prevents duplicate sends until acknowledgement', async () => {
  const e = environment();
  e.document.body.innerHTML = '<form id="edForm"><select id="edStatus"><option value="brouillon" selected>Brouillon</option></select><input id="edDate" value="2026-11-06T12:00"><button id="edSave">Enregistrer</button><button id="edPublish">Envoyer</button></form>';
  Object.assign(e.ctx, { ME: { role: 'contributeur' }, a: e.state.articles[0], src: e.state.articles[0], isNew: false });
  vm.runInContext(source.slice(source.indexOf('  function canPublishArticles('), source.indexOf('  var ROLES =')), e.ctx);
  vm.runInContext(source.slice(source.indexOf('    function publishLabel()'), source.indexOf('    function markDirty()')), e.ctx);
  e.document.querySelector('#edForm').addEventListener('aq:article-submission', () => vm.runInContext('publishLabel()', e.ctx));
  vm.runInContext('publishLabel()', e.ctx);
  e.state.articles[0].updated = '2026-11-05T10:01:00Z';
  assert.equal(vm.runInContext('beginArticleSubmission(S.articles[0])', e.ctx), true);
  assert.equal(vm.runInContext('beginArticleSubmission(S.articles[0])', e.ctx), false);
  assert.ok(e.document.querySelector('#edSave').disabled);
  assert.ok(e.document.querySelector('#edPublish').disabled);
  assert.equal(e.document.querySelector('#edForm').getAttribute('aria-busy'), 'true');
  e.send(); e.send();
  assert.equal(e.requests.length, 1);
  success(e.requests[0], '2026-11-05T10:01:01Z');
  await wait();
  assert.equal(e.requests.length, 1);
  assert.equal(e.document.querySelector('#edSave').disabled, false);
  assert.equal(e.document.querySelector('#edPublish').disabled, false);
  assert.equal(e.document.querySelector('#edForm').getAttribute('aria-busy'), 'false');
  assert.equal(e.toastTypes.at(-1), 'success');
});

test('an incomplete article acknowledgement cannot mark an article as saved', async () => {
  const e = environment();
  e.state.articles[0].updated = '2026-11-05T10:01:00Z';
  vm.runInContext('beginArticleSubmission(S.articles[0])', e.ctx);
  e.send();
  e.requests[0].resolve({ ok: true, json: async () => ({ ok: true, articles: [], resources: {}, revisions: {}, log: [] }) });
  await wait();
  assert.equal(vm.runInContext('SYNCED.a', e.ctx), '2026-11-05T10:00:00Z');
  assert.equal(vm.runInContext('hasPendingChanges()', e.ctx), true);
  assert.equal(vm.runInContext('editorSubmission', e.ctx), null);
  assert.match(e.toasts.at(-1), /Confirmation incomplète/);
});

test('server validation errors release the submission lock without losing pending text', async () => {
  const e = environment();
  e.state.articles[0].body = ['Texte conservé'];
  e.state.articles[0].updated = '2026-11-05T10:01:00Z';
  vm.runInContext('beginArticleSubmission(S.articles[0])', e.ctx);
  e.send();
  e.requests[0].resolve({ ok: false, status: 422, json: async () => ({ message: 'Validation échouée', errors: { 'articles.0.title': ['Le titre est trop long.'] } }) });
  await wait();
  assert.match(e.toasts.at(-1), /Le titre est trop long/);
  assert.equal(e.toastTypes.at(-1), 'error');
  assert.equal(vm.runInContext('editorSubmission', e.ctx), null);
  assert.equal(vm.runInContext('hasPendingChanges()', e.ctx), true);
  assert.deepEqual(e.state.articles[0].body, ['Texte conservé']);
});

test('a queued article stays locked until its own version is confirmed', async () => {
  const e = environment();
  e.state.articles[0].updated = '2026-11-05T10:01:00Z';
  e.send();
  e.state.articles[0].updated = '2026-11-05T10:02:00Z';
  vm.runInContext('beginArticleSubmission(S.articles[0])', e.ctx);
  e.send();
  success(e.requests[0], '2026-11-05T10:01:01Z');
  await wait();
  assert.notEqual(vm.runInContext('editorSubmission', e.ctx), null);
  assert.equal(e.requests.length, 2);
  success(e.requests[1], '2026-11-05T10:02:01Z');
  await wait();
  assert.equal(vm.runInContext('editorSubmission', e.ctx), null);
});

test('an earlier failed request releases a queued submission without resending or losing it', async () => {
  const e = environment();
  e.state.articles[0].updated = '2026-11-05T10:01:00Z';
  e.send();
  e.state.articles[0].title = 'Nouvelle version conservée';
  e.state.articles[0].updated = '2026-11-05T10:02:00Z';
  vm.runInContext('beginArticleSubmission(S.articles[0])', e.ctx);
  e.send();
  e.requests[0].resolve({ ok: false, status: 409, json: async () => ({ error: 'Conflit' }) });
  await wait();
  assert.equal(e.requests.length, 1);
  assert.equal(vm.runInContext('editorSubmission', e.ctx), null);
  assert.equal(vm.runInContext('hasPendingChanges()', e.ctx), true);
  assert.equal(e.state.articles[0].title, 'Nouvelle version conservée');
});

for (const status of [401, 419]) {
  test('expired session ' + status + ' retains pending content and permits recovery', async () => {
    const e = environment();
    e.state.articles[0].updated = '2026-11-05T10:01:00Z';
    vm.runInContext('beginArticleSubmission(S.articles[0])', e.ctx);
    e.send();
    e.requests[0].resolve({ ok: false, status, json: async () => ({ message: 'Session expired' }) });
    await wait();
    assert.match(e.toasts.at(-1), /Session expirée.*copiez votre texte/);
    assert.equal(vm.runInContext('editorSubmission', e.ctx), null);
    assert.equal(vm.runInContext('hasPendingChanges()', e.ctx), true);
    assert.equal(e.requests.length, 1);
  });
}

test('failed saves and in-flight saves remain pending until the server confirms them', async () => {
  const e = environment();
  assert.equal(vm.runInContext('hasPendingChanges()', e.ctx), false);
  e.state.articles[0].updated = '2026-11-05T10:01:00Z';
  e.send();
  assert.equal(vm.runInContext('hasPendingChanges()', e.ctx), true);
  e.requests[0].resolve({ ok: false, status: 403, json: async () => ({ message: 'Programmation refusée' }) });
  await wait();
  assert.equal(vm.runInContext('hasPendingChanges()', e.ctx), true);
  e.send();
  success(e.requests[1], '2026-11-05T10:01:01Z');
  await wait();
  assert.equal(vm.runInContext('hasPendingChanges()', e.ctx), false);
});

test('opening admin does not resend unchanged data', () => {
  const e = environment();
  e.send();
  assert.equal(e.requests.length, 0);
});

test('saving an article does not send team or subscribers', async () => {
  const e = environment();
  e.state.articles[0].updated = '2026-11-05T10:01:00Z';
  e.send();
  assert.equal(e.requests[0].body.users, undefined);
  assert.equal(e.requests[0].body.subscribers, undefined);
  assert.equal(e.requests[0].body.articles[0].baseUpdated, '2026-11-05T10:00:00Z');
  success(e.requests[0], '2026-11-05T10:01:01Z');
  await wait();
  e.send();
  assert.equal(e.requests.length, 1);
});

test('in-flight edits are serialized and not marked as saved prematurely', async () => {
  const e = environment();
  e.state.articles[0].updated = '2026-11-05T10:01:00Z';
  e.send();
  e.state.articles[0].title = 'Another edit';
  e.state.articles[0].updated = '2026-11-05T10:02:00Z';
  e.send();
  assert.equal(e.requests.length, 1);
  success(e.requests[0], '2026-11-05T10:01:01Z');
  await wait();
  assert.equal(e.requests.length, 2);
  assert.equal(e.requests[1].body.articles[0].title, 'Another edit');
  assert.equal(e.requests[1].body.articles[0].baseUpdated, '2026-11-05T10:01:01Z');
  success(e.requests[1], '2026-11-05T10:02:01Z');
  await wait();
});

test('media saves only send changed entries with their original versions', () => {
  const original = { id: 'old', data: '/storage/old.jpg', name: 'Original' };
  const e = environment([original]);
  e.state.medias.push({ id: 'new', data: '/storage/new.jpg' });
  e.send();
  const payload = e.requests[0].body;
  assert.equal(payload.mediaSync, 'delta');
  assert.deepEqual(payload.medias, [{ id: 'new', data: '/storage/new.jpg' }]);
  assert.deepEqual(payload.mediaBase, { new: null });
  assert.deepEqual(payload.mediaDeleted, []);
});

test('media acknowledgements preserve concurrent additions and in-flight local changes', async () => {
  const old = { id: 'old', data: '/storage/old.jpg' };
  const own = { id: 'own', data: 'data:image/png;base64,AAAA' };
  const colleague = { id: 'colleague', data: '/storage/colleague.jpg' };
  const pending = { id: 'pending', data: '/storage/pending.jpg' };
  const e = environment([old]);
  e.state.medias.push(own);
  e.send();
  e.state.medias.push(pending);
  e.send();
  const canonical = [old, colleague, { ...own, data: '/storage/own.jpg' }];
  e.requests[0].resolve({ ok: true, json: async () => ({ ok: true, articles: [], resources: { medias: canonical }, revisions: { medias: 'new-version' }, log: [] }) });
  await wait();
  assert.deepEqual(Array.from(e.state.medias, m => m.id), ['old', 'colleague', 'own', 'pending']);
  assert.equal(e.requests.length, 2);
  assert.deepEqual(e.requests[1].body.medias, [pending]);
  assert.deepEqual(e.requests[1].body.mediaDeleted, []);
  assert.equal(e.state.medias.find(m => m.id === 'own').data, '/storage/own.jpg');
});

test('media deletions are explicit and include the original entry', () => {
  const old = { id: 'old', data: '/storage/old.jpg' };
  const e = environment([old]);
  e.state.medias = [];
  e.send();
  assert.deepEqual(e.requests[0].body.medias, []);
  assert.deepEqual(e.requests[0].body.mediaDeleted, ['old']);
  assert.deepEqual(e.requests[0].body.mediaBase, { old });
});

test('a rejected request remains pending without an automatic retry loop', async () => {
  const e = environment();
  e.state.articles[0].updated = '2026-11-05T10:01:00Z';
  e.send();
  e.requests[0].resolve({ ok: false, status: 409, json: async () => ({ error: 'Conflict' }) });
  await wait();
  assert.equal(e.requests.length, 1);
  assert.equal(vm.runInContext('SYNCED.a', e.ctx), '2026-11-05T10:00:00Z');
  assert.equal(e.state.articles[0].updated, '2026-11-05T10:01:00Z');
});
