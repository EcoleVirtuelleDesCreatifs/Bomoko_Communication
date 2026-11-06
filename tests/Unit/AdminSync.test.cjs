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
  const requests = [];
  const state = { articles: [{ id: 'a', updated: '2026-11-05T10:00:00Z', title: 'Original' }], revisions: {} };
  for (const key of ['rubriques', 'regions', 'agenda', 'comments', 'subscribers', 'messages', 'debats', 'users', 'flash', 'medias', 'ads', 'campaigns', 'slots', 'settings']) state[key] = [];
  state.medias = medias;
  const ctx = vm.createContext({ S: state, window: { AQ_API: '/admin/api/state' }, KEY: 'test',
    store() {}, toast() {}, clone: x => JSON.parse(JSON.stringify(x)), $: () => null,
    document: { querySelector: () => ({ content: 'test' }) }, fmtTime: { format: () => '' },
    setTimeout, clearTimeout,
    art: id => state.articles.find(a => a.id === id),
    fetch: (url, options) => new Promise(resolve => requests.push({ body: JSON.parse(options.body), resolve })),
  });
  vm.runInContext(sync, ctx);
  return { ctx, state, requests, send: () => vm.runInContext('sendChanges()', ctx) };
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
