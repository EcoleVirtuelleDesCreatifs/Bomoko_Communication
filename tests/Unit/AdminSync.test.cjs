const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../../public/assets/js/admin.js'), 'utf8');
const sync = source.slice(source.indexOf('  var saveTimer,'), source.indexOf('  function log(what)'));
const wait = () => new Promise(resolve => setTimeout(resolve, 20));

function environment() {
  const requests = [];
  const state = { articles: [{ id: 'a', updated: '2026-11-05T10:00:00Z', title: 'Original' }], revisions: {} };
  for (const key of ['rubriques', 'regions', 'agenda', 'comments', 'subscribers', 'messages', 'debats', 'users', 'flash', 'medias', 'ads', 'campaigns', 'slots', 'settings']) state[key] = [];
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
