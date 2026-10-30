/* =========================================================
   Afriquinfos — Administration (maquette fonctionnelle)
   Les données de départ viennent de ../assets/js/data.js.
   Les modifications sont gardées dans ce navigateur (localStorage) :
   en production, chaque action appelle l'API du CMS.
   ========================================================= */
(function () {
  'use strict';

  var D = window.AQ_DATA;
  var KEY = 'aq-admin-v1';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===================== Outils ===================== */
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fr(s) { return esc(s).replace(/ ([:;?!%»])/g, ' $1').replace(/« /g, '« '); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function slugify(s) { return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80); }
  function initials(n) { return String(n || '?').split(/[\s,]+/).filter(Boolean).slice(0, 2).map(function (p) { return p.charAt(0).toUpperCase(); }).join(''); }
  function plural(n, one, many) { return n + ' ' + (n > 1 ? many : one); }
  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  var fmtDate = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  var fmtDateTime = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  var fmtTime = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' });
  var fmtNum = new Intl.NumberFormat('fr-FR');
  function dshort(iso) { return iso ? fmtDate.format(new Date(iso)) : '—'; }
  function dlong(iso) { return iso ? fmtDateTime.format(new Date(iso)) : '—'; }
  function rel(iso) {
    var min = (Date.now() - new Date(iso).getTime()) / 60000;
    if (min < 0) { var f = -min; return f < 60 ? 'dans ' + Math.round(f) + ' min' : f < 1440 ? 'dans ' + Math.round(f / 60) + ' h' : 'dans ' + Math.round(f / 1440) + ' j'; }
    if (min < 1) return 'à l’instant';
    if (min < 60) return 'il y a ' + Math.round(min) + ' min';
    if (min < 1440) return 'il y a ' + Math.floor(min / 60) + ' h';
    if (min < 10080) return 'il y a ' + Math.floor(min / 1440) + ' j';
    return dshort(iso);
  }
  function toLocalInput(iso) { var d = new Date(iso); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ===================== Données ===================== */
  var STATUS = { publie: 'Publié', programme: 'Programmé', relecture: 'En relecture', brouillon: 'Brouillon', corbeille: 'Corbeille' };
  var ROLES = { admin: 'Administrateur', chef: 'Rédacteur en chef', journaliste: 'Journaliste', contributeur: 'Contributeur' };
  var PH = ['ink', 'orange', 'savane', 'lagune', 'sable', 'night', 'rust', 'stadium'];

  function seed() {
    var now = Date.now();
    var arts = D.articles.map(function (a) {
      var x = clone(a);
      x.status = 'publie'; x.updated = a.date; x.caption = a.img; x.meta = a.chapo.slice(0, 155); x.slug = a.id; x.une = !!a.une;
      return x;
    });
    arts.push(
      { id: 'brouillon-zlecaf-guide', rub: 'economie', region: null, country: 'Zlecaf', ph: 'rust', img: 'Conteneurs sur un quai', caption: 'Conteneurs sur un quai', views: 0, title: 'Zlecaf : le guide pratique pour les PME exportatrices', chapo: 'Règles d’origine, certificats, tarifs : ce que les petites entreprises doivent savoir avant d’exporter dans la zone.', author: 'Awa Koné', date: new Date(now - 3600e3 * 5).toISOString(), updated: new Date(now - 3600e3 * 2).toISOString(), read: 4, tags: ['Commerce', 'PME'], body: ['La zone de libre-échange continentale ouvre de nouveaux marchés aux PME.', '## Les étapes', 'Vérifier l’origine des produits, obtenir le certificat, déclarer en douane.'], status: 'brouillon', meta: '', slug: 'zlecaf-guide-pme' },
      { id: 'relecture-elections-benin', rub: 'politique', region: 'afrique-de-l-ouest', country: 'Bénin', ph: 'ink', img: 'Bureau de vote', caption: 'Bureau de vote à Cotonou', views: 0, title: 'Bénin : ce qu’il faut savoir avant les élections générales', chapo: 'Calendrier, candidatures, enjeux : notre guide pour comprendre le scrutin.', author: 'Moussa Diop', date: new Date(now - 3600e3 * 26).toISOString(), updated: new Date(now - 3600e3 * 3).toISOString(), read: 6, tags: ['Élections', 'Bénin'], body: ['Les Béninois sont appelés aux urnes dans quelques mois.', '## Le calendrier', 'Les candidatures seront déposées auprès de la commission électorale.'], status: 'relecture', meta: 'Calendrier, candidatures, enjeux : notre guide pour comprendre les élections générales au Bénin.', slug: 'benin-elections-generales-guide' },
      { id: 'programme-can-tirage', rub: 'sports', region: null, country: 'Football', ph: 'stadium', img: 'Tirage au sort', caption: 'Cérémonie du tirage au sort', views: 0, title: 'CAN : tout savoir sur le tirage au sort de la phase finale', chapo: 'Chapeaux, têtes de série, groupes possibles : le guide avant la cérémonie.', author: 'Jean-Baptiste Mbarga', date: new Date(now + 3600e3 * 44).toISOString(), updated: new Date(now - 3600e3).toISOString(), read: 5, tags: ['Football', 'CAN'], body: ['Le tirage au sort de la phase finale aura lieu dans deux jours.', '## Les chapeaux', 'Les têtes de série sont désignées selon le classement continental.'], status: 'programme', meta: 'Chapeaux, têtes de série, groupes possibles : tout savoir avant le tirage au sort de la CAN.', slug: 'can-tirage-au-sort-phase-finale' }
    );
    var people = [
      { id: 'u1', name: 'Awa Koné', email: 'awa.kone@afriquinfos.com', role: 'admin', status: 'actif', last: new Date(now).toISOString() },
      { id: 'u2', name: 'Moussa Diop', email: 'moussa.diop@afriquinfos.com', role: 'chef', status: 'actif', last: new Date(now - 3600e3 * 2).toISOString() },
      { id: 'u3', name: 'Jean-Baptiste Mbarga', email: 'jb.mbarga@afriquinfos.com', role: 'journaliste', status: 'actif', last: new Date(now - 3600e3 * 6).toISOString() },
      { id: 'u4', name: 'Nadia Benali', email: 'nadia.benali@afriquinfos.com', role: 'journaliste', status: 'actif', last: new Date(now - 3600e3 * 20).toISOString() },
      { id: 'u5', name: 'Fatou Ndiaye', email: 'fatou.ndiaye@afriquinfos.com', role: 'contributeur', status: 'actif', last: new Date(now - 3600e3 * 50).toISOString() },
      { id: 'u6', name: 'Rédaction Afriquinfos', email: 'redaction@afriquinfos.com', role: 'chef', status: 'actif', last: new Date(now - 3600e3 * 8).toISOString() }
    ];
    var names = ['Kouassi Yao', 'Aminata Traoré', 'Ibrahim Sow', 'Grace Mensah', 'Youssef Benali', 'Claire Mukendi', 'Samuel Okafor', 'Mariam Diallo', 'Eric Nkurunziza', 'Fatima Zahra', 'Paul Ekwueme', 'Aïcha Bamba'];
    var cmTexts = ['Article très clair, merci pour ce décryptage.', 'Il manque le point de vue des syndicats dans cette analyse.', 'Enfin un média qui parle de ce sujet sans détour.', 'Gagnez de l’argent facilement, cliquez ici !!!', 'Pouvez-vous préciser la source du chiffre cité au deuxième paragraphe ?', 'Très bon article, à partager.', 'Je ne suis pas d’accord avec la conclusion, les chiffres de l’an dernier disent autre chose.', 'Promo exceptionnelle sur nos produits, visitez notre site.'];
    var cmStatus = ['attente', 'attente', 'approuve', 'spam', 'attente', 'approuve', 'attente', 'spam'];
    var comments = cmTexts.map(function (t, i) {
      var art = arts[i % 10];
      return { id: 'c' + i, articleId: art.id, author: names[i], email: slugify(names[i]).replace('-', '.') + '@exemple.com', text: t, date: new Date(now - 3600e3 * (i * 3 + 1)).toISOString(), status: cmStatus[i], reply: '' };
    });
    var countries = ["Côte d'Ivoire", 'Sénégal', 'Cameroun', 'France', 'Mali', 'Bénin', 'Togo', 'Gabon', 'Maroc', 'RD Congo', 'Burkina Faso', 'Guinée'];
    var subscribers = names.concat(['Moussa Keita', 'Linda Ouattara', 'Hervé Tchoumi', 'Salif Konaté', 'Nafi Sarr', 'Joël Agbo']).map(function (n, i) {
      return { id: 's' + i, name: n, email: slugify(n).replace('-', '.') + '@exemple.com', country: countries[i % countries.length], date: new Date(now - 86400e3 * (i * 4 + 2)).toISOString(), status: i % 9 === 8 ? 'desinscrit' : 'actif' };
    });
    var medias = arts.filter(function (a, i) { return i < 16; }).map(function (a, i) {
      return { id: 'm' + i, name: slugify(a.img) + '.jpg', ph: a.ph, alt: a.img, w: 1600, h: 1000, size: 180 + i * 23, date: a.date };
    });
    return migrate({
      v: 1,
      articles: arts,
      rubriques: Object.keys(D.rubriques).map(function (k, i) { return { id: k, label: D.rubriques[k].label, tagline: D.rubriques[k].tagline, menu: k !== 'portraits', order: i }; }),
      regions: Object.keys(D.regions).map(function (k, i) { return { id: k, label: D.regions[k], order: i }; }),
      agenda: clone(D.agenda),
      flash: [],
      debat: Object.assign(clone(D.debat), { votes: clone(D.debat.base) }),
      comments: comments,
      subscribers: subscribers,
      campaigns: [
        { id: 'k1', subject: 'Le brief panafricain du 26 octobre', date: new Date(now - 86400e3).toISOString(), status: 'envoyee', recipients: 15 },
        { id: 'k2', subject: 'Le brief panafricain du 25 octobre', date: new Date(now - 86400e3 * 2).toISOString(), status: 'envoyee', recipients: 15 }
      ],
      ads: [
        { id: 'a1', slot: 'Billboard accueil', format: '970 × 250', advertiser: '[Annonceur A]', start: '2026-10-20', end: '2026-11-20', url: 'https://exemple.com', status: 'active' },
        { id: 'a2', slot: 'Pavé article', format: '300 × 250', advertiser: '[Annonceur B]', start: '2026-11-01', end: '2026-11-30', url: 'https://exemple.com', status: 'programme' },
        { id: 'a3', slot: 'Skyscraper rubrique', format: '160 × 600', advertiser: '', start: '', end: '', url: '', status: 'libre' },
        { id: 'a4', slot: 'Habillage accueil', format: '1920 × 1080', advertiser: '', start: '', end: '', url: '', status: 'libre' },
        { id: 'a5', slot: 'Bannière newsletter', format: '600 × 200', advertiser: '[Annonceur C]', start: '2026-10-15', end: '2026-12-15', url: 'https://exemple.com', status: 'active' }
      ],
      medias: medias,
      users: people,
      settings: { name: 'Afriquinfos', slogan: 'Ni totems, ni tabous. L’actualité panafricaine', emailRedaction: 'redaction@afriquinfos.com', emailPub: 'pub@afriquinfos.com', facebook: 'https://www.facebook.com/afriquinfoscom/', x: 'https://x.com/AfriquinfosActu', linkedin: '', youtube: '', perPage: 12, moderation: true, maintenance: false, timezone: 'Africa/Abidjan' },
      log: [{ at: new Date(now - 3600e3).toISOString(), who: 'Jean-Baptiste Mbarga', what: 'a programmé « CAN : tout savoir sur le tirage au sort de la phase finale »' },
            { at: new Date(now - 3600e3 * 2).toISOString(), who: 'Awa Koné', what: 'a enregistré le brouillon « Zlecaf : le guide pratique pour les PME exportatrices »' },
            { at: new Date(now - 3600e3 * 3).toISOString(), who: 'Moussa Diop', what: 'a envoyé en relecture « Bénin : ce qu’il faut savoir avant les élections générales »' }]
    });
  }

  function day(off) { var d = new Date(); d.setDate(d.getDate() + (off || 0)); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  // met à niveau les données enregistrées par une version précédente de la maquette
  function migrate(o) {
    if (!o.debats) {
      var d = o.debat || Object.assign(clone(D.debat), { votes: clone(D.debat.base) });
      o.debats = [
        { id: 'd-cours', question: d.question, pour: d.pour, contre: d.contre, votes: d.votes || clone(D.debat.base), start: day(-2), end: day(4) },
        { id: 'd-arch1', question: 'Faut-il rendre le service civique obligatoire pour les jeunes ?', pour: { text: 'Un service civique d’un an créerait du lien entre les régions et donnerait une première expérience à des milliers de jeunes sans emploi.', who: 'Mamadou Sarr, sociologue' }, contre: { text: 'Imposer un an de service retarde l’entrée dans les études et l’emploi, sans budget garanti pour encadrer les volontaires.', who: 'Grace Atangana, économiste' }, votes: { pour: 1240, contre: 1610 }, start: day(-9), end: day(-3) },
        { id: 'd-arch2', question: 'Les clubs africains doivent-ils retenir leurs jeunes talents plus longtemps ?', pour: { text: 'Un départ à 17 ans appauvrit les championnats locaux et expose les joueurs à des carrières brisées loin de chez eux.', who: 'Ousmane Cissé, entraîneur' }, contre: { text: 'Les transferts financent les centres de formation : sans eux, les clubs ne survivraient pas.', who: 'Christelle Ngo, agente de joueurs' }, votes: { pour: 2105, contre: 980 }, start: day(-16), end: day(-10) },
        { id: 'd-prog', question: 'Le paiement mobile doit-il remplacer l’argent liquide d’ici 2030 ?', pour: { text: 'Le mobile money a déjà bancarisé des millions de personnes : généraliser son usage réduirait la fraude et les coûts.', who: 'Kofi Asante, entrepreneur' }, contre: { text: 'Sans réseau fiable ni protection des données, supprimer le liquide exclurait les zones rurales et les plus âgés.', who: 'Salimata Koné, juriste' }, votes: { pour: 0, contre: 0 }, start: day(5), end: day(11) }
      ];
      delete o.debat;
    }
    if (!o.slots) {
      o.slots = [
        { id: 'billboard', name: 'Billboard accueil', where: 'Accueil, sous la rubrique Politique', w: 970, h: 250, format: '970 × 250' },
        { id: 'pave', name: 'Pavé article', where: 'Colonne de droite des articles', w: 300, h: 250, format: '300 × 250' },
        { id: 'sky', name: 'Skyscraper rubrique', where: 'Pages rubriques, colonne de droite', w: 160, h: 600, format: '160 × 600' },
        { id: 'habillage', name: 'Habillage accueil', where: 'Fond de page de l’accueil', w: 1920, h: 1080, format: '1920 × 1080' },
        { id: 'mobile', name: 'Bannière mobile', where: 'Haut des pages sur téléphone', w: 320, h: 100, format: '320 × 100' },
        { id: 'newsletter', name: 'Bannière newsletter', where: 'Le brief panafricain', w: 600, h: 200, format: '600 × 200' }
      ];
      var map = { 'Billboard accueil': 'billboard', 'Pavé article': 'pave', 'Skyscraper rubrique': 'sky', 'Habillage accueil': 'habillage', 'Bannière newsletter': 'newsletter' };
      o.ads = (o.ads || []).filter(function (a) { return a.advertiser && a.start; }).map(function (a) {
        return { id: a.id, name: '', advertiser: a.advertiser, slot: map[a.slot] || 'billboard', start: a.start, end: a.end, url: a.url || 'https://exemple.com', visual: '', alt: '', paused: false };
      });
      o.ads.push({ id: 'a-old', name: 'Rentrée scolaire', advertiser: '[Annonceur D]', slot: 'pave', start: day(-60), end: day(-31), url: 'https://exemple.com', visual: '', alt: '', paused: false });
    }
    if (!o.history) {
      // historique de démonstration : publications quotidiennes avant le premier article réel
      var first = o.articles.filter(function (a) { return a.status === 'publie'; }).map(function (a) { return a.date.slice(0, 10); }).sort()[0] || day(0);
      var rates = { 'Awa Koné': 0.35, 'Moussa Diop': 0.5, 'Jean-Baptiste Mbarga': 0.6, 'Nadia Benali': 0.55, 'Fatou Ndiaye': 0.25, 'Rédaction Afriquinfos': 0.7 };
      var seedR = 7, rnd = function () { seedR = (seedR * 16807) % 2147483647; return (seedR - 1) / 2147483646; };
      var start = new Date(first + 'T12:00:00'); start.setDate(start.getDate() - 760);
      var counts = {};
      Object.keys(rates).forEach(function (name) {
        var arr = [], d = new Date(start);
        for (var i = 0; i < 760; i++) {
          var wd = d.getDay(), f = wd === 0 || wd === 6 ? 0.35 : 1.18, season = 1 + 0.18 * Math.sin(i / 58);
          arr.push(Math.floor(rates[name] * f * season + rnd()));
          d.setDate(d.getDate() + 1);
        }
        counts[name] = arr;
      });
      var sd = start.getFullYear() + '-' + String(start.getMonth() + 1).padStart(2, '0') + '-' + String(start.getDate()).padStart(2, '0');
      o.history = { start: sd, end: first, counts: counts };
    }
    if (!o.flashV2) {
      // un flash renvoie désormais vers un article
      o.flash = D.flash.map(function (f, i) { return typeof f === 'string' ? null : { id: 'f' + i, articleId: f.id, text: f.text, auto: true, active: true }; }).filter(Boolean);
      o.flashV2 = true;
    }
    return o;
  }

  var S;
  try { S = JSON.parse(store(KEY) || 'null'); } catch (e) { S = null; }
  if (!S || S.v !== 1) S = seed(); else migrate(S);
  // les articles programmés dont l'heure est passée sont publiés
  S.articles.forEach(function (a) { if (a.status === 'programme' && new Date(a.date).getTime() <= Date.now()) a.status = 'publie'; });
  var saveTimer;
  function save() { clearTimeout(saveTimer); saveTimer = setTimeout(function () { store(KEY, JSON.stringify(S)); }, 120); }
  function log(what) { S.log.unshift({ at: new Date().toISOString(), who: ME ? ME.name : 'Système', what: what }); S.log = S.log.slice(0, 40); save(); }

  function art(id) { return S.articles.filter(function (a) { return a.id === id; })[0]; }
  function rubLabel(id) { var r = S.rubriques.filter(function (x) { return x.id === id; })[0]; return r ? r.label : id; }
  function regLabel(id) { var r = S.regions.filter(function (x) { return x.id === id; })[0]; return r ? r.label : ''; }
  function rubsSorted() { return S.rubriques.slice().sort(function (a, b) { return a.order - b.order; }); }
  function regsSorted() { return S.regions.slice().sort(function (a, b) { return a.order - b.order; }); }
  function pending() { return S.comments.filter(function (c) { return c.status === 'attente'; }).length; }
  function unreadMsg() { return (S.messages || []).filter(function (m) { return !m.read; }).length; }
  function statusPill(s) { return '<span class="ad-status ad-status--' + s + '">' + esc(STATUS[s] || s) + '</span>'; }
  function ph(name, img, ini) {
    if (img) return '<div class="ad-ph"><img src="' + esc(img) + '" alt=""></div>';
    return '<div class="ad-ph ad-ph--' + esc(name || 'ink') + '">' + (ini ? '<span class="ad-ph__ini">' + esc(ini) + '</span>' : '') + '</div>';
  }
  function mediaById(id) { return S.medias.filter(function (m) { return m.id === id; })[0]; }
  function coverOf(a) { var m = a.mediaId && mediaById(a.mediaId); return m ? ph(m.ph, m.data) : ph(a.ph, a.src || null, a.person && a.person.initials); }

  /* ===================== Composants ===================== */
  var toastTimer;
  function toast(msg) {
    var t = $('#toast'); t.textContent = msg; t.classList.add('is-on');
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.classList.remove('is-on'); }, 2600);
  }
  function confirmBox(title, text, okLabel, onOk) {
    $('#confirmTitle').textContent = title; $('#confirmText').textContent = text;
    var ok = $('#confirmOk'); ok.textContent = okLabel || 'Confirmer';
    var modal = bootstrap.Modal.getOrCreateInstance($('#confirmModal'));
    var fresh = ok.cloneNode(true); ok.parentNode.replaceChild(fresh, ok);
    fresh.addEventListener('click', function () { modal.hide(); onOk(); });
    modal.show();
  }
  function openDrawer(title, html, bind) {
    $('#drawerTitle').textContent = title; $('#drawerBody').innerHTML = html;
    var oc = bootstrap.Offcanvas.getOrCreateInstance($('#drawer'));
    oc.show(); if (bind) bind($('#drawerBody'), function () { oc.hide(); });
  }
  function openBig(title, html, bind) {
    $('#bigTitle').textContent = title; $('#bigBody').innerHTML = html;
    var m = bootstrap.Modal.getOrCreateInstance($('#bigModal'));
    m.show(); if (bind) bind($('#bigBody'), function () { m.hide(); });
  }
  function pagehead(title, sub, actions) {
    return '<div class="ad-pagehead"><div><h1 class="ad-mark">' + esc(title) + '</h1>' + (sub ? '<p>' + sub + '</p>' : '') + '</div>' + (actions ? '<div class="ad-pagehead__actions">' + actions + '</div>' : '') + '</div>';
  }
  function field(id, label, input, hint) {
    return '<div class="ad-field"><label for="' + id + '">' + esc(label) + '</label>' + input + (hint ? '<p class="ad-hint">' + hint + '</p>' : '') + '<p class="ad-error" id="' + id + 'Err"></p></div>';
  }
  function options(list, value, empty) {
    return (empty !== undefined ? '<option value="">' + esc(empty) + '</option>' : '') + list.map(function (o) { return '<option value="' + esc(o.value) + '"' + (String(o.value) === String(value) ? ' selected' : '') + '>' + esc(o.label) + '</option>'; }).join('');
  }
  function setErr(scope, id, msg) {
    var el = $('#' + id, scope), er = $('#' + id + 'Err', scope);
    if (el) el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (er) er.textContent = msg || '';
    return !msg;
  }
  document.addEventListener('input', function (e) {
    var el = e.target; if (!el.id || el.getAttribute('aria-invalid') !== 'true') return;
    el.setAttribute('aria-invalid', 'false'); var er = document.getElementById(el.id + 'Err'); if (er) er.textContent = '';
  });
  function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim()); }

  /* ===================== Session ===================== */
  var ME = null;
  function currentUser() { var id = null; try { id = sessionStorage.getItem('aq-admin-user'); } catch (e) {} return S.users.filter(function (u) { return u.id === id; })[0] || null; }

  function bindLogin() {
    var form = $('#loginForm');
    $('#lgShow').addEventListener('click', function () {
      var p = $('#lgPass'), on = p.type === 'password'; p.type = on ? 'text' : 'password';
      this.setAttribute('aria-pressed', String(on)); this.setAttribute('aria-label', on ? 'Masquer le mot de passe' : 'Afficher le mot de passe');
      this.innerHTML = '<i class="bi bi-eye' + (on ? '-slash' : '') + '" aria-hidden="true"></i>';
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = $('#lgEmail').value.trim().toLowerCase(), pass = $('#lgPass').value;
      var ok = setErr(form, 'lgEmail', validEmail(email) ? '' : 'Saisissez une adresse e-mail valide.');
      ok = setErr(form, 'lgPass', pass.length >= 6 ? '' : 'Le mot de passe doit contenir au moins 6 caractères.') && ok;
      if (!ok) return;
      var u = S.users.filter(function (x) { return x.email.toLowerCase() === email; })[0];
      if (!u) { setErr(form, 'lgEmail', 'Aucun compte ne correspond à cette adresse. Essayez awa.kone@afriquinfos.com.'); return; }
      if (u.status !== 'actif') { setErr(form, 'lgEmail', 'Ce compte n’est pas encore activé : acceptez d’abord l’invitation reçue par e-mail.'); return; }
      try { sessionStorage.setItem('aq-admin-user', u.id); } catch (er) {}
      u.last = new Date().toISOString(); save();
      start();
    });
  }
  function logout() {
    try { sessionStorage.removeItem('aq-admin-user'); } catch (e) {}
    ME = null; $('#app').hidden = true; $('#login').hidden = false; $('#lgPass').value = ''; $('#lgPass').focus();
  }

  /* ===================== Navigation ===================== */
  var NAV = [
    ['Pilotage', [['tableau-de-bord', 'bi-grid-1x2', 'Tableau de bord'], ['statistiques', 'bi-bar-chart-line', 'Statistiques']]],
    ['Contenus', [['articles', 'bi-file-earmark-text', 'Articles'], ['nouvel-article', 'bi-pencil-square', 'Nouvel article'], ['portraits', 'bi-person-badge', 'Portraits'], ['rubriques', 'bi-diagram-3', 'Rubriques et régions'], ['agenda', 'bi-calendar-event', 'Agenda'], ['flash', 'bi-lightning-charge', 'Flash info'], ['debat', 'bi-chat-square-quote', 'Débats de la semaine'], ['medias', 'bi-images', 'Médiathèque']]],
    ['Audience', [['commentaires', 'bi-chat-left-text', 'Commentaires'], ['messages', 'bi-inbox', 'Messages'], ['newsletter', 'bi-envelope-paper', 'Newsletter'], ['publicite', 'bi-badge-ad', 'Publicité']]],
    ['Administration', [['equipe', 'bi-people', 'Équipe'], ['parametres', 'bi-gear', 'Paramètres']]]
  ];
  var TITLES = {}; NAV.forEach(function (g) { g[1].forEach(function (i) { TITLES[i[0]] = i[2]; }); }); TITLES.editeur = 'Modifier l’article';

  function renderNav(route) {
    var cur = route === 'editeur' ? 'articles' : route;
    $('#nav').innerHTML = NAV.map(function (g) {
      return '<p class="ad-nav__group">' + g[0] + '</p>' + g[1].map(function (i) {
        var cnt = i[0] === 'commentaires' ? pending() : i[0] === 'messages' ? unreadMsg() : 0;
        var badge = cnt ? '<span class="ad-badge" aria-label="' + cnt + ' en attente">' + cnt + '</span>' : '';
        return '<a href="#' + i[0] + '"' + (i[0] === cur ? ' aria-current="page"' : '') + '><i class="bi ' + i[1] + '" aria-hidden="true"></i>' + i[2] + badge + '</a>';
      }).join('');
    }).join('');
    $('#sideUser').innerHTML = '<span class="ad-avatar ad-avatar--sm" aria-hidden="true">' + initials(ME.name) + '</span><div><strong>' + esc(ME.name) + '</strong><span>' + esc(ROLES[ME.role]) + '</span></div>' +
      '<button type="button" class="ad-iconbtn ad-iconbtn--light" id="logoutBtn" aria-label="Se déconnecter" title="Se déconnecter"><i class="bi bi-box-arrow-right" aria-hidden="true"></i></button>';
    $('#logoutBtn').addEventListener('click', logout);
  }

  var VIEWS = {};
  var editing = null;      // id de l'article ouvert dans l'éditeur, ou null pour un nouveau
  var editorPreset = null; // rubrique imposée à la création (portraits)
  var dirty = false;
  var listState = { tab: 'all', q: '', rub: '', reg: '', author: '', sort: 'date', dir: -1, page: 1, sel: {} };

  function go(route) { if (location.hash.slice(1) === route) render(); else location.hash = route; }
  function routeFromHash() { var h = location.hash.replace(/^#/, ''); return VIEWS[h] || h === 'nouvel-article' ? h : 'tableau-de-bord'; }
  var lastRoute = null;
  function render() {
    var r = routeFromHash();
    if (dirty && lastRoute === 'editeur' && r !== 'editeur') {
      var target = r;
      history.replaceState(null, '', '#editeur');
      confirmBox('Quitter sans enregistrer ?', 'Les modifications de cet article seront perdues.', 'Quitter sans enregistrer', function () { dirty = false; location.hash = target; });
      return;
    }
    if (r === 'nouvel-article') { editing = null; r = 'editeur'; history.replaceState(null, '', '#editeur'); }
    lastRoute = r;
    renderNav(r);
    $('#crumb').innerHTML = 'Administration <span aria-hidden="true">/</span> <b>' + esc(TITLES[r] || '') + '</b>';
    document.title = (TITLES[r] || 'Administration') + ' — Afriquinfos';
    var v = $('#view'); v.innerHTML = ''; VIEWS[r](v);
    window.scrollTo(0, 0);
    closeSide();
  }
  window.addEventListener('hashchange', render);
  window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

  /* ===================== Tableau de bord ===================== */
  VIEWS['tableau-de-bord'] = function (v) {
    var pub = S.articles.filter(function (a) { return a.status === 'publie'; });
    var prog = S.articles.filter(function (a) { return a.status === 'programme'; }).sort(function (a, b) { return a.date.localeCompare(b.date); });
    var draft = S.articles.filter(function (a) { return a.status === 'brouillon' || a.status === 'relecture'; });
    var subs = S.subscribers.filter(function (s) { return s.status === 'actif'; }).length;
    var hour = new Date().getHours();
    // lectures quotidiennes : données de démonstration, stables d'un jour à l'autre
    var days = [], max = 0;
    for (var i = 13; i >= 0; i--) {
      var d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - i);
      var seedN = d.getDate() * 37 + d.getMonth() * 11;
      var val = Math.round(4200 + (seedN % 23) * 140 + (d.getDay() === 0 || d.getDay() === 6 ? -900 : 300) + (13 - i) * 60);
      days.push({ d: d, v: val }); if (val > max) max = val;
    }
    var week = days.slice(7).reduce(function (s, x) { return s + x.v; }, 0);
    var counts = rubsSorted().map(function (r) { return { label: r.label, n: S.articles.filter(function (a) { return a.rub === r.id && a.status === 'publie'; }).length }; }).filter(function (x) { return x.n; }).sort(function (a, b) { return b.n - a.n; });
    var cmax = Math.max.apply(null, counts.map(function (c) { return c.n; }));
    var recent = S.articles.filter(function (a) { return a.status !== 'corbeille'; }).sort(function (a, b) { return b.updated.localeCompare(a.updated); }).slice(0, 6);
    var top = pub.slice().sort(function (a, b) { return b.views - a.views; }).slice(0, 5);
    var todo = [];
    if (pending()) todo.push(['bi-chat-left-text', plural(pending(), 'commentaire attend', 'commentaires attendent') + ' une modération', '#commentaires']);
    S.articles.filter(function (a) { return a.status === 'relecture'; }).forEach(function (a) { todo.push(['bi-eye', 'À relire : « ' + a.title + ' »', 'edit:' + a.id]); });
    prog.slice(0, 2).forEach(function (a) { todo.push(['bi-clock', 'Programmé ' + rel(a.date) + ' : « ' + a.title + ' »', 'edit:' + a.id]); });
    var nowDay = new Date().toISOString().slice(0, 10);
    S.agenda.filter(function (e) { return e.date >= nowDay; }).sort(function (a, b) { return a.date.localeCompare(b.date); }).slice(0, 1).forEach(function (e) { todo.push(['bi-calendar-event', 'Prochain événement : ' + e.title + ' (' + dshort(e.date) + ')', '#agenda']); });

    // graphique en barres (SVG)
    var W = 720, H = 240, pl = 44, pr = 8, pt = 16, pb = 28, step = Math.ceil(max / 4 / 1000) * 1000, top_ = step * 4;
    var bw = (W - pl - pr) / days.length, svg = '';
    for (var g = 0; g <= 4; g++) {
      var y = pt + (H - pt - pb) * (1 - g / 4);
      svg += '<line class="grid" x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y + '" y2="' + y + '"/><text class="axis" x="' + (pl - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + (g * step / 1000) + ' k</text>';
    }
    days.forEach(function (x, k) {
      var h = (H - pt - pb) * x.v / top_, bx = pl + k * bw + bw * 0.18, w = bw * 0.64, by = H - pb - h;
      svg += '<path class="bar" data-i="' + k + '" d="M' + bx + ',' + (H - pb) + 'V' + (by + 4) + 'Q' + bx + ',' + by + ' ' + (bx + 4) + ',' + by + 'H' + (bx + w - 4) + 'Q' + (bx + w) + ',' + by + ' ' + (bx + w) + ',' + (by + 4) + 'V' + (H - pb) + 'Z"/>';
      if (k % 2 === 1 || k === days.length - 1) svg += '<text class="axis" x="' + (bx + w / 2) + '" y="' + (H - 8) + '" text-anchor="middle">' + x.d.getDate() + '/' + (x.d.getMonth() + 1) + '</text>';
      svg += '<rect class="hit" data-i="' + k + '" x="' + (pl + k * bw) + '" y="' + pt + '" width="' + bw + '" height="' + (H - pt - pb) + '"/>';
    });
    var last = days[days.length - 1], lh = (H - pt - pb) * last.v / top_;
    svg += '<text class="val" x="' + (pl + (days.length - 1) * bw + bw / 2) + '" y="' + (H - pb - lh - 8) + '" text-anchor="middle">' + fmtNum.format(last.v) + '</text>';

    v.innerHTML = pagehead((hour < 18 ? 'Bonjour, ' : 'Bonsoir, ') + ME.name.split(' ')[0], 'Voici l’état de la rédaction, ' + new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()) + '.',
      '<a class="ad-btn ad-btn--outline" href="#medias"><i class="bi bi-upload" aria-hidden="true"></i>Importer un visuel</a><a class="ad-btn ad-btn--primary" href="#nouvel-article"><i class="bi bi-plus-lg" aria-hidden="true"></i>Nouvel article</a>') +
      '<div class="ad-grid ad-grid--kpi mb-4">' +
        '<a href="#articles" data-tab="publie" class="ad-panel ad-kpi"><p class="ad-kpi__label">Articles publiés</p><p class="ad-kpi__value">' + pub.length + '</p><p class="ad-kpi__hint">Dont ' + pub.filter(function (a) { return a.une; }).length + ' à la une</p></a>' +
        '<a href="#articles" data-tab="programme" class="ad-panel ad-kpi"><p class="ad-kpi__label">Programmés</p><p class="ad-kpi__value">' + prog.length + '</p><p class="ad-kpi__hint">' + (prog[0] ? 'Prochain ' + rel(prog[0].date) : 'Aucun article en attente') + '</p></a>' +
        '<a href="#articles" data-tab="relecture" class="ad-panel ad-kpi"><p class="ad-kpi__label">Brouillons et relectures</p><p class="ad-kpi__value">' + draft.length + '</p><p class="ad-kpi__hint">' + S.articles.filter(function (a) { return a.status === 'relecture'; }).length + ' en relecture</p></a>' +
        '<a href="#commentaires" class="ad-panel ad-kpi ad-kpi--dark"><p class="ad-kpi__label">Commentaires à modérer</p><p class="ad-kpi__value">' + pending() + '</p><p class="ad-kpi__hint">' + fmtNum.format(subs) + ' abonnés à la newsletter</p></a>' +
      '</div>' +
      '<div class="ad-grid ad-grid--2 mb-4">' +
        '<section class="ad-panel" aria-labelledby="hChart"><div class="ad-panel__head"><h2 id="hChart">Lectures des 14 derniers jours</h2><span class="ad-muted tnum" style="font-size:.8125rem">' + fmtNum.format(week) + ' sur 7 jours</span></div>' +
          '<div class="ad-panel__body"><div class="ad-chart" id="chart"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Lectures quotidiennes sur 14 jours, de ' + fmtNum.format(Math.min.apply(null, days.map(function (x) { return x.v; }))) + ' à ' + fmtNum.format(max) + '">' + svg + '</svg><div class="ad-tip" id="tip"></div></div>' +
          '<details class="ad-datatable mt-3"><summary>Voir les données</summary><div class="ad-tablewrap"><table class="ad-table"><thead><tr><th>Jour</th><th class="num">Lectures</th></tr></thead><tbody>' +
            days.map(function (x) { return '<tr><td>' + dshort(x.d.toISOString()) + '</td><td class="num">' + fmtNum.format(x.v) + '</td></tr>'; }).join('') + '</tbody></table></div></details></div>' +
          '<div class="ad-panel__foot">Données de démonstration : à relier à votre outil de mesure d’audience.</div></section>' +
        '<section class="ad-panel" aria-labelledby="hRub"><div class="ad-panel__head"><h2 id="hRub">Articles publiés par rubrique</h2></div><div class="ad-panel__body"><div class="ad-hbars">' +
          counts.map(function (c) { return '<div class="ad-hbar"><span>' + esc(c.label) + '</span><div class="ad-hbar__track"><div class="ad-hbar__fill" style="width:' + (c.n / cmax * 100) + '%"></div></div><b>' + c.n + '</b></div>'; }).join('') +
        '</div></div></section>' +
      '</div>' +
      '<div class="ad-grid ad-grid--2 mb-4">' +
        '<section class="ad-panel" aria-labelledby="hRecent"><div class="ad-panel__head"><h2 id="hRecent">Dernières modifications</h2><a href="#articles">Tous les articles</a></div><div class="ad-tablewrap"><table class="ad-table"><thead><tr><th>Article</th><th>Statut</th><th>Modifié</th></tr></thead><tbody>' +
          recent.map(function (a) { return '<tr><td><div class="ad-title-cell"><a href="#" data-edit="' + a.id + '">' + fr(a.title) + '</a><small>' + esc(rubLabel(a.rub)) + ', ' + esc(a.author) + '</small></div></td><td>' + statusPill(a.status) + '</td><td class="ad-muted" style="white-space:nowrap">' + rel(a.updated) + '</td></tr>'; }).join('') +
        '</tbody></table></div></section>' +
        '<section class="ad-panel" aria-labelledby="hTodo"><div class="ad-panel__head"><h2 id="hTodo">À traiter</h2></div>' +
          (todo.length ? '<ul class="ad-list">' + todo.map(function (t) { var href = t[2].indexOf('edit:') === 0 ? '#" data-edit="' + t[2].slice(5) : t[2]; return '<li><span class="ad-list__icon"><i class="bi ' + t[0] + '" aria-hidden="true"></i></span><div class="ad-list__main"><a href="' + href + '">' + fr(t[1]) + '</a></div></li>'; }).join('') + '</ul>' : '<div class="ad-empty"><strong>Tout est à jour</strong>Aucune tâche en attente.</div>') +
        '</section>' +
      '</div>' +
      '<div class="ad-grid ad-grid--halves">' +
        '<section class="ad-panel" aria-labelledby="hTop"><div class="ad-panel__head"><h2 id="hTop">Les plus lus</h2></div><ul class="ad-list">' +
          top.map(function (a, k) { return '<li><span class="ad-rank">' + (k + 1) + '</span><div class="ad-list__main"><a href="#" data-edit="' + a.id + '">' + fr(a.title) + '</a><small class="tnum">' + fmtNum.format(a.views) + ' lectures</small></div></li>'; }).join('') + '</ul></section>' +
        '<section class="ad-panel" aria-labelledby="hLog"><div class="ad-panel__head"><h2 id="hLog">Activité de l’équipe</h2></div><ul class="ad-list">' +
          S.log.slice(0, 5).map(function (l) { return '<li><span class="ad-avatar ad-avatar--sm" aria-hidden="true">' + initials(l.who) + '</span><div class="ad-list__main"><strong>' + esc(l.who) + '</strong><small>' + fr(l.what) + ', ' + rel(l.at) + '</small></div></li>'; }).join('') + '</ul></section>' +
      '</div>' +
      '<section class="ad-panel" aria-labelledby="hSubs"><div class="ad-panel__head"><h2 id="hSubs">Derniers abonnés à la newsletter</h2><a href="#newsletter">Gérer les abonnés</a></div>' +
        (S.subscribers.length ? '<div class="ad-tablewrap"><table class="ad-table"><thead><tr><th>Abonné</th><th>Pays</th><th>Inscription</th><th>Statut</th></tr></thead><tbody>' +
          S.subscribers.slice().sort(function (a, b) { return (b.since||'').localeCompare(a.since||''); }).slice(0, 6).map(function (s) { return '<tr><td><div class="ad-title-cell"><strong>' + esc(s.name) + '</strong><small>' + esc(s.email) + '</small></div></td><td>' + esc(s.country || '—') + '</td><td class="ad-muted" style="white-space:nowrap">' + rel(s.since) + '</td><td><span class="ad-status ad-status--' + (s.status === 'actif' ? 'active' : 'libre') + '">' + (s.status === 'actif' ? 'Abonné' : 'Désinscrit') + '</span></td></tr>'; }).join('') +
        '</tbody></table></div><div class="ad-panel__foot">' + fmtNum.format(subs) + ' abonné' + (subs > 1 ? 's' : '') + ' actif' + (subs > 1 ? 's' : '') + ' sur ' + S.subscribers.length + ' inscription' + (S.subscribers.length > 1 ? 's' : '') + '.</div>' : '<div class="ad-empty"><strong>Aucun abonné</strong>Les inscriptions au formulaire newsletter du site apparaîtront ici.</div>') +
      '</section>';

    // infobulle du graphique
    var tip = $('#tip'), chart = $('#chart');
    $$('.hit', chart).forEach(function (h) {
      function show() {
        var k = +h.getAttribute('data-i'), x = days[k];
        $$('.bar', chart).forEach(function (b) { b.classList.toggle('is-dim', +b.getAttribute('data-i') !== k); });
        var r = h.getBoundingClientRect(), c = chart.getBoundingClientRect(), bar = $('.bar[data-i="' + k + '"]', chart).getBoundingClientRect();
        tip.innerHTML = fmtNum.format(x.v) + ' lectures<small>' + new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(x.d) + '</small>';
        tip.style.left = (r.left - c.left + r.width / 2) + 'px'; tip.style.top = (bar.top - c.top - 8) + 'px'; tip.classList.add('is-on');
      }
      h.addEventListener('mouseenter', show); h.addEventListener('click', show);
    });
    chart.addEventListener('mouseleave', function () { tip.classList.remove('is-on'); $$('.bar', chart).forEach(function (b) { b.classList.remove('is-dim'); }); });
    $$('[data-tab]', v).forEach(function (a) { a.addEventListener('click', function () { listState.tab = a.getAttribute('data-tab'); listState.page = 1; }); });
  };

  /* ===================== Statistiques de publication ===================== */
  var EXT = '__ext';
  var MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  var MONTHS_L = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  function parseDay(s) { return new Date(s + 'T12:00:00'); }
  function fmtDay(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function mondayOf(s) { var d = parseDay(s), k = (d.getDay() + 6) % 7; d.setDate(d.getDate() - k); return fmtDay(d); }
  function isoWeek(s) { var d = parseDay(s); d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7); var w1 = new Date(d.getFullYear(), 0, 4, 12); return 1 + Math.round(((d - w1) / 864e5 - 3 + (w1.getDay() + 6) % 7) / 7); }
  function bucketOf(s, g) { return g === 'jour' ? s : g === 'semaine' ? mondayOf(s) : s.slice(0, 7); }
  function buckets(g, n, offset) {
    var out = [], t = parseDay(day(0));
    for (var i = n - 1 + (offset || 0); i >= (offset || 0); i--) {
      var d = new Date(t);
      if (g === 'jour') d.setDate(d.getDate() - i);
      else if (g === 'semaine') { d = parseDay(mondayOf(day(0))); d.setDate(d.getDate() - 7 * i); }
      else { d = new Date(t.getFullYear(), t.getMonth() - i, 1, 12); }
      var key = bucketOf(fmtDay(d), g), b = { key: key, current: i === 0 };
      if (g === 'jour') { b.label = d.getDate() + '/' + (d.getMonth() + 1); b.long = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(d); }
      else if (g === 'semaine') { var e = new Date(d); e.setDate(e.getDate() + 6); b.label = 'S' + isoWeek(key); b.long = 'Semaine ' + isoWeek(key) + ', du ' + d.getDate() + (d.getMonth() !== e.getMonth() ? ' ' + MONTHS[d.getMonth()] : '') + ' au ' + e.getDate() + ' ' + MONTHS[e.getMonth()]; }
      else { b.label = MONTHS[d.getMonth()] + (d.getMonth() === 0 || i === n - 1 + (offset || 0) ? ' ' + String(d.getFullYear()).slice(2) : ''); b.long = MONTHS_L[d.getMonth()] + ' ' + d.getFullYear(); }
      out.push(b);
    }
    return out;
  }
  // toutes les publications : historique de démonstration + articles publiés dans l'administration
  function publications() {
    var list = [], h = S.history, now = new Date();
    if (h) Object.keys(h.counts).forEach(function (name) {
      var d = parseDay(h.start);
      h.counts[name].forEach(function (n) { var k = fmtDay(d); for (var i = 0; i < n; i++) list.push({ author: name, day: k }); d.setDate(d.getDate() + 1); });
    });
    S.articles.forEach(function (a) { if (a.status === 'publie' && new Date(a.date) <= now) list.push({ author: a.author, day: fmtDay(new Date(a.date)) }); });
    return list;
  }
  function memberKey(author) { return S.users.some(function (u) { return u.name === author; }) ? author : EXT; }
  function niceStep(v) { var steps = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000]; for (var i = 0; i < steps.length; i++) if (steps[i] * 4 >= v) return steps[i]; return Math.ceil(v / 4000) * 1000; }

  function barChart(id, items, unit) {
    var W = 720, H = 240, pl = 36, pr = 8, pt = 18, pb = 28, max = Math.max(1, Math.max.apply(null, items.map(function (x) { return x.v; })));
    var step = niceStep(max), top = step * 4, bw = (W - pl - pr) / items.length, every = items.length > 16 ? 5 : 1, svg = '';
    svg += '<defs><pattern id="' + id + 'H" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" class="hatch-bg"/><rect width="3" height="6" class="hatch-fg"/></pattern></defs>';
    for (var g = 0; g <= 4; g++) { var y = pt + (H - pt - pb) * (1 - g / 4); svg += '<line class="grid" x1="' + pl + '" x2="' + (W - pr) + '" y1="' + y + '" y2="' + y + '"/><text class="axis" x="' + (pl - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + g * step + '</text>'; }
    items.forEach(function (x, k) {
      var h = (H - pt - pb) * x.v / top, bx = pl + k * bw + bw * 0.16, w = bw * 0.68, by = H - pb - h, r = Math.min(4, w / 2, h);
      if (x.v) svg += '<path class="bar' + (x.current ? ' is-current' : '') + '"' + (x.current ? ' style="fill:url(#' + id + 'H)"' : '') + ' data-i="' + k + '" d="M' + bx + ',' + (H - pb) + 'V' + (by + r) + 'Q' + bx + ',' + by + ' ' + (bx + r) + ',' + by + 'H' + (bx + w - r) + 'Q' + (bx + w) + ',' + by + ' ' + (bx + w) + ',' + (by + r) + 'V' + (H - pb) + 'Z"/>';
      if ((items.length - 1 - k) % every === 0) svg += '<text class="axis' + (every === 1 && (items.length - 1 - k) % 2 ? ' odd' : '') + '" x="' + (bx + w / 2) + '" y="' + (H - 8) + '" text-anchor="middle">' + esc(x.label) + '</text>';
      svg += '<rect class="hit" data-i="' + k + '" x="' + (pl + k * bw) + '" y="' + pt + '" width="' + bw + '" height="' + (H - pt - pb) + '"/>';
    });
    var vals = items.map(function (x) { return x.v; });
    return '<div class="ad-chart" id="' + id + '"><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(unit) + ' : de ' + Math.min.apply(null, vals) + ' à ' + Math.max.apply(null, vals) + ' articles par période">' + svg + '</svg><div class="ad-tip"></div></div>';
  }
  function bindChart(id, items) {
    var chart = $('#' + id), tip = $('.ad-tip', chart);
    $$('.hit', chart).forEach(function (hEl) {
      function show() {
        var k = +hEl.getAttribute('data-i'), x = items[k], c = chart.getBoundingClientRect(), r = hEl.getBoundingClientRect(), bar = $('.bar[data-i="' + k + '"]', chart);
        $$('.bar', chart).forEach(function (b) { b.classList.toggle('is-dim', +b.getAttribute('data-i') !== k); });
        tip.innerHTML = plural(x.v, 'article publié', 'articles publiés') + '<small>' + esc(x.long) + (x.current ? ' (en cours)' : '') + '</small>';
        tip.style.left = (r.left - c.left + r.width / 2) + 'px'; tip.style.top = ((bar ? bar.getBoundingClientRect().top : r.bottom) - c.top - 8) + 'px'; tip.classList.add('is-on');
      }
      hEl.addEventListener('mouseenter', show); hEl.addEventListener('click', show);
    });
    chart.addEventListener('mouseleave', function () { tip.classList.remove('is-on'); $$('.bar', chart).forEach(function (b) { b.classList.remove('is-dim'); }); });
  }
  function spark(vals) {
    var w = 72, h = 24, max = Math.max(1, Math.max.apply(null, vals)), bw = w / vals.length;
    return '<svg class="ad-spark" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" aria-hidden="true">' + vals.map(function (v, i) { var bh = Math.max(v ? 2 : 1, h * v / max); return '<rect x="' + (i * bw + bw * 0.15) + '" y="' + (h - bh) + '" width="' + (bw * 0.7) + '" height="' + bh + '"' + (v ? '' : ' class="z"') + '/>'; }).join('') + '</svg>';
  }

  var statState = { g: 'semaine', who: '', sort: 'total' };
  var GRAN = { jour: { n: 30, unit: 'jour', per: 'par jour', range: '30 derniers jours', prev: 'aux 30 jours précédents', cur: 'Aujourd’hui' }, semaine: { n: 12, unit: 'semaine', per: 'par semaine', range: '12 dernières semaines', prev: 'aux 12 semaines précédentes', cur: 'Cette semaine' }, mois: { n: 12, unit: 'mois', per: 'par mois', range: '12 derniers mois', prev: 'aux 12 mois précédents', cur: 'Ce mois-ci' } };

  VIEWS.statistiques = function (v) {
    var pubs = publications();
    // index : membre → jour → nombre
    var idx = {}; pubs.forEach(function (p) { var m = memberKey(p.author); (idx[m] = idx[m] || {})[p.day] = (idx[m][p.day] || 0) + 1; });
    var members = S.users.map(function (u) { return { key: u.name, name: u.name, role: ROLES[u.role], status: u.status }; });
    if (idx[EXT]) members.push({ key: EXT, name: 'Contributeurs extérieurs', role: 'Tribunes et invités' });
    function series(keys, g, bks) {
      var map = {}; bks.forEach(function (b) { map[b.key] = 0; });
      keys.forEach(function (k) { var days = idx[k] || {}; Object.keys(days).forEach(function (d) { var bk = bucketOf(d, g); if (bk in map) map[bk] += days[d]; }); });
      return bks.map(function (b) { return map[b.key]; });
    }
    function sum(a) { return a.reduce(function (s, x) { return s + x; }, 0); }
    function last(m, g) { var days = Object.keys(idx[m] || {}).sort(); return days.length ? days[days.length - 1] : null; }

    function draw() {
      var g = statState.g, G = GRAN[g], bks = buckets(g, G.n), prevB = buckets(g, G.n, G.n);
      var allKeys = members.map(function (m) { return m.key; });
      var sel = statState.who ? [statState.who] : allKeys;
      var selName = statState.who ? members.filter(function (m) { return m.key === statState.who; })[0].name : 'Toute l’équipe';
      var vals = series(sel, g, bks), prev = sum(series(sel, g, prevB)), tot = sum(vals);
      var full = vals.slice(0, -1), avg = full.length ? sum(full) / full.length : 0;
      var best = 0; vals.forEach(function (x, i) { if (x > vals[best]) best = i; });
      var delta = prev ? Math.round((tot - prev) / prev * 100) : null;
      var items = bks.map(function (b, i) { return { label: b.label, long: b.long, v: vals[i], current: b.current }; });
      var teamTot = tot && !statState.who ? tot : sum(series(allKeys, g, bks));
      var tDay = bucketOf(day(0), 'jour'), tWeek = bucketOf(day(0), 'semaine'), tMonth = bucketOf(day(0), 'mois');
      function countIn(k, gran, key) { var days = idx[k] || {}, n = 0; Object.keys(days).forEach(function (d) { if (bucketOf(d, gran) === key) n += days[d]; }); return n; }
      var rows = members.map(function (m) {
        var s = series([m.key], g, bks), t = sum(s);
        return { m: m, s: s, total: t, avg: s.length > 1 ? sum(s.slice(0, -1)) / (s.length - 1) : 0, today: countIn(m.key, 'jour', tDay), week: countIn(m.key, 'semaine', tWeek), month: countIn(m.key, 'mois', tMonth), last: last(m.key) };
      }).sort(function (a, b) { var k = statState.sort; return b[k] - a[k] || a.m.name.localeCompare(b.m.name); });
      var teamRow = { total: sum(rows.map(function (r) { return r.total; })), today: sum(rows.map(function (r) { return r.today; })), week: sum(rows.map(function (r) { return r.week; })), month: sum(rows.map(function (r) { return r.month; })), s: series(allKeys, g, bks) };
      teamRow.avg = teamRow.s.length > 1 ? sum(teamRow.s.slice(0, -1)) / (teamRow.s.length - 1) : 0;
      function f1(x) { return x.toFixed(1).replace('.', ',').replace(',0', ''); }
      function sortTh(k, label) { var on = statState.sort === k; return '<th class="num"><button type="button" class="ad-sort" data-ss="' + k + '"' + (on ? ' aria-sort="descending"' : '') + '>' + label + (on ? ' <i class="bi bi-arrow-down" aria-hidden="true"></i>' : '') + '</button></th>'; }

      v.innerHTML = pagehead('Statistiques de publication', 'Articles publiés par journaliste et pour toute l’équipe.', '<button type="button" class="ad-btn ad-btn--outline" id="stExport"><i class="bi bi-download" aria-hidden="true"></i>Exporter (CSV)</button>') +
        '<div class="ad-filters mb-4"><div class="ad-seg" role="group" aria-label="Regrouper">' + ['jour', 'semaine', 'mois'].map(function (k) { return '<button type="button" data-g="' + k + '" aria-pressed="' + (g === k) + '">Par ' + k + '</button>'; }).join('') + '</div>' +
          '<label class="visually-hidden" for="stWho">Membre</label><select class="ad-select" id="stWho">' + options([{ value: '', label: 'Toute l’équipe' }].concat(members.map(function (m) { return { value: m.key, label: m.name }; })), statState.who) + '</select>' +
          '<span class="ad-muted" style="font-size:.8125rem">' + G.range + '</span></div>' +
        '<div class="ad-grid ad-grid--kpi mb-4">' +
          '<div class="ad-panel ad-kpi ad-kpi--dark"><p class="ad-kpi__label">Publiés, ' + G.range + '</p><p class="ad-kpi__value">' + fmtNum.format(tot) + '</p><p class="ad-kpi__hint">' + esc(selName) + '</p></div>' +
          '<div class="ad-panel ad-kpi"><p class="ad-kpi__label">Moyenne ' + G.per + '</p><p class="ad-kpi__value">' + f1(avg) + '</p><p class="ad-kpi__hint">Hors période en cours</p></div>' +
          '<div class="ad-panel ad-kpi"><p class="ad-kpi__label">' + (g === 'mois' ? 'Meilleur mois' : g === 'semaine' ? 'Meilleure semaine' : 'Meilleur jour') + '</p><p class="ad-kpi__value">' + vals[best] + '</p><p class="ad-kpi__hint">' + esc(bks[best].long) + '</p></div>' +
          '<div class="ad-panel ad-kpi"><p class="ad-kpi__label">Évolution</p><p class="ad-kpi__value">' + (delta === null ? '—' : '<i class="bi bi-arrow-' + (delta > 0 ? 'up' : delta < 0 ? 'down' : 'right') + '-short ad-delta" aria-hidden="true"></i>' + (delta > 0 ? '+' : delta < 0 ? '−' : '') + Math.abs(delta) + ' %') + '</p><p class="ad-kpi__hint">' + (delta === null ? 'Pas de données sur la période précédente' : 'Par rapport ' + G.prev + ' (' + prev + ')') + '</p></div>' +
        '</div>' +
        '<section class="ad-panel mb-4" aria-labelledby="stChartT"><div class="ad-panel__head"><h2 id="stChartT">' + esc(selName) + ' : articles publiés ' + G.per + '</h2></div><div class="ad-panel__body">' + barChart('stChart', items, 'Articles publiés ' + G.per) +
          '<div class="ad-legend"><span><i style="background:var(--orange)"></i>Période terminée</span><span><i class="ad-hatch"></i>' + G.cur + ' (en cours)</span></div>' +
          '<details class="ad-datatable mt-3"><summary>Voir les données</summary><div class="ad-tablewrap"><table class="ad-table"><thead><tr><th>Période</th><th class="num">Articles publiés</th></tr></thead><tbody>' + items.map(function (x) { return '<tr><td>' + esc(x.long) + (x.current ? ' (en cours)' : '') + '</td><td class="num">' + x.v + '</td></tr>'; }).join('') + '</tbody></table></div></details></div></section>' +
        '<section class="ad-panel" aria-labelledby="stTeamT"><div class="ad-panel__head"><h2 id="stTeamT">Par journaliste</h2><span class="ad-muted" style="font-size:.8125rem">Total et moyenne : ' + G.range + ', ' + G.per + '. Cliquez sur un nom pour voir son graphique.</span></div><div class="ad-tablewrap"><table class="ad-table ad-stattable"><thead><tr><th>Membre</th>' + sortTh('today', 'Aujourd’hui') + sortTh('week', 'Semaine') + sortTh('month', 'Mois') + sortTh('total', 'Total') + '<th class="num">Moyenne</th><th>Tendance</th><th>Part de l’équipe</th><th>Dernier article</th></tr></thead><tbody>' +
          rows.map(function (r) {
            var share = teamRow.total ? Math.round(r.total / teamRow.total * 100) : 0;
            return '<tr' + (statState.who === r.m.key ? ' class="is-selected"' : '') + '><td><button type="button" class="ad-member" data-who="' + esc(r.m.key) + '"' + (statState.who === r.m.key ? ' aria-pressed="true"' : ' aria-pressed="false"') + '><span class="ad-avatar ad-avatar--sm" aria-hidden="true">' + (r.m.key === EXT ? '<i class="bi bi-people"></i>' : initials(r.m.name)) + '</span><span><strong>' + esc(r.m.name) + '</strong><small>' + esc(r.m.role) + '</small></span></button></td>' +
              '<td class="num">' + r.today + '</td><td class="num">' + r.week + '</td><td class="num">' + r.month + '</td><td class="num"><b>' + r.total + '</b></td><td class="num">' + f1(r.avg) + '</td><td>' + spark(r.s) + '</td>' +
              '<td style="min-width:140px"><div class="ad-hbar ad-hbar--inline"><div class="ad-hbar__track"><div class="ad-hbar__fill" style="width:' + share + '%"></div></div><b class="tnum">' + share + ' %</b></div></td>' +
              '<td class="ad-muted" style="white-space:nowrap">' + (r.last ? dshort(r.last + 'T12:00:00') : '—') + '</td></tr>';
          }).join('') + '</tbody><tfoot><tr><td><strong>Toute l’équipe</strong></td><td class="num">' + teamRow.today + '</td><td class="num">' + teamRow.week + '</td><td class="num">' + teamRow.month + '</td><td class="num"><b>' + teamRow.total + '</b></td><td class="num">' + f1(teamRow.avg) + '</td><td>' + spark(teamRow.s) + '</td><td></td><td></td></tr></tfoot></table></div>' +
          '<div class="ad-panel__foot">Avant le ' + (S.history ? dshort(S.history.end + 'T12:00:00') : '—') + ' : historique de démonstration. Ensuite : articles réellement publiés dans l’administration.</div></section>';
      bindChart('stChart', items);
    }
    v.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-g')) { statState.g = b.getAttribute('data-g'); draw(); }
      else if (b.hasAttribute('data-who')) { var k = b.getAttribute('data-who'); statState.who = statState.who === k ? '' : k; draw(); $('#stChartT').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' }); }
      else if (b.hasAttribute('data-ss')) { statState.sort = b.getAttribute('data-ss'); draw(); }
      else if (b.id === 'stExport') {
        var g = statState.g, bks = buckets(g, GRAN[g].n);
        var csv = 'Membre;' + bks.map(function (x) { return '"' + x.long + '"'; }).join(';') + ';Total\n' + members.map(function (m) { var s = series([m.key], g, bks); return '"' + m.name + '";' + s.join(';') + ';' + sum(s); }).join('\n');
        try { var url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })), a = document.createElement('a'); a.href = url; a.download = 'publications-' + g + '-afriquinfos.csv'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 1000); toast('Export lancé : publications par ' + g); }
        catch (er) { toast('Le téléchargement est bloqué ici : il fonctionne une fois le site installé'); }
      }
    });
    v.addEventListener('change', function (e) { if (e.target.id === 'stWho') { statState.who = e.target.value; draw(); } });
    draw();
  };

  /* ===================== Articles ===================== */
  VIEWS.articles = function (v) {
    var authors = S.users.map(function (u) { return u.name; });
    v.innerHTML = pagehead('Articles', plural(S.articles.filter(function (a) { return a.status !== 'corbeille'; }).length, 'article', 'articles') + ' dans la base', '<a class="ad-btn ad-btn--primary" href="#nouvel-article"><i class="bi bi-plus-lg" aria-hidden="true"></i>Nouvel article</a>') +
      '<div class="ad-tabs" role="tablist" aria-label="Filtrer par statut" id="artTabs"></div>' +
      '<section class="ad-panel">' +
        '<div class="ad-toolbar"><div class="ad-search"><i class="bi bi-search" aria-hidden="true"></i><label class="visually-hidden" for="aQ">Rechercher</label><input class="ad-input" id="aQ" type="search" placeholder="Titre, pays, mot-clé…" value="' + esc(listState.q) + '"></div>' +
          '<label class="visually-hidden" for="aRub">Rubrique</label><select class="ad-select" id="aRub">' + options(rubsSorted().map(function (r) { return { value: r.id, label: r.label }; }), listState.rub, 'Toutes les rubriques') + '</select>' +
          '<label class="visually-hidden" for="aReg">Région</label><select class="ad-select" id="aReg">' + options(regsSorted().map(function (r) { return { value: r.id, label: r.label }; }), listState.reg, 'Toutes les régions') + '</select>' +
          '<label class="visually-hidden" for="aAut">Auteur</label><select class="ad-select" id="aAut">' + options(authors.map(function (n) { return { value: n, label: n }; }), listState.author, 'Tous les auteurs') + '</select>' +
        '</div>' +
        '<div class="ad-bulk" id="bulk" hidden><span id="bulkCount"></span><button type="button" class="ad-btn ad-btn--sm" data-bulk="publie">Publier</button><button type="button" class="ad-btn ad-btn--sm" data-bulk="brouillon">Repasser en brouillon</button><button type="button" class="ad-btn ad-btn--sm" data-bulk="corbeille">Mettre à la corbeille</button><button type="button" class="ad-btn ad-btn--sm" data-bulk="restore" hidden>Restaurer</button><button type="button" class="ad-btn ad-btn--sm ms-auto" data-bulk="none">Désélectionner</button></div>' +
        '<div class="ad-tablewrap"><table class="ad-table" id="artTable"></table></div>' +
        '<div class="ad-pager" id="pager"></div>' +
      '</section>';

    function filtered() {
      var q = norm(listState.q);
      return S.articles.filter(function (a) {
        if (listState.tab === 'all' ? a.status === 'corbeille' : a.status !== listState.tab) return false;
        if (listState.rub && a.rub !== listState.rub) return false;
        if (listState.reg && a.region !== listState.reg) return false;
        if (listState.author && a.author !== listState.author) return false;
        if (q && norm([a.title, a.chapo, a.country, a.tags.join(' '), a.author].join(' ')).indexOf(q) < 0) return false;
        return true;
      }).sort(function (a, b) {
        var k = listState.sort, x = k === 'title' ? norm(a.title) : k === 'views' ? a.views : a.date, y = k === 'title' ? norm(b.title) : k === 'views' ? b.views : b.date;
        return (x > y ? 1 : x < y ? -1 : 0) * listState.dir;
      });
    }
    function tabs() {
      var defs = [['all', 'Tous'], ['publie', 'Publiés'], ['programme', 'Programmés'], ['relecture', 'En relecture'], ['brouillon', 'Brouillons'], ['corbeille', 'Corbeille']];
      $('#artTabs').innerHTML = defs.map(function (d) {
        var n = S.articles.filter(function (a) { return d[0] === 'all' ? a.status !== 'corbeille' : a.status === d[0]; }).length;
        return '<button type="button" role="tab" aria-selected="' + (listState.tab === d[0]) + '" data-t="' + d[0] + '">' + d[1] + '<small>' + n + '</small></button>';
      }).join('');
    }
    function sortBtn(k, label) {
      var on = listState.sort === k;
      return '<button type="button" class="ad-sort" data-sort="' + k + '"' + (on ? ' aria-sort="' + (listState.dir > 0 ? 'ascending' : 'descending') + '"' : '') + '>' + label + (on ? ' <i class="bi bi-arrow-' + (listState.dir > 0 ? 'up' : 'down') + '" aria-hidden="true"></i>' : '') + '</button>';
    }
    function draw() {
      tabs();
      var list = filtered(), per = 10, pages = Math.max(1, Math.ceil(list.length / per));
      if (listState.page > pages) listState.page = pages;
      var rows = list.slice((listState.page - 1) * per, listState.page * per);
      var trash = listState.tab === 'corbeille';
      var allSel = rows.length && rows.every(function (a) { return listState.sel[a.id]; });
      $('#artTable').innerHTML = '<thead><tr><th class="w-check"><input type="checkbox" class="form-check-input" id="selAll" aria-label="Tout sélectionner sur cette page"' + (allSel ? ' checked' : '') + '></th><th>' + sortBtn('title', 'Titre') + '</th><th>Rubrique</th><th>Auteur</th><th>Statut</th><th>' + sortBtn('date', 'Date') + '</th><th class="num">' + sortBtn('views', 'Lectures') + '</th><th class="actions"><span class="visually-hidden">Actions</span></th></tr></thead><tbody>' +
        (rows.length ? rows.map(function (a) {
          return '<tr' + (listState.sel[a.id] ? ' class="is-selected"' : '') + '><td><input type="checkbox" class="form-check-input" data-sel="' + a.id + '" aria-label="Sélectionner « ' + esc(a.title) + ' »"' + (listState.sel[a.id] ? ' checked' : '') + '></td>' +
            '<td><div class="d-flex gap-3 align-items-center"><div class="ad-thumb">' + coverOf(a) + '</div><div class="ad-title-cell"><a href="#" data-edit="' + a.id + '">' + fr(a.title) + '</a><small>' + esc(a.country || '') + (a.region && regLabel(a.region) !== a.country ? ', ' + esc(regLabel(a.region)) : '') + '</small>' + (a.une ? '<span class="ad-flag">À la une</span>' : '') + (flashOf(a.id) ? '<span class="ad-flag">Flash info</span>' : '') + '</div></div></td>' +
            '<td>' + esc(rubLabel(a.rub)) + '</td><td style="min-width:120px">' + esc(a.author.split(',')[0]) + '</td><td>' + statusPill(a.status) + '</td>' +
            '<td class="ad-muted" style="white-space:nowrap" title="' + esc(dlong(a.date)) + '">' + (a.status === 'programme' ? dlong(a.date) : dshort(a.date)) + '</td><td class="num">' + (a.status === 'publie' ? fmtNum.format(a.views) : '—') + '</td>' +
            '<td class="actions">' + (trash ?
              '<button type="button" class="ad-iconbtn ad-iconbtn--sm" data-restore="' + a.id + '" aria-label="Restaurer" title="Restaurer"><i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i></button><button type="button" class="ad-iconbtn ad-iconbtn--sm ad-iconbtn--danger" data-purge="' + a.id + '" aria-label="Supprimer définitivement" title="Supprimer définitivement"><i class="bi bi-x-octagon" aria-hidden="true"></i></button>' :
              '<button type="button" class="ad-iconbtn ad-iconbtn--sm" data-edit="' + a.id + '" aria-label="Modifier" title="Modifier"><i class="bi bi-pencil" aria-hidden="true"></i></button><button type="button" class="ad-iconbtn ad-iconbtn--sm" data-preview="' + a.id + '" aria-label="Aperçu" title="Aperçu"><i class="bi bi-eye" aria-hidden="true"></i></button><button type="button" class="ad-iconbtn ad-iconbtn--sm" data-dup="' + a.id + '" aria-label="Dupliquer" title="Dupliquer"><i class="bi bi-copy" aria-hidden="true"></i></button><button type="button" class="ad-iconbtn ad-iconbtn--sm ad-iconbtn--danger" data-trash="' + a.id + '" aria-label="Mettre à la corbeille" title="Mettre à la corbeille"><i class="bi bi-trash3" aria-hidden="true"></i></button>') + '</td></tr>';
        }).join('') : '<tr><td colspan="8"><div class="ad-empty"><strong>Aucun article</strong>' + (trash ? 'La corbeille est vide.' : 'Aucun article ne correspond à ces filtres. Modifiez la recherche ou choisissez « Tous ».') + '</div></td></tr>') + '</tbody>';
      $('#pager').innerHTML = '<span class="tnum">' + (list.length ? ((listState.page - 1) * per + 1) + '–' + Math.min(listState.page * per, list.length) + ' sur ' + list.length : '0 article') + '</span><div class="ad-pager__btns"><button type="button" class="ad-btn ad-btn--outline ad-btn--sm" data-page="-1"' + (listState.page <= 1 ? ' disabled' : '') + '><i class="bi bi-chevron-left" aria-hidden="true"></i>Précédent</button><button type="button" class="ad-btn ad-btn--outline ad-btn--sm" data-page="1"' + (listState.page >= pages ? ' disabled' : '') + '>Suivant<i class="bi bi-chevron-right" aria-hidden="true"></i></button></div>';
      var n = Object.keys(listState.sel).filter(function (k) { return listState.sel[k]; }).length;
      $('#bulk').hidden = !n; $('#bulkCount').textContent = plural(n, 'article sélectionné', 'articles sélectionnés');
      $$('[data-bulk]', v).forEach(function (b) { var k = b.getAttribute('data-bulk'); if (k === 'restore') b.hidden = !trash; else if (k !== 'none') b.hidden = trash; });
    }
    var t;
    $('#aQ').addEventListener('input', function () { clearTimeout(t); var val = this.value; t = setTimeout(function () { listState.q = val; listState.page = 1; draw(); }, 150); });
    [['aRub', 'rub'], ['aReg', 'reg'], ['aAut', 'author']].forEach(function (p) { $('#' + p[0]).addEventListener('change', function () { listState[p[1]] = this.value; listState.page = 1; draw(); }); });
    v.addEventListener('click', function (e) {
      var b = e.target.closest('button, a'); if (!b) return;
      if (b.hasAttribute('data-t')) { listState.tab = b.getAttribute('data-t'); listState.page = 1; listState.sel = {}; draw(); }
      else if (b.hasAttribute('data-sort')) { var k = b.getAttribute('data-sort'); listState.dir = listState.sort === k ? -listState.dir : (k === 'title' ? 1 : -1); listState.sort = k; draw(); }
      else if (b.hasAttribute('data-page')) { listState.page += +b.getAttribute('data-page'); draw(); }
      else if (b.hasAttribute('data-trash')) { var a = art(b.getAttribute('data-trash')); a.prev = a.status; a.status = 'corbeille'; a.updated = new Date().toISOString(); log('a mis à la corbeille « ' + a.title + ' »'); save(); draw(); toast('Article mis à la corbeille'); }
      else if (b.hasAttribute('data-restore')) { var r = art(b.getAttribute('data-restore')); r.status = r.prev && r.prev !== 'corbeille' ? r.prev : 'brouillon'; save(); draw(); toast('Article restauré : ' + STATUS[r.status]); }
      else if (b.hasAttribute('data-purge')) { var p = art(b.getAttribute('data-purge')); confirmBox('Supprimer définitivement ?', '« ' + p.title + ' » sera supprimé sans retour possible.', 'Supprimer définitivement', function () { S.articles = S.articles.filter(function (x) { return x !== p; }); S.flash = S.flash.filter(function (f) { return f.articleId !== p.id; }); log('a supprimé définitivement « ' + p.title + ' »'); save(); draw(); toast('Article supprimé définitivement'); }); }
      else if (b.hasAttribute('data-dup')) { var o = art(b.getAttribute('data-dup')), c = clone(o); c.id = slugify(o.title) + '-copie-' + uid().slice(-4); c.slug = c.id; c.title = o.title + ' (copie)'; c.status = 'brouillon'; c.une = false; c.views = 0; c.date = c.updated = new Date().toISOString(); S.articles.unshift(c); log('a dupliqué « ' + o.title + ' »'); save(); draw(); toast('Copie créée en brouillon'); }
      else if (b.hasAttribute('data-preview')) { e.preventDefault(); preview(art(b.getAttribute('data-preview'))); }
      else if (b.hasAttribute('data-bulk')) {
        var kind = b.getAttribute('data-bulk'), ids = Object.keys(listState.sel).filter(function (k) { return listState.sel[k]; });
        if (kind === 'none') { listState.sel = {}; draw(); return; }
        ids.forEach(function (id) { var x = art(id); if (!x) return; if (kind === 'restore') x.status = x.prev && x.prev !== 'corbeille' ? x.prev : 'brouillon'; else { if (kind === 'corbeille') x.prev = x.status; x.status = kind; if (kind === 'publie' && new Date(x.date) > new Date()) x.date = new Date().toISOString(); } x.updated = new Date().toISOString(); });
        log((kind === 'publie' ? 'a publié ' : kind === 'corbeille' ? 'a mis à la corbeille ' : kind === 'restore' ? 'a restauré ' : 'a repassé en brouillon ') + plural(ids.length, 'article', 'articles'));
        listState.sel = {}; save(); draw(); toast(plural(ids.length, 'article mis à jour', 'articles mis à jour'));
      }
    });
    v.addEventListener('change', function (e) {
      if (e.target.id === 'selAll') { filtered().slice((listState.page - 1) * 10, listState.page * 10).forEach(function (a) { listState.sel[a.id] = e.target.checked; }); draw(); }
      else if (e.target.hasAttribute('data-sel')) { listState.sel[e.target.getAttribute('data-sel')] = e.target.checked; draw(); }
    });
    draw();
  };

  /* ===================== Aperçu d'article ===================== */
  function bodyHtml(body) {
    return body.map(function (p) { return p.indexOf('## ') === 0 ? '<h2>' + fr(p.slice(3)) + '</h2>' : p.indexOf('> ') === 0 ? '<blockquote>« ' + fr(p.slice(2)) + ' »</blockquote>' : '<p>' + fr(p) + '</p>'; }).join('');
  }
  function previewHtml(a) {
    return '<article class="ad-preview"><span class="ad-preview__tag">' + esc(rubLabel(a.rub)) + (a.country ? ', ' + esc(a.country) : '') + '</span><h1>' + fr(a.title || 'Titre de l’article') + '</h1>' +
      '<p class="ad-preview__chapo">' + fr(a.chapo || 'Chapô de l’article') + '</p><p class="ad-preview__by">Par ' + esc(a.author) + ', ' + dlong(a.date) + ', ' + (a.read || 1) + ' min de lecture</p>' +
      '<div class="ad-preview__cover">' + coverOf(a) + '</div><div class="ad-prose">' + bodyHtml(a.body.length ? a.body : ['Le texte de l’article apparaîtra ici.']) + '</div></article>';
  }
  function preview(a) { openBig('Aperçu', '<div class="ad-panel">' + previewHtml(a) + '</div>'); }

  /* ===================== Éditeur ===================== */
  function wordCount(s) { return (String(s).match(/[\wÀ-ÿ’'-]+/g) || []).length; }
  VIEWS.editeur = function (v) {
    var isNew = !editing || !art(editing);
    var src = isNew ? null : art(editing);
    if (src && src.body === undefined) {
      v.innerHTML = '<div class="ad-panel"><div class="ad-panel__body">Chargement de l\u2019article\u2026</div></div>';
      fetch((window.AQ_API || '').replace(/\/state$/, '/article/') + encodeURIComponent(src.slug || src.id), { headers: { 'Accept': 'application/json' }, credentials: 'same-origin' })
        .then(function (r) { return r.json(); })
        .then(function (d) { src.body = d.body || []; if (d.person) src.person = d.person; src.image_path = d.image_path; render(); })
        .catch(function () { src.body = []; render(); });
      return;
    }
    var a = src ? clone(src) : { id: '', rub: editorPreset || 'politique', region: '', country: '', ph: PH[Math.floor(Math.random() * PH.length)], img: '', caption: '', views: 0, title: '', chapo: '', author: ME.name, date: new Date().toISOString(), updated: new Date().toISOString(), read: 1, tags: [], body: [], status: 'brouillon', meta: '', slug: '', une: false };
    if (editorPreset === 'portraits' && isNew) a.person = { name: '', initials: '', role: '', city: '', field: '', since: new Date().getFullYear() };
    editorPreset = null; dirty = false;
    var slugTouched = !!a.slug;
    TITLES.editeur = isNew ? 'Nouvel article' : 'Modifier l’article';
    $('#crumb').innerHTML = 'Administration <span aria-hidden="true">/</span> <a href="#articles">Articles</a> <span aria-hidden="true">/</span> <b>' + (isNew ? 'Nouvel article' : 'Modifier') + '</b>';

    v.innerHTML = pagehead(isNew ? 'Nouvel article' : 'Modifier l’article', isNew ? 'Rédigez, classez puis publiez ou programmez.' : 'Dernière modification ' + rel(a.updated) + '.', !isNew ? '<button type="button" class="ad-btn ad-btn--outline" id="edPreview"><i class="bi bi-eye" aria-hidden="true"></i>Aperçu</button>' : '') +
      '<form class="ad-editor" id="edForm" novalidate>' +
        '<div class="ad-editor__main">' +
          '<div class="ad-editor__tabs" role="tablist"><button type="button" role="tab" aria-selected="true" data-mode="write">Rédaction</button><button type="button" role="tab" aria-selected="false" data-mode="preview">Aperçu</button></div>' +
          '<div class="ad-editor__write" id="edWrite">' +
            '<label class="visually-hidden" for="edTitle">Titre</label><textarea class="ad-editor__title" id="edTitle" rows="1" placeholder="Titre de l’article">' + esc(a.title) + '</textarea><p class="ad-error" id="edTitleErr"></p>' +
            '<label class="visually-hidden" for="edChapo">Chapô</label><textarea class="ad-editor__chapo" id="edChapo" rows="2" placeholder="Chapô : deux ou trois lignes qui résument l’essentiel">' + esc(a.chapo) + '</textarea><p class="ad-error" id="edChapoErr"></p>' +
            '<div class="ad-editor__bar" role="toolbar" aria-label="Mise en forme"><button type="button" class="ad-btn ad-btn--ghost" data-ins="## "><i class="bi bi-type-h2" aria-hidden="true"></i>Intertitre</button><button type="button" class="ad-btn ad-btn--ghost" data-ins="> "><i class="bi bi-quote" aria-hidden="true"></i>Citation</button><span class="sep" aria-hidden="true"></span><button type="button" class="ad-btn ad-btn--ghost" data-media><i class="bi bi-image" aria-hidden="true"></i>Image de une</button><span class="ms-auto ad-hint d-none d-md-inline">Un paragraphe par ligne vide</span></div>' +
            '<label class="visually-hidden" for="edBody">Texte de l’article</label><textarea class="ad-editor__body" id="edBody" placeholder="Rédigez l’article. Laissez une ligne vide entre deux paragraphes.">' + esc(a.body.join('\n\n')) + '</textarea><p class="ad-error" id="edBodyErr"></p>' +
            '<div class="ad-editor__meta tnum"><span id="edWords"></span><span id="edRead"></span><span>Raccourci : Ctrl + S pour enregistrer</span></div>' +
          '</div>' +
          '<div id="edPrev" hidden></div>' +
        '</div>' +
        '<aside class="ad-editor__side">' +
          '<section class="ad-panel"><div class="ad-panel__head"><h2>Publication</h2>' + statusPill(a.status) + '</div><div class="ad-panel__body">' +
            field('edStatus', 'Statut', '<select class="ad-select" id="edStatus">' + options(['brouillon', 'relecture', 'publie', 'programme'].map(function (k) { return { value: k, label: STATUS[k] }; }), a.status === 'corbeille' ? 'brouillon' : a.status) + '</select>') +
            field('edDate', 'Date de publication', '<input class="ad-input" type="datetime-local" id="edDate" value="' + toLocalInput(a.date) + '">', 'Une date future programme la publication.') +
            '<div class="ad-field"><label class="ad-switch"><input type="checkbox" id="edUne"' + (a.une ? ' checked' : '') + '>Afficher à la une</label></div>' +
            '<div class="ad-field mb-0"><label class="ad-switch"><input type="checkbox" id="edFlash"' + (a.id && flashOf(a.id) ? ' checked' : '') + '>Mettre en flash info</label>' +
              '<div class="ad-flashprev" id="edFlashPrev" hidden><span class="ad-flashprev__k">Flash info</span><span id="edFlashTxt"></span></div><p class="ad-hint" id="edFlashHint"></p></div>' +
          '</div><div class="ad-savebar"><button type="button" class="ad-btn ad-btn--outline" id="edSave">Enregistrer</button><button type="submit" class="ad-btn ad-btn--primary" id="edPublish">Publier</button></div><p class="ad-saved" id="edSaved" aria-live="polite">' + (isNew ? 'Pas encore enregistré' : 'Enregistré ' + rel(a.updated)) + '</p></section>' +
          '<section class="ad-panel"><div class="ad-panel__head"><h2>Classement</h2></div><div class="ad-panel__body">' +
            field('edRub', 'Rubrique', '<select class="ad-select" id="edRub">' + options(rubsSorted().map(function (r) { return { value: r.id, label: r.label }; }), a.rub) + '</select>') +
            field('edReg', 'Région', '<select class="ad-select" id="edReg">' + options(regsSorted().map(function (r) { return { value: r.id, label: r.label }; }), a.region || '', 'Aucune région') + '</select>') +
            field('edCountry', 'Pays ou thème', '<input class="ad-input" id="edCountry" value="' + esc(a.country) + '" placeholder="Ex. Sénégal, Cédéao, Football">') +
            field('edAuthor', 'Auteur', '<select class="ad-select" id="edAuthor">' + options(S.users.map(function (u) { return { value: u.name, label: u.name }; }).concat(S.users.some(function (u) { return u.name === a.author; }) ? [] : [{ value: a.author, label: a.author }]), a.author) + '</select>') +
            '<div class="ad-field"><label for="edTagIn">Mots-clés</label><div class="ad-chips" id="edTags"><input id="edTagIn" placeholder="Ajouter puis Entrée"></div></div>' +
          '</div></section>' +
          '<section class="ad-panel" id="edPersonBox"' + (a.rub === 'portraits' ? '' : ' hidden') + '><div class="ad-panel__head"><h2>Fiche du portrait</h2></div><div class="ad-panel__body">' +
            field('pName', 'Nom', '<input class="ad-input" id="pName" value="' + esc(a.person ? a.person.name : '') + '">') +
            field('pRole', 'Activité', '<input class="ad-input" id="pRole" value="' + esc(a.person ? a.person.role : '') + '">') +
            '<div class="ad-form-grid">' + field('pCity', 'Ville', '<input class="ad-input" id="pCity" value="' + esc(a.person ? a.person.city : '') + '">') + field('pSince', 'Depuis', '<input class="ad-input" id="pSince" inputmode="numeric" value="' + esc(a.person ? a.person.since : '') + '">') + '</div>' +
            field('pField', 'Domaine', '<input class="ad-input" id="pField" value="' + esc(a.person ? a.person.field : '') + '">') +
          '</div></section>' +
          '<section class="ad-panel"><div class="ad-panel__head"><h2>Image de une</h2><button type="button" class="ad-link ad-btn ad-btn--ghost ad-btn--sm" data-media>Changer</button></div><div class="ad-panel__body"><div class="ad-cover" id="edCover">' + coverOf(a) + '</div>' +
            field('edCaption', 'Légende', '<input class="ad-input" id="edCaption" value="' + esc(a.caption || a.img) + '" placeholder="Décrivez l’image">', 'La légende sert aussi de texte alternatif.') + '</div></section>' +
          '<section class="ad-panel"><div class="ad-panel__head"><h2>Référencement</h2></div><div class="ad-panel__body">' +
            '<div class="ad-serp" aria-label="Aperçu dans les résultats de recherche"><div class="ad-serp__url" id="serpUrl"></div><div class="ad-serp__title" id="serpTitle"></div><div class="ad-serp__desc" id="serpDesc"></div></div>' +
            field('edSlug', 'Adresse de la page', '<input class="ad-input" id="edSlug" value="' + esc(a.slug) + '">') +
            '<div class="ad-field"><label for="edMeta">Description pour les moteurs de recherche</label><textarea class="ad-textarea" id="edMeta" rows="3">' + esc(a.meta) + '</textarea><p class="ad-count" id="edMetaCount"></p></div>' +
          '</div></section>' +
          (!isNew ? '<button type="button" class="ad-btn ad-btn--ghost" id="edTrash"><i class="bi bi-trash3" aria-hidden="true"></i>Mettre à la corbeille</button>' : '') +
        '</aside>' +
      '</form>';

    var form = $('#edForm');
    function grow(el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }
    ['edTitle', 'edChapo'].forEach(function (id) { var el = $('#' + id); grow(el); el.addEventListener('input', function () { grow(el); }); });

    // mots-clés
    function drawTags() {
      $$('.ad-chip', $('#edTags')).forEach(function (c) { c.remove(); });
      a.tags.forEach(function (t, i) { var c = document.createElement('span'); c.className = 'ad-chip'; c.innerHTML = esc(t) + '<button type="button" aria-label="Retirer ' + esc(t) + '" data-tag="' + i + '">×</button>'; $('#edTags').insertBefore(c, $('#edTagIn')); });
    }
    drawTags();
    $('#edTagIn').addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ',') && this.value.trim()) { e.preventDefault(); var t = this.value.trim().replace(/,$/, ''); if (a.tags.indexOf(t) < 0) a.tags.push(t); this.value = ''; drawTags(); markDirty(); }
      else if (e.key === 'Backspace' && !this.value && a.tags.length) { a.tags.pop(); drawTags(); markDirty(); }
    });
    $('#edTags').addEventListener('click', function (e) { var b = e.target.closest('[data-tag]'); if (b) { a.tags.splice(+b.getAttribute('data-tag'), 1); drawTags(); markDirty(); } });

    // insertion intertitre / citation
    $$('[data-ins]', v).forEach(function (b) {
      b.addEventListener('click', function () {
        var ta = $('#edBody'), pre = b.getAttribute('data-ins'), s = ta.selectionStart, val = ta.value;
        var ls = val.lastIndexOf('\n', s - 1) + 1;
        if (val.slice(ls, ls + pre.length) === pre) { ta.value = val.slice(0, ls) + val.slice(ls + pre.length); }
        else { var cleaned = val.slice(ls).replace(/^(## |> )/, ''); ta.value = val.slice(0, ls) + pre + cleaned; }
        ta.focus(); markDirty(); stats();
      });
    });
    $$('[data-media]', v).forEach(function (b) { b.addEventListener('click', function () { pickMedia(function (m) { a.mediaId = m.id; a.ph = m.ph; if (!$('#edCaption').value) $('#edCaption').value = m.alt; $('#edCover').innerHTML = coverOf(a); markDirty(); }); }); });

    function stats() {
      var w = wordCount($('#edBody').value), r = Math.max(1, Math.round(w / 220));
      $('#edWords').textContent = plural(w, 'mot', 'mots'); $('#edRead').textContent = r + ' min de lecture';
    }
    function serp() {
      if (!slugTouched) $('#edSlug').value = slugify($('#edTitle').value);
      $('#serpUrl').textContent = 'afriquinfos.com › ' + rubLabel($('#edRub').value).toLowerCase() + ' › ' + ($('#edSlug').value || 'adresse-de-la-page');
      $('#serpTitle').textContent = ($('#edTitle').value || 'Titre de l’article') + ' — Afriquinfos';
      var m = $('#edMeta').value || $('#edChapo').value; $('#serpDesc').textContent = m.length > 160 ? m.slice(0, 157) + '…' : (m || 'La description apparaîtra ici.');
      var c = $('#edMeta').value.length, cnt = $('#edMetaCount'); cnt.textContent = c + ' / 160 caractères'; cnt.classList.toggle('is-over', c > 160);
    }
    function publishLabel() {
      var st = $('#edStatus').value, future = new Date($('#edDate').value) > new Date();
      $('#edPublish').textContent = future ? 'Programmer' : (st === 'publie' && !isNew && src.status === 'publie' ? 'Mettre à jour' : 'Publier');
    }
    function markDirty() { dirty = true; var s = $('#edSaved'); s.textContent = 'Modifications non enregistrées'; s.classList.add('is-dirty'); }
    function flashPrev() {
      var on = $('#edFlash').checked, fl = a.id && flashOf(a.id), t = fl && !fl.auto ? fl.text : flashTitle($('#edTitle').value) || 'Le titre de l’article apparaîtra ici';
      $('#edFlashPrev').hidden = !on; $('#edFlashTxt').textContent = t;
      var future = new Date($('#edDate').value) > new Date(), st = $('#edStatus').value;
      $('#edFlashHint').textContent = !on ? 'Ajoute l’article au bandeau Flash info, avec un lien vers lui.' : fl && !fl.auto ? 'Texte personnalisé dans Flash info.' : (future || st === 'programme' ? 'Le titre est repris et s’affichera à la publication.' : st === 'publie' ? 'Le titre est repris automatiquement, même s’il change.' : 'Le titre est repris et s’affichera dès la publication.');
    }
    stats(); serp(); publishLabel(); flashPrev();
    form.addEventListener('input', function (e) {
      if (e.target.id === 'edSlug') slugTouched = true;
      if (e.target.id !== 'edTagIn') markDirty();
      if (e.target.id === 'edBody') stats();
      serp(); publishLabel(); flashPrev();
    });
    form.addEventListener('change', function (e) {
      if (e.target.id === 'edRub') { $('#edPersonBox').hidden = e.target.value !== 'portraits'; if (e.target.value === 'portraits' && !a.person) a.person = { name: '', initials: '', role: '', city: '', field: '', since: new Date().getFullYear() }; }
      markDirty(); serp(); publishLabel(); flashPrev();
    });

    function collect() {
      a.title = $('#edTitle').value.trim(); a.chapo = $('#edChapo').value.trim();
      a.body = $('#edBody').value.split(/\n\s*\n/).map(function (p) { return p.replace(/\s*\n\s*/g, ' ').trim(); }).filter(Boolean);
      a.rub = $('#edRub').value; a.region = $('#edReg').value || null; a.country = $('#edCountry').value.trim(); a.author = $('#edAuthor').value;
      a.une = $('#edUne').checked; a.caption = $('#edCaption').value.trim(); a.img = a.caption || a.img;
      a.slug = slugify($('#edSlug').value || a.title); a.meta = $('#edMeta').value.trim();
      a.read = Math.max(1, Math.round(wordCount(a.body.join(' ')) / 220));
      var d = new Date($('#edDate').value); if (!isNaN(d)) a.date = d.toISOString();
      if (a.rub === 'portraits') { a.person = { name: $('#pName').value.trim(), role: $('#pRole').value.trim(), city: $('#pCity').value.trim(), field: $('#pField').value.trim(), since: $('#pSince').value.trim(), initials: initials($('#pName').value) }; }
    }
    function validate(full) {
      var ok = setErr(form, 'edTitle', a.title.length >= 10 ? '' : 'Le titre doit faire au moins 10 caractères.');
      if (!full) return ok;
      ok = setErr(form, 'edChapo', a.chapo.length >= 20 ? '' : 'Ajoutez un chapô d’au moins 20 caractères.') && ok;
      ok = setErr(form, 'edBody', a.body.length ? '' : 'Le texte de l’article est vide.') && ok;
      if (a.rub === 'portraits') ok = setErr(form, 'pName', a.person.name ? '' : 'Indiquez le nom de la personne.') && ok;
      return ok;
    }
    function persist(status, verb) {
      a.status = status; a.updated = new Date().toISOString();
      if (a.une && status === 'publie') S.articles.filter(function (x) { return x.une && x.id !== a.id; }).sort(function (p, q) { return q.date.localeCompare(p.date); }).slice(3).forEach(function (x) { x.une = false; });
      if (isNew) {
        var base = a.slug || slugify(a.title) || 'article', id = base, n = 2;
        while (art(id)) id = base + '-' + n++;
        a.id = id; S.articles.unshift(a); isNew = false; editing = id; src = a;
      } else { var i = S.articles.indexOf(art(a.id)); S.articles[i] = a; src = a; }
      var fl = flashOf(a.id), wantFlash = $('#edFlash').checked;
      if (wantFlash && !fl) { S.flash.unshift({ id: 'f' + uid(), articleId: a.id, text: flashTitle(a.title), auto: true, active: true, start: day(0), end: addDays(day(0), 7) }); log('a mis en flash « ' + a.title + ' »'); }
      else if (!wantFlash && fl) S.flash = S.flash.filter(function (x) { return x !== fl; });
      syncFlash();
      log(verb + ' « ' + a.title + ' »'); save(); dirty = false; flashPrev();
      var sv = $('#edSaved'); sv.classList.remove('is-dirty'); sv.textContent = 'Enregistré à ' + fmtTime.format(new Date());
      $('.ad-panel__head .ad-status', form).outerHTML = statusPill(a.status);
      $('#edStatus').value = a.status; publishLabel();
      $('.ad-pagehead h1', v).textContent = 'Modifier l’article';
    }
    function doSave() {
      collect(); if (!validate(false)) { $('#edTitle').focus(); return; }
      var st = $('#edStatus').value;
      if (st === 'publie' || st === 'programme') { if (!validate(true)) return; st = new Date(a.date) > new Date() ? 'programme' : 'publie'; }
      persist(st, st === 'relecture' ? 'a envoyé en relecture' : st === 'brouillon' ? 'a enregistré le brouillon' : 'a mis à jour');
      toast(st === 'brouillon' ? 'Brouillon enregistré' : st === 'relecture' ? 'Envoyé en relecture' : 'Article enregistré : ' + STATUS[st]);
    }
    $('#edSave').addEventListener('click', doSave);
    form.addEventListener('submit', function (e) {
      e.preventDefault(); collect();
      if (!validate(true)) { var bad = $('[aria-invalid="true"]', form); if (bad) bad.focus(); toast('Complétez les champs signalés avant de publier'); return; }
      var future = new Date(a.date) > new Date();
      persist(future ? 'programme' : 'publie', future ? 'a programmé' : 'a publié');
      toast(future ? 'Article programmé pour le ' + dlong(a.date) : 'Article publié');
    });
    v.addEventListener('keydown', function (e) { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); doSave(); } });
    $$('[data-mode]', v).forEach(function (b) {
      b.addEventListener('click', function () {
        var p = b.getAttribute('data-mode') === 'preview';
        $$('[data-mode]', v).forEach(function (x) { x.setAttribute('aria-selected', String(x === b)); });
        if (p) { collect(); $('#edPrev').innerHTML = previewHtml(a); }
        $('#edWrite').hidden = p; $('#edPrev').hidden = !p;
      });
    });
    if ($('#edPreview')) $('#edPreview').addEventListener('click', function () { collect(); preview(a); });
    if ($('#edTrash')) $('#edTrash').addEventListener('click', function () {
      confirmBox('Mettre à la corbeille ?', 'Vous pourrez restaurer l’article depuis l’onglet Corbeille.', 'Mettre à la corbeille', function () {
        var x = art(a.id); x.prev = x.status; x.status = 'corbeille'; x.updated = new Date().toISOString(); log('a mis à la corbeille « ' + x.title + ' »'); save(); dirty = false; toast('Article mis à la corbeille'); go('articles');
      });
    });
    if (isNew) $('#edTitle').focus();
  };

  function openEditor(id) { editing = id; if (location.hash === '#editeur') render(); else location.hash = 'editeur'; }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-edit]'); if (!a || !$('#app').contains(a)) return;
    e.preventDefault(); openEditor(a.getAttribute('data-edit'));
  });

  /* ===================== Médiathèque ===================== */
  function mediaTile(m, selected) {
    return '<button type="button" class="ad-media" data-m="' + m.id + '" aria-pressed="' + !!selected + '"><div class="ad-media__img">' + ph(m.ph, m.data) + '</div><span class="ad-media__name">' + esc(m.name) + '</span></button>';
  }
  function readFiles(files, done) {
    var list = Array.prototype.slice.call(files).filter(function (f) { return /^image\//.test(f.type); });
    if (!list.length) { toast('Choisissez des fichiers image (JPG, PNG, WebP)'); return; }
    var left = list.length;
    list.forEach(function (f) {
      var r = new FileReader();
      r.onload = function () {
        var img = new Image();
        img.onload = function () {
          // réduit l'image pour la garder dans le navigateur
          var c = document.createElement('canvas'), k = Math.min(1, 1200 / img.width); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
          c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
          var data = c.toDataURL('image/jpeg', 0.82);
          S.medias.unshift({ id: 'm' + uid(), name: f.name, ph: 'ink', data: data, alt: f.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' '), w: img.width, h: img.height, size: Math.round(f.size / 1024), date: new Date().toISOString() });
          if (--left === 0) { save(); log('a importé ' + plural(list.length, 'visuel', 'visuels')); done(); toast(plural(list.length, 'visuel importé', 'visuels importés')); }
        };
        img.src = r.result;
      };
      r.readAsDataURL(f);
    });
  }
  function dropzone(id) {
    return '<div class="ad-drop" id="' + id + '"><i class="bi bi-cloud-arrow-up" aria-hidden="true"></i><span>Glissez vos images ici ou <label for="' + id + 'In">parcourez vos fichiers</label></span><span class="ad-hint">JPG, PNG ou WebP. Les images sont réduites à 1 200 px de large.</span><input type="file" id="' + id + 'In" accept="image/*" multiple hidden></div>';
  }
  function bindDrop(id, after) {
    var z = $('#' + id); if (!z) return;
    $('#' + id + 'In').addEventListener('change', function () { readFiles(this.files, after); this.value = ''; });
    ['dragenter', 'dragover'].forEach(function (t) { z.addEventListener(t, function (e) { e.preventDefault(); z.classList.add('is-over'); }); });
    ['dragleave', 'drop'].forEach(function (t) { z.addEventListener(t, function (e) { e.preventDefault(); z.classList.remove('is-over'); }); });
    z.addEventListener('drop', function (e) { readFiles(e.dataTransfer.files, after); });
  }
  function pickMedia(onPick) {
    openBig('Choisir une image', dropzone('pkDrop') + '<div class="ad-media-grid mt-3" id="pkGrid"></div>', function (body, close) {
      function draw() { $('#pkGrid', body).innerHTML = S.medias.map(function (m) { return mediaTile(m); }).join(''); }
      draw(); bindDrop('pkDrop', draw);
      $('#pkGrid', body).addEventListener('click', function (e) { var b = e.target.closest('[data-m]'); if (!b) return; onPick(mediaById(b.getAttribute('data-m'))); close(); toast('Image de une choisie'); });
    });
  }
  VIEWS.medias = function (v) {
    var sel = null, q = '';
    v.innerHTML = pagehead('Médiathèque', plural(S.medias.length, 'visuel', 'visuels'), '') + dropzone('mdDrop') +
      '<div class="ad-grid mt-4" style="grid-template-columns:minmax(0,1fr) 320px;align-items:start" id="mdLayout"><div><div class="ad-toolbar ad-panel mb-3" style="border-radius:6px"><div class="ad-search"><i class="bi bi-search" aria-hidden="true"></i><label class="visually-hidden" for="mdQ">Rechercher un visuel</label><input class="ad-input" id="mdQ" type="search" placeholder="Nom ou description…"></div></div><div class="ad-media-grid" id="mdGrid"></div></div><aside class="ad-panel" id="mdDetail"></aside></div>';
    if (window.matchMedia('(max-width: 991.98px)').matches) $('#mdLayout').style.gridTemplateColumns = '1fr';
    function used(m) { return S.articles.filter(function (a) { return a.mediaId === m.id || (!a.mediaId && !m.data && a.ph === m.ph && slugify(a.img) + '.jpg' === m.name); }).length; }
    function draw() {
      var list = S.medias.filter(function (m) { return !q || norm(m.name + ' ' + m.alt).indexOf(norm(q)) > -1; });
      $('#mdGrid').innerHTML = list.length ? list.map(function (m) { return mediaTile(m, sel === m.id); }).join('') : '<div class="ad-empty"><strong>Aucun visuel</strong>Aucun visuel ne correspond à « ' + esc(q) + ' ».</div>';
      var m = sel && mediaById(sel);
      $('#mdDetail').innerHTML = m ? '<div class="ad-panel__head"><h2>Détails</h2></div><div class="ad-panel__body"><div class="ad-cover">' + ph(m.ph, m.data) + '</div>' +
        field('mdAlt', 'Texte alternatif', '<textarea class="ad-textarea" id="mdAlt" rows="2">' + esc(m.alt) + '</textarea>', 'Décrit l’image pour les lecteurs malvoyants.') +
        '<dl class="small mb-3" style="display:grid;grid-template-columns:auto 1fr;gap:.35rem 1rem"><dt class="ad-muted fw-normal">Fichier</dt><dd class="mb-0 text-break">' + esc(m.name) + '</dd><dt class="ad-muted fw-normal">Dimensions</dt><dd class="mb-0 tnum">' + m.w + ' × ' + m.h + ' px</dd><dt class="ad-muted fw-normal">Poids</dt><dd class="mb-0 tnum">' + m.size + ' Ko</dd><dt class="ad-muted fw-normal">Ajouté</dt><dd class="mb-0">' + dshort(m.date) + '</dd><dt class="ad-muted fw-normal">Utilisé</dt><dd class="mb-0">' + plural(used(m), 'article', 'articles') + '</dd></dl>' +
        '<div class="d-flex gap-2"><button type="button" class="ad-btn ad-btn--dark ad-btn--sm" id="mdSave">Enregistrer</button><button type="button" class="ad-btn ad-btn--ghost ad-btn--sm" id="mdDel"><i class="bi bi-trash3" aria-hidden="true"></i>Supprimer</button></div></div>'
        : '<div class="ad-empty"><strong>Aucun visuel sélectionné</strong>Choisissez un visuel pour voir ses détails et modifier sa description.</div>';
      if (m) {
        $('#mdSave').addEventListener('click', function () { m.alt = $('#mdAlt').value.trim(); save(); toast('Description enregistrée'); });
        $('#mdDel').addEventListener('click', function () {
          var u = used(m);
          confirmBox('Supprimer ce visuel ?', u ? 'Il est utilisé dans ' + plural(u, 'article', 'articles') + ' : ils garderont un visuel par défaut.' : '« ' + m.name + ' » sera retiré de la médiathèque.', 'Supprimer', function () {
            S.articles.forEach(function (a) { if (a.mediaId === m.id) delete a.mediaId; });
            S.medias = S.medias.filter(function (x) { return x !== m; }); sel = null; save(); draw(); toast('Visuel supprimé');
          });
        });
      }
    }
    $('#mdGrid').addEventListener('click', function (e) { var b = e.target.closest('[data-m]'); if (b) { sel = b.getAttribute('data-m'); draw(); } });
    $('#mdQ').addEventListener('input', function () { q = this.value; draw(); });
    bindDrop('mdDrop', function () { sel = S.medias[0].id; draw(); $('.ad-pagehead p', v).textContent = plural(S.medias.length, 'visuel', 'visuels'); });
    draw();
  };

  /* ===================== Portraits ===================== */
  VIEWS.portraits = function (v) {
    var list = S.articles.filter(function (a) { return a.rub === 'portraits' && a.status !== 'corbeille'; });
    v.innerHTML = pagehead('Portraits', plural(list.length, 'portrait', 'portraits'), '<button type="button" class="ad-btn ad-btn--primary" id="newPortrait"><i class="bi bi-plus-lg" aria-hidden="true"></i>Nouveau portrait</button>') +
      (list.length ? '<div class="ad-cards">' + list.map(function (a) {
        var p = a.person || { name: a.title, role: '', city: '' };
        return '<article class="ad-card"><div class="ad-card__media">' + coverOf(a) + '</div><div class="ad-card__body">' + statusPill(a.status) + '<strong class="mt-2">' + esc(p.name) + '</strong><small>' + esc([p.role, p.city].filter(Boolean).join(', ')) + '</small><p>' + fr(a.chapo) + '</p></div>' +
          '<div class="ad-card__foot"><button type="button" class="ad-btn ad-btn--ghost ad-btn--sm" data-edit="' + a.id + '"><i class="bi bi-pencil" aria-hidden="true"></i>Modifier</button><button type="button" class="ad-btn ad-btn--ghost ad-btn--sm" data-preview="' + a.id + '"><i class="bi bi-eye" aria-hidden="true"></i>Aperçu</button></div></article>';
      }).join('') + '</div>' : '<div class="ad-panel ad-empty"><strong>Aucun portrait</strong>Créez le premier portrait avec le bouton « Nouveau portrait ».</div>');
    $('#newPortrait').addEventListener('click', function () { editorPreset = 'portraits'; editing = null; go('editeur'); });
    v.addEventListener('click', function (e) { var b = e.target.closest('[data-preview]'); if (b) preview(art(b.getAttribute('data-preview'))); });
  };

  /* ===================== Rubriques et régions ===================== */
  VIEWS.rubriques = function (v) {
    v.innerHTML = pagehead('Rubriques et régions', 'L’ordre ci-dessous est celui du menu du site.', '<button type="button" class="ad-btn ad-btn--primary" id="rbSave">Enregistrer</button>') +
      '<div class="ad-grid ad-grid--2"><section class="ad-panel"><div class="ad-panel__head"><h2>Rubriques</h2><button type="button" class="ad-btn ad-btn--outline ad-btn--sm" id="rbAdd"><i class="bi bi-plus-lg" aria-hidden="true"></i>Ajouter</button></div><div id="rbList"></div></section>' +
      '<section class="ad-panel"><div class="ad-panel__head"><h2>Les Afriques</h2></div><div id="rgList"></div></section></div>';
    var rubs = rubsSorted().map(clone), regs = regsSorted().map(clone);
    function count(k, id) { return S.articles.filter(function (a) { return a[k] === id && a.status !== 'corbeille'; }).length; }
    function draw() {
      $('#rbList').innerHTML = rubs.map(function (r, i) {
        var n = count('rub', r.id);
        return '<div class="ad-rowedit"><div class="ad-order"><button type="button" class="ad-iconbtn" data-up="' + i + '" aria-label="Monter ' + esc(r.label) + '"' + (i ? '' : ' disabled') + '><i class="bi bi-chevron-up" aria-hidden="true"></i></button><button type="button" class="ad-iconbtn" data-down="' + i + '" aria-label="Descendre ' + esc(r.label) + '"' + (i < rubs.length - 1 ? '' : ' disabled') + '><i class="bi bi-chevron-down" aria-hidden="true"></i></button></div>' +
          '<div class="d-grid gap-2"><label class="visually-hidden" for="rbL' + i + '">Nom</label><input class="ad-input" id="rbL' + i + '" data-l="' + i + '" value="' + esc(r.label) + '"><label class="visually-hidden" for="rbT' + i + '">Accroche</label><input class="ad-input" id="rbT' + i + '" data-tg="' + i + '" value="' + esc(r.tagline) + '" style="font-size:.8125rem"></div>' +
          '<label class="ad-switch" title="Afficher dans le menu"><input type="checkbox" data-menu="' + i + '"' + (r.menu ? ' checked' : '') + ' aria-label="Afficher ' + esc(r.label) + ' dans le menu"><span class="d-none d-xl-inline">Menu</span></label>' +
          '<div class="d-flex align-items-center gap-1"><span class="ad-muted tnum" style="font-size:.8125rem;min-width:4.5rem;text-align:right">' + plural(n, 'article', 'articles') + '</span><button type="button" class="ad-iconbtn ad-iconbtn--sm ad-iconbtn--danger" data-rm="' + i + '" aria-label="Supprimer ' + esc(r.label) + '"' + (n ? ' disabled title="Rubrique non vide"' : '') + '><i class="bi bi-trash3" aria-hidden="true"></i></button></div></div>';
      }).join('');
      $('#rgList').innerHTML = regs.map(function (r, i) {
        return '<div class="ad-rowedit" style="grid-template-columns:minmax(0,1fr) auto"><div><label class="visually-hidden" for="rgL' + i + '">Région</label><input class="ad-input" id="rgL' + i + '" data-rg="' + i + '" value="' + esc(r.label) + '"></div><span class="ad-muted tnum" style="font-size:.8125rem">' + plural(count('region', r.id), 'article', 'articles') + '</span></div>';
      }).join('');
    }
    v.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-up') || b.hasAttribute('data-down')) { var i = +(b.getAttribute('data-up') || b.getAttribute('data-down')), j = b.hasAttribute('data-up') ? i - 1 : i + 1; var t = rubs[i]; rubs[i] = rubs[j]; rubs[j] = t; draw(); }
      else if (b.hasAttribute('data-rm')) { rubs.splice(+b.getAttribute('data-rm'), 1); draw(); }
    });
    v.addEventListener('input', function (e) {
      var el = e.target;
      if (el.hasAttribute('data-l')) rubs[+el.getAttribute('data-l')].label = el.value;
      if (el.hasAttribute('data-tg')) rubs[+el.getAttribute('data-tg')].tagline = el.value;
      if (el.hasAttribute('data-rg')) regs[+el.getAttribute('data-rg')].label = el.value;
    });
    v.addEventListener('change', function (e) { if (e.target.hasAttribute('data-menu')) rubs[+e.target.getAttribute('data-menu')].menu = e.target.checked; });
    $('#rbAdd').addEventListener('click', function () {
      openDrawer('Nouvelle rubrique', field('nrL', 'Nom', '<input class="ad-input" id="nrL" placeholder="Ex. Santé">') + field('nrT', 'Accroche', '<input class="ad-input" id="nrT" placeholder="Une phrase qui présente la rubrique">') + '<button type="button" class="ad-btn ad-btn--primary w-100" id="nrOk">Ajouter la rubrique</button>', function (b, close) {
        $('#nrL', b).focus();
        $('#nrOk', b).addEventListener('click', function () {
          var l = $('#nrL', b).value.trim(), id = slugify(l);
          if (!setErr(b, 'nrL', !l ? 'Indiquez un nom.' : rubs.some(function (r) { return r.id === id; }) ? 'Cette rubrique existe déjà.' : '')) return;
          rubs.push({ id: id, label: l, tagline: $('#nrT', b).value.trim(), menu: true, order: rubs.length }); draw(); close(); toast('Rubrique ajoutée : pensez à enregistrer');
        });
      });
    });
    $('#rbSave').addEventListener('click', function () {
      if (rubs.some(function (r) { return !r.label.trim(); }) || regs.some(function (r) { return !r.label.trim(); })) { toast('Chaque rubrique et chaque région doit avoir un nom'); return; }
      rubs.forEach(function (r, i) { r.order = i; r.label = r.label.trim(); }); regs.forEach(function (r) { r.label = r.label.trim(); });
      S.rubriques = rubs; S.regions = regs; log('a mis à jour les rubriques'); save(); toast('Rubriques et régions enregistrées');
    });
    draw();
  };

  /* ===================== Agenda ===================== */
  var CATS = ['Politique', 'Économie', 'Société', 'Culture', 'Sports'];
  VIEWS.agenda = function (v) {
    var tab = 'avenir';
    v.innerHTML = pagehead('Agenda', 'Les événements affichés sur la page Agendas et sur l’accueil.', '<button type="button" class="ad-btn ad-btn--primary" id="evAdd"><i class="bi bi-plus-lg" aria-hidden="true"></i>Ajouter un événement</button>') +
      '<div class="ad-tabs" role="tablist" id="evTabs"></div><section class="ad-panel"><div class="ad-tablewrap"><table class="ad-table" id="evTable"></table></div></section>';
    function today() { return new Date().toISOString().slice(0, 10); }
    function draw() {
      var up = S.agenda.filter(function (e) { return (e.end || e.date) >= today(); }), past = S.agenda.filter(function (e) { return (e.end || e.date) < today(); });
      $('#evTabs').innerHTML = '<button type="button" role="tab" data-tb="avenir" aria-selected="' + (tab === 'avenir') + '">À venir<small>' + up.length + '</small></button><button type="button" role="tab" data-tb="passe" aria-selected="' + (tab === 'passe') + '">Passés<small>' + past.length + '</small></button>';
      var list = (tab === 'avenir' ? up : past).sort(function (a, b) { return (tab === 'avenir' ? 1 : -1) * a.date.localeCompare(b.date); });
      $('#evTable').innerHTML = '<thead><tr><th>Date</th><th>Événement</th><th>Lieu</th><th>Thème</th><th class="actions"><span class="visually-hidden">Actions</span></th></tr></thead><tbody>' +
        (list.length ? list.map(function (e) {
          return '<tr><td style="white-space:nowrap" class="tnum">' + dshort(e.date + 'T12:00:00') + (e.end && e.end !== e.date ? ' → ' + dshort(e.end + 'T12:00:00') : '') + '</td><td><div class="ad-title-cell"><a href="#" data-ev="' + esc(e.id) + '">' + fr(e.title) + '</a><small>' + fr(e.desc) + '</small></div></td><td style="white-space:nowrap">' + esc(e.city) + ', ' + esc(e.country) + '</td><td>' + esc(e.cat) + '</td>' +
            '<td class="actions"><button type="button" class="ad-iconbtn ad-iconbtn--sm" data-ev="' + esc(e.id) + '" aria-label="Modifier"><i class="bi bi-pencil" aria-hidden="true"></i></button><button type="button" class="ad-iconbtn ad-iconbtn--sm ad-iconbtn--danger" data-evdel="' + esc(e.id) + '" aria-label="Supprimer"><i class="bi bi-trash3" aria-hidden="true"></i></button></td></tr>';
        }).join('') : '<tr><td colspan="5"><div class="ad-empty"><strong>Aucun événement</strong>' + (tab === 'avenir' ? 'Ajoutez le prochain rendez-vous avec « Ajouter un événement ».' : 'Aucun événement passé.') + '</div></td></tr>') + '</tbody>';
    }
    function form(e) {
      var isNew = !e; e = e || { id: '', title: '', date: today(), end: today(), city: '', country: '', cat: 'Économie', desc: '' };
      openDrawer(isNew ? 'Nouvel événement' : 'Modifier l’événement',
        field('evT', 'Titre', '<input class="ad-input" id="evT" value="' + esc(e.title) + '">') +
        '<div class="ad-form-grid">' + field('evD', 'Début', '<input class="ad-input" type="date" id="evD" value="' + esc(e.date) + '">') + field('evE', 'Fin', '<input class="ad-input" type="date" id="evE" value="' + esc(e.end || e.date) + '">') + '</div>' +
        '<div class="ad-form-grid">' + field('evC', 'Ville', '<input class="ad-input" id="evC" value="' + esc(e.city) + '">') + field('evP', 'Pays', '<input class="ad-input" id="evP" value="' + esc(e.country) + '">') + '</div>' +
        field('evK', 'Thème', '<select class="ad-select" id="evK">' + options(CATS.map(function (c) { return { value: c, label: c }; }), e.cat) + '</select>') +
        field('evX', 'Description', '<textarea class="ad-textarea" id="evX" rows="4">' + esc(e.desc) + '</textarea>') +
        '<button type="button" class="ad-btn ad-btn--primary w-100" id="evOk">' + (isNew ? 'Ajouter l’événement' : 'Enregistrer') + '</button>',
        function (b, close) {
          $('#evOk', b).addEventListener('click', function () {
            var t = $('#evT', b).value.trim(), d = $('#evD', b).value, en = $('#evE', b).value || d;
            var ok = setErr(b, 'evT', t.length >= 5 ? '' : 'Indiquez un titre d’au moins 5 caractères.');
            ok = setErr(b, 'evD', d ? '' : 'Choisissez une date de début.') && ok;
            ok = setErr(b, 'evE', en >= d ? '' : 'La date de fin doit suivre la date de début.') && ok;
            ok = setErr(b, 'evC', $('#evC', b).value.trim() ? '' : 'Indiquez la ville.') && ok;
            if (!ok) return;
            var obj = { id: e.id || slugify(t) + '-' + uid().slice(-4), title: t, date: d, end: en, city: $('#evC', b).value.trim(), country: $('#evP', b).value.trim(), cat: $('#evK', b).value, desc: $('#evX', b).value.trim() };
            if (isNew) S.agenda.push(obj); else S.agenda[S.agenda.indexOf(S.agenda.filter(function (x) { return x.id === e.id; })[0])] = obj;
            log((isNew ? 'a ajouté l’événement « ' : 'a modifié l’événement « ') + t + ' »'); save(); close(); tab = obj.end >= today() ? 'avenir' : 'passe'; draw(); toast(isNew ? 'Événement ajouté' : 'Événement enregistré');
          });
        });
    }
    $('#evAdd').addEventListener('click', function () { form(null); });
    v.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-ev], [data-evdel], [data-tb]'); if (!b) return; ev.preventDefault();
      if (b.hasAttribute('data-tb')) { tab = b.getAttribute('data-tb'); draw(); return; }
      var id = b.getAttribute('data-ev') || b.getAttribute('data-evdel'), e = S.agenda.filter(function (x) { return x.id === id; })[0];
      if (b.hasAttribute('data-ev')) form(e);
      else confirmBox('Supprimer cet événement ?', '« ' + e.title + ' » sera retiré de l’agenda.', 'Supprimer', function () { S.agenda = S.agenda.filter(function (x) { return x !== e; }); log('a supprimé l’événement « ' + e.title + ' »'); save(); draw(); toast('Événement supprimé'); });
    });
    draw();
  };

  /* ===================== Flash info ===================== */
  var FLASH_MAX = 140;
  // le texte d'un flash reprend le titre de l'article, raccourci si besoin
  function flashTitle(t) { t = String(t || '').trim(); if (t.length <= FLASH_MAX) return t; var c = t.slice(0, FLASH_MAX - 1); var k = c.lastIndexOf(' '); return (k > 80 ? c.slice(0, k) : c).replace(/[\s,;:–-]+$/, '') + '…'; }
  function flashOf(id) { return S.flash.filter(function (f) { return f.articleId === id; })[0]; }
  function syncFlash() { S.flash.forEach(function (f) { var a = art(f.articleId); if (a && f.auto) f.text = flashTitle(a.title); }); }
  function flashState(f) {
    var a = art(f.articleId);
    if (!a) return ['libre', 'Article supprimé'];
    if (a.status === 'corbeille') return ['libre', 'Article à la corbeille'];
    if (!f.active) return ['brouillon', 'Désactivé'];
    var t = day(0);
    if (f.start && f.start > t) return ['programme', 'Du ' + dshort(f.start + 'T12:00:00') + (f.end ? ' au ' + dshort(f.end + 'T12:00:00') : '')];
    if (f.end && f.end < t) return ['libre', 'Terminé le ' + dshort(f.end + 'T12:00:00')];
    if (a.status === 'programme') return ['programme', 'Publication ' + rel(a.date)];
    if (a.status !== 'publie') return ['relecture', 'Article non publié'];
    return ['active', 'En ligne' + (f.end ? ' jusqu’au ' + dshort(f.end + 'T12:00:00') : '')];
  }
  function flashLive() { return S.flash.filter(function (f) { return flashState(f)[0] === 'active'; }); }

  VIEWS.flash = function (v) {
    syncFlash();
    v.innerHTML = pagehead('Flash info', 'Chaque flash renvoie vers un article et reprend son titre. Cochez aussi « Mettre en flash info » en rédigeant un article.', '') +
      '<section class="ad-panel mb-4"><div class="ad-ticker" aria-label="Aperçu du bandeau"><b>Flash info</b><div class="ad-ticker__view"><div class="ad-ticker__track" id="flTrack"></div></div></div>' +
      '<form class="ad-panel__body" id="flForm" novalidate><label class="ad-label d-block mb-2" for="flArt">Ajouter un flash</label><div class="d-flex gap-2 flex-wrap"><select class="ad-select" id="flArt" style="flex:1;min-width:240px"></select><button class="ad-btn ad-btn--primary" type="submit"><i class="bi bi-plus-lg" aria-hidden="true"></i>Ajouter en tête</button></div><p class="ad-hint">Les articles programmés apparaîtront dans le bandeau dès leur publication.</p><p class="ad-error" id="flArtErr"></p></form></section>' +
      '<section class="ad-panel"><div class="ad-panel__head"><h2>Messages</h2><span class="ad-muted" style="font-size:.8125rem" id="flCount"></span></div><div id="flList"></div></section>';
    function tickerHtml() {
      var live = flashLive(), it = live.map(function (f) { return '<a href="#" data-edit="' + esc(f.articleId) + '">' + fr(f.text) + '</a>'; }).join('');
      return live.length ? it + it : '<span>Aucun flash en ligne : le bandeau est masqué sur le site.</span>';
    }
    function draw() {
      var used = {}; S.flash.forEach(function (f) { used[f.articleId] = true; });
      var choices = S.articles.filter(function (a) { return (a.status === 'publie' || a.status === 'programme') && !used[a.id]; }).sort(function (a, b) { return b.date.localeCompare(a.date); });
      $('#flArt').innerHTML = '<option value="">Choisir un article publié ou programmé…</option>' + choices.map(function (a) { return '<option value="' + esc(a.id) + '">' + esc((a.status === 'programme' ? '[Programmé] ' : '') + a.title) + '</option>'; }).join('');
      $('#flTrack').innerHTML = tickerHtml();
      $('#flCount').textContent = flashLive().length + ' en ligne sur ' + S.flash.length;
      $('#flList').innerHTML = S.flash.length ? S.flash.map(function (f, i) {
        var a = art(f.articleId), st = flashState(f);
        return '<div class="ad-rowedit ad-flashrow"><div class="ad-order"><button type="button" class="ad-iconbtn" data-fu="' + i + '" aria-label="Monter"' + (i ? '' : ' disabled') + '><i class="bi bi-chevron-up" aria-hidden="true"></i></button><button type="button" class="ad-iconbtn" data-fd="' + i + '" aria-label="Descendre"' + (i < S.flash.length - 1 ? '' : ' disabled') + '><i class="bi bi-chevron-down" aria-hidden="true"></i></button></div>' +
          '<div class="d-grid gap-1"><label class="visually-hidden" for="fl' + i + '">Texte du flash ' + (i + 1) + '</label><input class="ad-input" id="fl' + i + '" data-ft="' + i + '" maxlength="' + FLASH_MAX + '" value="' + esc(f.text) + '">' +
            '<div class="ad-flashrow__meta"><span class="ad-status ad-status--' + st[0] + '">' + esc(st[1]) + '</span>' +
            (a ? '<a href="#" data-edit="' + esc(a.id) + '"><i class="bi bi-link-45deg" aria-hidden="true"></i>' + (f.auto ? 'Ouvrir l’article' : 'Article : ' + fr(a.title)) + '</a>' : '<span class="ad-muted">Article introuvable</span>') +
            (f.auto ? '<span class="ad-muted"><i class="bi bi-arrow-repeat" aria-hidden="true"></i> Suit le titre</span>' : (a ? '<button type="button" class="ad-linkbtn" data-fr="' + i + '"><i class="bi bi-arrow-repeat" aria-hidden="true"></i>Reprendre le titre de l’article</button>' : '')) +
            '<span class="ad-flashrow__dates"><label><i class="bi bi-calendar-event" aria-hidden="true"></i> Du <input class="ad-input ad-input--sm" type="date" data-fs="' + i + '" value="' + esc(f.start || '') + '" aria-label="Date de début du flash ' + (i + 1) + '"></label><label>au <input class="ad-input ad-input--sm" type="date" data-fe="' + i + '" value="' + esc(f.end || '') + '" aria-label="Date de fin du flash ' + (i + 1) + '" min="' + esc(f.start || '') + '"></label></span>' +
            '</div></div>' +
          '<label class="ad-switch"><input type="checkbox" data-fa="' + i + '"' + (f.active ? ' checked' : '') + ' aria-label="Flash actif"><span class="d-none d-md-inline">Actif</span></label>' +
          '<button type="button" class="ad-iconbtn ad-iconbtn--sm ad-iconbtn--danger" data-fx="' + i + '" aria-label="Retirer ce flash"><i class="bi bi-trash3" aria-hidden="true"></i></button></div>';
      }).join('') : '<div class="ad-empty"><strong>Aucun flash</strong>Choisissez un article ci-dessus pour créer le premier flash.</div>';
    }
    $('#flForm').addEventListener('submit', function (e) {
      e.preventDefault(); var id = $('#flArt').value;
      if (!setErr(this, 'flArt', id ? '' : 'Choisissez l’article vers lequel le flash doit renvoyer.')) return;
      var a = art(id); S.flash.unshift({ id: 'f' + uid(), articleId: id, text: flashTitle(a.title), auto: true, active: true, start: day(0), end: addDays(day(0), 7) });
      log('a mis en flash « ' + a.title + ' »'); save(); draw(); toast(a.status === 'programme' ? 'Flash ajouté : il s’affichera à la publication' : 'Flash ajouté en tête du bandeau');
    });
    var tm;
    v.addEventListener('input', function (e) {
      if (!e.target.hasAttribute('data-ft')) return;
      var f = S.flash[+e.target.getAttribute('data-ft')]; f.text = e.target.value;
      var wasAuto = f.auto; f.auto = art(f.articleId) ? flashTitle(art(f.articleId).title) === f.text.trim() : false;
      clearTimeout(tm); tm = setTimeout(function () { save(); $('#flTrack').innerHTML = tickerHtml(); if (wasAuto !== f.auto) { var pos = e.target.selectionStart, id = e.target.id; draw(); var el = $('#' + id); el.focus(); el.setSelectionRange(pos, pos); } }, 300);
    });
    v.addEventListener('change', function (e) {
      if (e.target.hasAttribute('data-fa')) { S.flash[+e.target.getAttribute('data-fa')].active = e.target.checked; save(); draw(); toast(e.target.checked ? 'Flash activé' : 'Flash désactivé'); return; }
      if (e.target.hasAttribute('data-fs') || e.target.hasAttribute('data-fe')) {
        var fi = +(e.target.getAttribute('data-fs') || e.target.getAttribute('data-fe')), ff = S.flash[fi];
        if (e.target.hasAttribute('data-fs')) ff.start = e.target.value || ''; else ff.end = e.target.value || '';
        if (ff.start && ff.end && ff.end < ff.start) { if (e.target.hasAttribute('data-fs')) ff.end = ff.start; else ff.start = ff.end; toast('La fin ne peut pas précéder le début : ajusté'); }
        save(); draw();
      }
    });
    v.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-fu') || b.hasAttribute('data-fd')) { var i = +(b.getAttribute('data-fu') || b.getAttribute('data-fd')), j = b.hasAttribute('data-fu') ? i - 1 : i + 1, t = S.flash[i]; S.flash[i] = S.flash[j]; S.flash[j] = t; save(); draw(); }
      else if (b.hasAttribute('data-fx')) { S.flash.splice(+b.getAttribute('data-fx'), 1); save(); draw(); toast('Flash retiré du bandeau'); }
      else if (b.hasAttribute('data-fr')) { var f = S.flash[+b.getAttribute('data-fr')]; f.auto = true; syncFlash(); save(); draw(); toast('Le flash reprend le titre de l’article'); }
    });
    draw();
  };

  /* ===================== Débats ===================== */
  function debatStatus(d) { var t = day(0); return d.start > t ? 'programme' : d.end < t ? 'archive' : 'encours'; }
  var DB_LABEL = { encours: 'En cours', programme: 'Programmé', archive: 'Archivé' };
  var DB_PILL = { encours: 'active', programme: 'programme', archive: 'libre' };
  function currentDebat() { return S.debats.filter(function (d) { return debatStatus(d) === 'encours'; }).sort(function (a, b) { return b.start.localeCompare(a.start); })[0] || null; }
  function pct(d) { var t = d.votes.pour + d.votes.contre; return t ? Math.round(d.votes.pour / t * 100) : 0; }
  function splitBar(d, small) {
    var t = d.votes.pour + d.votes.contre, p = pct(d);
    if (!t) return '<span class="ad-muted" style="font-size:.8125rem">Aucun vote</span>';
    return '<div class="ad-split' + (small ? ' ad-split--sm' : '') + '" role="img" aria-label="' + p + ' % pour, ' + (100 - p) + ' % contre"><span style="width:' + p + '%"></span><span style="width:' + (100 - p) + '%"></span></div>';
  }
  function periodText(s, e) { return dshort(s + 'T12:00:00') + ' au ' + dshort(e + 'T12:00:00'); }
  function period(s, e) { return dshort(s + 'T12:00:00') + ' → ' + dshort(e + 'T12:00:00'); }
  function addDays(iso, n) { var d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

  function debatForm(src, onDone) {
    var isNew = !src, cur = currentDebat();
    var lastEnd = S.debats.reduce(function (m, d) { return d.end > m ? d.end : m; }, day(-1));
    var d = src ? clone(src) : { id: '', question: '', pour: { text: '', who: '' }, contre: { text: '', who: '' }, votes: { pour: 0, contre: 0 }, start: lastEnd >= day(0) ? addDays(lastEnd, 1) : day(0), end: '' };
    if (!d.end) d.end = addDays(d.start, 6);
    openDrawer(isNew ? 'Nouveau débat' : 'Modifier le débat',
      field('nbQ', 'Question', '<textarea class="ad-textarea" id="nbQ" rows="2" placeholder="Ex. Faut-il une monnaie unique en Afrique de l’Ouest ?">' + esc(d.question) + '</textarea>', 'Une question fermée, à laquelle on répond par oui ou par non.') +
      '<p class="ad-label mt-3 mb-2">Pour</p>' + field('nbP', 'Argument', '<textarea class="ad-textarea" id="nbP" rows="3">' + esc(d.pour.text) + '</textarea>') + field('nbPw', 'Signé par', '<input class="ad-input" id="nbPw" value="' + esc(d.pour.who) + '" placeholder="Nom, fonction">') +
      '<p class="ad-label mt-3 mb-2">Contre</p>' + field('nbC', 'Argument', '<textarea class="ad-textarea" id="nbC" rows="3">' + esc(d.contre.text) + '</textarea>') + field('nbCw', 'Signé par', '<input class="ad-input" id="nbCw" value="' + esc(d.contre.who) + '" placeholder="Nom, fonction">') +
      '<div class="ad-form-grid mt-3">' + field('nbS', 'Début', '<input class="ad-input" type="date" id="nbS" value="' + esc(d.start) + '">') + field('nbE', 'Fin', '<input class="ad-input" type="date" id="nbE" value="' + esc(d.end) + '">') + '</div>' +
      (cur && (!src || src.id !== cur.id) ? '<p class="ad-note mt-0 mb-3">Si la période commence pendant le débat en cours (« ' + fr(cur.question) + ' »), celui-ci s’arrête la veille et passe aux archives.</p>' : '') +
      '<button type="button" class="ad-btn ad-btn--primary w-100" id="nbOk">' + (isNew ? 'Créer le débat' : 'Enregistrer') + '</button>',
      function (b, close) {
        $('#nbQ', b).focus();
        $('#nbOk', b).addEventListener('click', function () {
          var q = $('#nbQ', b).value.trim(), s = $('#nbS', b).value, e = $('#nbE', b).value;
          var ok = setErr(b, 'nbQ', q.length >= 10 ? '' : 'La question doit faire au moins 10 caractères.');
          ok = setErr(b, 'nbP', $('#nbP', b).value.trim() ? '' : 'Ajoutez l’argument pour.') && ok;
          ok = setErr(b, 'nbC', $('#nbC', b).value.trim() ? '' : 'Ajoutez l’argument contre.') && ok;
          ok = setErr(b, 'nbS', s ? '' : 'Choisissez la date de début.') && ok;
          ok = setErr(b, 'nbE', e && e >= s ? '' : 'La fin doit suivre le début.') && ok;
          if (!ok) return;
          // chevauchements : un débat commencé avant s'arrête la veille, un débat qui commence après bloque
          var others = S.debats.filter(function (x) { return x.id !== d.id && x.start <= e && x.end >= s; });
          var blocking = others.filter(function (x) { return x.start >= s; })[0];
          if (blocking) { setErr(b, 'nbS', 'Le débat « ' + blocking.question + ' » est déjà prévu du ' + periodText(blocking.start, blocking.end) + '. Choisissez d’autres dates ou modifiez-le.'); return; }
          others.forEach(function (x) { x.end = addDays(s, -1); });
          var obj = { id: d.id || 'd' + uid(), question: q, pour: { text: $('#nbP', b).value.trim(), who: $('#nbPw', b).value.trim() }, contre: { text: $('#nbC', b).value.trim(), who: $('#nbCw', b).value.trim() }, votes: d.votes, start: s, end: e };
          if (isNew) S.debats.push(obj); else S.debats[S.debats.indexOf(S.debats.filter(function (x) { return x.id === d.id; })[0])] = obj;
          log((isNew ? 'a créé le débat « ' : 'a modifié le débat « ') + q + ' »'); save(); close();
          toast(isNew ? (debatStatus(obj) === 'encours' ? 'Débat lancé : il est en ligne sur l’accueil' : 'Débat programmé à partir du ' + dshort(s + 'T12:00:00')) : 'Débat enregistré');
          onDone();
        });
      });
  }

  VIEWS.debat = function (v) {
    var tab = 'tous';
    function draw() {
      var cur = currentDebat(), list = S.debats.slice().sort(function (a, b) { return b.start.localeCompare(a.start); });
      var counts = { tous: list.length, encours: 0, programme: 0, archive: 0 }; list.forEach(function (d) { counts[debatStatus(d)]++; });
      var shown = list.filter(function (d) { return tab === 'tous' || debatStatus(d) === tab; });
      var tot = cur ? cur.votes.pour + cur.votes.contre : 0, p = cur ? pct(cur) : 0;
      v.innerHTML = pagehead('Débats de la semaine', 'Une question, deux tribunes, le vote des lecteurs. Le débat en cours s’affiche sur l’accueil.', '<button type="button" class="ad-btn ad-btn--primary" id="dbNew"><i class="bi bi-plus-lg" aria-hidden="true"></i>Nouveau débat</button>') +
        (cur ?
        '<div class="ad-grid ad-grid--2 mb-4"><section class="ad-panel" aria-labelledby="dbCurT"><div class="ad-panel__head"><h2 id="dbCurT">Débat en cours</h2>' + '<span class="ad-muted" style="font-size:.8125rem">' + period(cur.start, cur.end) + '</span></div><div class="ad-panel__body">' +
          '<p class="ad-debq">' + fr(cur.question) + '</p><div class="ad-grid ad-grid--halves">' +
          '<div class="ad-debside"><span class="ad-debside__k">Pour</span><p>' + fr(cur.pour.text) + '</p><small>' + esc(cur.pour.who) + '</small></div>' +
          '<div class="ad-debside ad-debside--contre"><span class="ad-debside__k">Contre</span><p>' + fr(cur.contre.text) + '</p><small>' + esc(cur.contre.who) + '</small></div></div></div>' +
          '<div class="ad-panel__foot d-flex gap-2 flex-wrap"><button type="button" class="ad-btn ad-btn--outline ad-btn--sm" data-dbe="' + cur.id + '"><i class="bi bi-pencil" aria-hidden="true"></i>Modifier</button><button type="button" class="ad-btn ad-btn--ghost ad-btn--sm" data-dbend="' + cur.id + '"><i class="bi bi-stop-circle" aria-hidden="true"></i>Terminer maintenant</button></div></section>' +
        '<section class="ad-panel" aria-labelledby="dbVoteT"><div class="ad-panel__head"><h2 id="dbVoteT">Votes</h2><span class="ad-muted tnum" style="font-size:.8125rem">' + plural(tot, 'vote', 'votes') + '</span></div><div class="ad-panel__body">' +
          '<div>' + splitBar(cur) + '</div>' + (tot ? '<div class="ad-legend"><span><i style="background:var(--text)"></i>Pour <b class="tnum">' + p + ' %</b></span><span><i style="background:var(--orange)"></i>Contre <b class="tnum">' + (100 - p) + ' %</b></span></div>' : '') +
          '<button type="button" class="ad-btn ad-btn--outline ad-btn--sm mt-4" data-dbreset="' + cur.id + '"' + (tot ? '' : ' disabled') + '><i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i>Remettre les votes à zéro</button></div></section></div>'
        : '<section class="ad-panel ad-empty mb-4"><strong>Aucun débat en cours</strong>L’accueil affiche le dernier débat archivé. <button type="button" class="ad-btn ad-btn--primary ad-btn--sm mt-3" id="dbNew2">Lancer un débat</button></section>') +
        '<div class="ad-tabs" role="tablist">' + [['tous', 'Tous'], ['encours', 'En cours'], ['programme', 'Programmés'], ['archive', 'Archivés']].map(function (t) { return '<button type="button" role="tab" data-dbt="' + t[0] + '" aria-selected="' + (tab === t[0]) + '">' + t[1] + '<small>' + counts[t[0]] + '</small></button>'; }).join('') + '</div>' +
        '<section class="ad-panel"><div class="ad-tablewrap"><table class="ad-table"><thead><tr><th>Question</th><th>Période</th><th>Résultat</th><th>Statut</th><th class="actions"><span class="visually-hidden">Actions</span></th></tr></thead><tbody>' +
        (shown.length ? shown.map(function (d) {
          var st = debatStatus(d), t = d.votes.pour + d.votes.contre;
          return '<tr><td><div class="ad-title-cell"><a href="#" data-dbe="' + d.id + '">' + fr(d.question) + '</a>' + (d.pour.who || d.contre.who ? '<small>Pour : ' + esc(d.pour.who || 'non signé') + '. Contre : ' + esc(d.contre.who || 'non signé') + '</small>' : '') + '</div></td>' +
            '<td class="ad-muted" style="white-space:nowrap">' + period(d.start, d.end) + '</td>' +
            '<td style="min-width:150px">' + (st === 'programme' ? '<span class="ad-muted">—</span>' : splitBar(d, true) + (t ? '<small class="ad-muted tnum d-block mt-1">' + pct(d) + ' % pour, ' + plural(t, 'vote', 'votes') + '</small>' : '')) + '</td>' +
            '<td><span class="ad-status ad-status--' + DB_PILL[st] + '">' + DB_LABEL[st] + '</span></td>' +
            '<td class="actions">' + (st === 'programme' ? '<button type="button" class="ad-btn ad-btn--dark ad-btn--sm" data-dbgo="' + d.id + '">Lancer maintenant</button>' : '') +
              '<button type="button" class="ad-iconbtn ad-iconbtn--sm" data-dbe="' + d.id + '" aria-label="Modifier"><i class="bi bi-pencil" aria-hidden="true"></i></button>' +
              '<button type="button" class="ad-iconbtn ad-iconbtn--sm" data-dbdup="' + d.id + '" aria-label="Réutiliser comme modèle" title="Réutiliser comme modèle"><i class="bi bi-copy" aria-hidden="true"></i></button>' +
              '<button type="button" class="ad-iconbtn ad-iconbtn--sm ad-iconbtn--danger" data-dbx="' + d.id + '" aria-label="Supprimer"><i class="bi bi-trash3" aria-hidden="true"></i></button></td></tr>';
        }).join('') : '<tr><td colspan="5"><div class="ad-empty"><strong>Aucun débat</strong>Créez-en un avec « Nouveau débat ».</div></td></tr>') +
        '</tbody></table></div></section>';
    }
    function byId(id) { return S.debats.filter(function (d) { return d.id === id; })[0]; }
    v.addEventListener('click', function (e) {
      var b = e.target.closest('button, a'); if (!b) return;
      if (b.id === 'dbNew' || b.id === 'dbNew2') { debatForm(null, draw); return; }
      var id;
      if ((id = b.getAttribute('data-dbt'))) { tab = id; draw(); }
      else if ((id = b.getAttribute('data-dbe'))) { e.preventDefault(); debatForm(byId(id), draw); }
      else if ((id = b.getAttribute('data-dbdup'))) { var src = clone(byId(id)); src.id = ''; src.votes = { pour: 0, contre: 0 }; src.start = ''; src.end = ''; debatForm(null, draw); setTimeout(function () { $('#nbQ').value = src.question; $('#nbP').value = src.pour.text; $('#nbPw').value = src.pour.who; $('#nbC').value = src.contre.text; $('#nbCw').value = src.contre.who; }, 0); }
      else if ((id = b.getAttribute('data-dbend'))) { var c = byId(id); confirmBox('Terminer ce débat ?', 'Il passe aux archives avec ses ' + plural(c.votes.pour + c.votes.contre, 'vote', 'votes') + '.', 'Terminer', function () { c.end = day(-1); if (c.start > c.end) c.start = c.end; log('a terminé le débat « ' + c.question + ' »'); save(); draw(); toast('Débat archivé'); }); }
      else if ((id = b.getAttribute('data-dbgo'))) {
        var g = byId(id), cur = currentDebat();
        confirmBox('Lancer ce débat maintenant ?', cur ? '« ' + cur.question + ' » sera archivé et remplacé sur l’accueil.' : 'Il s’affichera tout de suite sur l’accueil.', 'Lancer', function () {
          var len = Math.max(0, Math.round((new Date(g.end) - new Date(g.start)) / 864e5));
          if (cur) { cur.end = day(-1); if (cur.start > cur.end) cur.start = cur.end; }
          g.start = day(0); g.end = addDays(g.start, len);
          S.debats.forEach(function (x) { if (x !== g && x.start > g.start && x.start <= g.end) g.end = addDays(x.start, -1); });
          log('a lancé le débat « ' + g.question + ' »'); save(); tab = 'tous'; draw(); toast('Débat en ligne sur l’accueil');
        });
      }
      else if ((id = b.getAttribute('data-dbreset'))) { var r = byId(id); confirmBox('Remettre les votes à zéro ?', 'Les ' + plural(r.votes.pour + r.votes.contre, 'vote', 'votes') + ' de ce débat seront effacés.', 'Remettre à zéro', function () { r.votes = { pour: 0, contre: 0 }; save(); draw(); toast('Votes remis à zéro'); }); }
      else if ((id = b.getAttribute('data-dbx'))) { var x = byId(id); confirmBox('Supprimer ce débat ?', '« ' + x.question + ' » et ses votes seront supprimés.', 'Supprimer', function () { S.debats = S.debats.filter(function (y) { return y !== x; }); log('a supprimé le débat « ' + x.question + ' »'); save(); draw(); toast('Débat supprimé'); }); }
    });
    draw();
  };

  /* ===================== Commentaires ===================== */
  VIEWS.commentaires = function (v) {
    var tab = 'attente';
    v.innerHTML = pagehead('Commentaires', 'Modérez les réactions des lecteurs avant leur publication.', '') + '<div class="ad-tabs" role="tablist" id="cmTabs"></div><section class="ad-panel" id="cmList"></section>';
    function draw() {
      var defs = [['attente', 'En attente'], ['approuve', 'Approuvés'], ['spam', 'Indésirables']];
      $('#cmTabs').innerHTML = defs.map(function (d) { return '<button type="button" role="tab" data-ct="' + d[0] + '" aria-selected="' + (tab === d[0]) + '">' + d[1] + '<small>' + S.comments.filter(function (c) { return c.status === d[0]; }).length + '</small></button>'; }).join('');
      var list = S.comments.filter(function (c) { return c.status === tab; }).sort(function (a, b) { return b.date.localeCompare(a.date); });
      $('#cmList').innerHTML = list.length ? list.map(function (c) {
        var a = art(c.articleId);
        return '<article class="ad-comment"><span class="ad-avatar" aria-hidden="true">' + initials(c.author) + '</span><div><div class="ad-comment__head"><strong>' + esc(c.author) + '</strong><small>' + esc(c.email) + '</small><small>' + rel(c.date) + '</small>' + '<span class="ad-status ad-status--' + c.status + '">' + { attente: 'En attente', approuve: 'Approuvé', spam: 'Indésirable' }[c.status] + '</span></div>' +
          '<p class="ad-comment__text">' + fr(c.text) + '</p>' + (a ? '<p class="ad-comment__on">Sur <a href="#" data-edit="' + a.id + '">' + fr(a.title) + '</a></p>' : '') +
          (c.reply ? '<div class="ad-reply-shown"><b>Réponse de la rédaction :</b> ' + fr(c.reply) + '</div>' : '') +
          '<div class="ad-comment__actions">' +
            (c.status !== 'approuve' ? '<button type="button" class="ad-btn ad-btn--dark ad-btn--sm" data-cs="approuve" data-c="' + c.id + '"><i class="bi bi-check-lg" aria-hidden="true"></i>Approuver</button>' : '') +
            (c.status !== 'spam' ? '<button type="button" class="ad-btn ad-btn--outline ad-btn--sm" data-cs="spam" data-c="' + c.id + '"><i class="bi bi-slash-circle" aria-hidden="true"></i>Indésirable</button>' : '') +
            (c.status === 'approuve' && !c.reply ? '<button type="button" class="ad-btn ad-btn--outline ad-btn--sm" data-cr="' + c.id + '"><i class="bi bi-reply" aria-hidden="true"></i>Répondre</button>' : '') +
            '<button type="button" class="ad-btn ad-btn--ghost ad-btn--sm" data-cx="' + c.id + '"><i class="bi bi-trash3" aria-hidden="true"></i>Supprimer</button></div>' +
          '<div class="ad-reply" id="rp' + c.id + '" hidden><label class="visually-hidden" for="rpt' + c.id + '">Votre réponse</label><textarea class="ad-textarea" id="rpt' + c.id + '" rows="3" placeholder="Votre réponse, publiée au nom de la rédaction"></textarea><div class="d-flex gap-2"><button type="button" class="ad-btn ad-btn--primary ad-btn--sm" data-rs="' + c.id + '">Publier la réponse</button><button type="button" class="ad-btn ad-btn--ghost ad-btn--sm" data-rc="' + c.id + '">Annuler</button></div></div>' +
          '</div></article>';
      }).join('') : '<div class="ad-empty"><strong>' + (tab === 'attente' ? 'Aucun commentaire à modérer' : 'Aucun commentaire') + '</strong>' + (tab === 'attente' ? 'Les nouveaux commentaires apparaîtront ici.' : 'Cette liste est vide.') + '</div>';
    }
    function cm(id) { return S.comments.filter(function (c) { return c.id === id; })[0]; }
    v.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.hasAttribute('data-ct')) { tab = b.getAttribute('data-ct'); draw(); }
      else if (b.hasAttribute('data-cs')) { var c = cm(b.getAttribute('data-c')), s = b.getAttribute('data-cs'); c.status = s; save(); draw(); renderNav('commentaires'); toast(s === 'approuve' ? 'Commentaire approuvé et publié' : 'Commentaire classé indésirable'); }
      else if (b.hasAttribute('data-cx')) { var x = cm(b.getAttribute('data-cx')); confirmBox('Supprimer ce commentaire ?', 'Le commentaire de ' + x.author + ' sera supprimé.', 'Supprimer', function () { S.comments = S.comments.filter(function (y) { return y !== x; }); save(); draw(); renderNav('commentaires'); toast('Commentaire supprimé'); }); }
      else if (b.hasAttribute('data-cr')) { var id = b.getAttribute('data-cr'); $('#rp' + id).hidden = false; $('#rpt' + id).focus(); }
      else if (b.hasAttribute('data-rc')) { $('#rp' + b.getAttribute('data-rc')).hidden = true; }
      else if (b.hasAttribute('data-rs')) { var rid = b.getAttribute('data-rs'), txt = $('#rpt' + rid).value.trim(); if (txt.length < 2) { $('#rpt' + rid).focus(); toast('Écrivez votre réponse avant de la publier'); return; } cm(rid).reply = txt; save(); draw(); toast('Réponse publiée'); }
    });
    draw();
  };

  /* ===================== Newsletter ===================== */
  VIEWS.newsletter = function (v) {
    var q = '';
    var active = S.subscribers.filter(function (s) { return s.status === 'actif'; }).length;
    v.innerHTML = pagehead('Newsletter', 'Le brief panafricain : abonnés et envois.', '<button type="button" class="ad-btn ad-btn--outline" id="nlExport"><i class="bi bi-download" aria-hidden="true"></i>Exporter (CSV)</button><button type="button" class="ad-btn ad-btn--primary" id="nlCompose"><i class="bi bi-send" aria-hidden="true"></i>Préparer un envoi</button>') +
      '<div class="ad-grid ad-grid--kpi mb-4"><div class="ad-panel ad-kpi"><p class="ad-kpi__label">Abonnés actifs</p><p class="ad-kpi__value" id="nlActive">' + active + '</p></div><div class="ad-panel ad-kpi"><p class="ad-kpi__label">Désinscrits</p><p class="ad-kpi__value">' + (S.subscribers.length - active) + '</p></div><div class="ad-panel ad-kpi"><p class="ad-kpi__label">Envois</p><p class="ad-kpi__value">' + S.campaigns.length + '</p><p class="ad-kpi__hint">' + (S.campaigns[0] ? 'Dernier : ' + dshort(S.campaigns[0].date) : '') + '</p></div></div>' +
      '<div class="ad-grid ad-grid--2"><section class="ad-panel"><div class="ad-toolbar"><div class="ad-search"><i class="bi bi-search" aria-hidden="true"></i><label class="visually-hidden" for="nlQ">Rechercher un abonné</label><input class="ad-input" id="nlQ" type="search" placeholder="Nom, e-mail ou pays…"></div><button type="button" class="ad-btn ad-btn--dark ad-btn--sm" id="nlAdd"><i class="bi bi-person-plus" aria-hidden="true"></i>Ajouter</button></div><div class="ad-tablewrap"><table class="ad-table" id="nlTable"></table></div></section>' +
      '<section class="ad-panel"><div class="ad-panel__head"><h2>Derniers envois</h2></div><ul class="ad-list" id="nlCamp"></ul></section></div>';
    function draw() {
      var list = S.subscribers.filter(function (s) { return !q || norm(s.name + ' ' + s.email + ' ' + s.country).indexOf(norm(q)) > -1; }).sort(function (a, b) { return (b.since||'').localeCompare(a.since||''); });
      $('#nlTable').innerHTML = '<thead><tr><th>Abonné</th><th>Pays</th><th>Inscription</th><th>Statut</th><th class="actions"><span class="visually-hidden">Actions</span></th></tr></thead><tbody>' +
        (list.length ? list.map(function (s) { return '<tr><td><div class="ad-title-cell" style="min-width:200px"><strong>' + esc(s.name) + '</strong><small>' + esc(s.email) + '</small></div></td><td>' + esc(s.country) + '</td><td class="ad-muted">' + dshort(s.since) + '</td><td><span class="ad-status ad-status--' + (s.status === 'actif' ? 'active' : 'libre') + '">' + (s.status === 'actif' ? 'Abonné' : 'Désinscrit') + '</span></td><td class="actions">' + (s.status === 'actif' ? '<button type="button" class="ad-btn ad-btn--ghost ad-btn--sm" data-unsub="' + s.id + '">Désinscrire</button>' : '<button type="button" class="ad-btn ad-btn--ghost ad-btn--sm" data-resub="' + s.id + '">Réinscrire</button>') + '</td></tr>'; }).join('') : '<tr><td colspan="5"><div class="ad-empty"><strong>Aucun abonné</strong>Aucun abonné ne correspond à « ' + esc(q) + ' ».</div></td></tr>') + '</tbody>';
      $('#nlCamp').innerHTML = S.campaigns.map(function (c) { return '<li><span class="ad-list__icon"><i class="bi bi-' + (c.status === 'programmee' ? 'clock' : 'envelope-check') + '" aria-hidden="true"></i></span><div class="ad-list__main"><strong>' + fr(c.subject) + '</strong><small>' + (c.status === 'programmee' ? 'Programmé pour le ' + dlong(c.date) : 'Envoyé le ' + dlong(c.date)) + ', ' + plural(c.recipients, 'destinataire', 'destinataires') + '</small></div></li>'; }).join('');
      $('#nlActive').textContent = S.subscribers.filter(function (s) { return s.status === 'actif'; }).length;
    }
    $('#nlQ').addEventListener('input', function () { q = this.value; draw(); });
    v.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var id = b.getAttribute('data-unsub') || b.getAttribute('data-resub');
      if (id) { var s = S.subscribers.filter(function (x) { return x.id === id; })[0]; s.status = b.hasAttribute('data-unsub') ? 'desinscrit' : 'actif'; save(); draw(); toast(s.status === 'actif' ? s.name + ' est de nouveau abonné' : s.name + ' est désinscrit'); }
    });
    $('#nlAdd').addEventListener('click', function () {
      openDrawer('Ajouter un abonné', field('sbN', 'Nom', '<input class="ad-input" id="sbN">') + field('sbE', 'Adresse e-mail', '<input class="ad-input" type="email" id="sbE">') + field('sbC', 'Pays', '<input class="ad-input" id="sbC">') + '<button type="button" class="ad-btn ad-btn--primary w-100" id="sbOk">Ajouter l’abonné</button>', function (b, close) {
        $('#sbN', b).focus();
        $('#sbOk', b).addEventListener('click', function () {
          var em = $('#sbE', b).value.trim().toLowerCase();
          var ok = setErr(b, 'sbN', $('#sbN', b).value.trim() ? '' : 'Indiquez le nom.');
          ok = setErr(b, 'sbE', !validEmail(em) ? 'Saisissez une adresse e-mail valide.' : S.subscribers.some(function (s) { return s.email === em; }) ? 'Cette adresse est déjà inscrite.' : '') && ok;
          if (!ok) return;
          S.subscribers.unshift({ id: 's' + uid(), name: $('#sbN', b).value.trim(), email: em, country: $('#sbC', b).value.trim() || '—', since: new Date().toISOString(), status: 'actif' });
          save(); close(); draw(); toast('Abonné ajouté');
        });
      });
    });
    $('#nlExport').addEventListener('click', function () {
      var csv = 'Nom;E-mail;Pays;Inscription;Statut\n' + S.subscribers.map(function (s) { return [s.name, s.email, s.country, (s.since||'').slice(0, 10), s.status].map(function (x) { return '"' + String(x).replace(/"/g, '""') + '"'; }).join(';'); }).join('\n');
      try {
        var url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
        var a = document.createElement('a'); a.href = url; a.download = 'abonnes-afriquinfos.csv'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        toast('Export lancé : abonnes-afriquinfos.csv');
      } catch (er) { toast('Le téléchargement est bloqué ici : il fonctionne une fois le site installé'); }
    });
    $('#nlCompose').addEventListener('click', compose);
    function compose() {
      var pubs = S.articles.filter(function (a) { return a.status === 'publie'; }).sort(function (a, b) { return b.date.localeCompare(a.date); }).slice(0, 8);
      var tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(7, 0, 0, 0);
      openBig('Préparer un envoi', '<div class="ad-grid" style="grid-template-columns:minmax(0,1fr) minmax(0,1.1fr)" id="cpGrid"><div>' +
        field('cpS', 'Objet', '<input class="ad-input" id="cpS" value="Le brief panafricain du ' + esc(new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' }).format(tomorrow)) + '">') +
        field('cpI', 'Introduction', '<textarea class="ad-textarea" id="cpI" rows="3">Bonjour, voici l’essentiel de l’actualité panafricaine de ce matin.</textarea>') +
        '<p class="ad-label mb-2">Articles à inclure</p><div class="d-grid gap-2 mb-3" id="cpArts">' + pubs.map(function (a, i) { return '<label class="ad-check"><input type="checkbox" value="' + a.id + '"' + (i < 4 ? ' checked' : '') + '>' + fr(a.title) + '</label>'; }).join('') + '</div>' +
        field('cpD', 'Date d’envoi', '<input class="ad-input" type="datetime-local" id="cpD" value="' + toLocalInput(tomorrow.toISOString()) + '">') +
        '<div class="d-flex gap-2 flex-wrap"><button type="button" class="ad-btn ad-btn--outline" id="cpTest">Envoyer un test</button><button type="button" class="ad-btn ad-btn--primary" id="cpGo">Programmer l’envoi</button></div><p class="ad-error mt-2" id="cpErr"></p></div>' +
        '<div><p class="ad-label mb-2">Aperçu</p><div id="cpPrev"></div></div></div>', function (b, close) {
          if (window.matchMedia('(max-width: 991.98px)').matches) $('#cpGrid', b).style.gridTemplateColumns = '1fr';
          function prev() {
            var ids = $$('#cpArts input:checked', b).map(function (i) { return i.value; });
            $('#cpPrev', b).innerHTML = '<div class="ad-mail"><div class="ad-mail__head"><img src="' + (window.AQ_ASSET || '') + '/assets/img/logo-compact-negatif.png" alt="Afriquinfos"></div><div class="ad-mail__body"><h3>' + fr($('#cpS', b).value) + '</h3><p>' + fr($('#cpI', b).value) + '</p>' +
              ids.map(function (id) { var a = art(id); return '<div class="ad-mail__item"><small>' + esc(rubLabel(a.rub)) + '</small><strong>' + fr(a.title) + '</strong><p>' + fr(a.chapo) + '</p></div>'; }).join('') +
              '</div><div class="ad-mail__foot">Vous recevez cet e-mail car vous êtes abonné au brief d’Afriquinfos. Se désinscrire.</div></div>';
            return ids;
          }
          prev(); b.addEventListener('input', prev); b.addEventListener('change', prev);
          $('#cpTest', b).addEventListener('click', function () { toast('E-mail de test envoyé à ' + ME.email); });
          $('#cpGo', b).addEventListener('click', function () {
            var ids = prev(), d = new Date($('#cpD', b).value);
            var err = !$('#cpS', b).value.trim() ? 'Ajoutez un objet.' : !ids.length ? 'Choisissez au moins un article.' : isNaN(d) || d < new Date() ? 'Choisissez une date d’envoi à venir.' : '';
            $('#cpErr', b).textContent = err; if (err) return;
            S.campaigns.unshift({ id: 'k' + uid(), subject: $('#cpS', b).value.trim(), date: d.toISOString(), status: 'programmee', recipients: S.subscribers.filter(function (s) { return s.status === 'actif'; }).length });
            log('a programmé la newsletter « ' + $('#cpS', b).value.trim() + ' »'); save(); close(); draw(); toast('Envoi programmé pour le ' + dlong(d.toISOString()));
          });
        });
    }
    draw();
  };

  /* ===================== Publicité ===================== */
  var AD_LABEL = { active: 'En diffusion', programme: 'Programmée', pause: 'En pause', terminee: 'Terminée' };
  var AD_PILL = { active: 'active', programme: 'programme', pause: 'brouillon', terminee: 'libre' };
  function adStatus(a) { var t = day(0); return a.paused ? 'pause' : a.start > t ? 'programme' : a.end < t ? 'terminee' : 'active'; }
  function slotById(id) { return S.slots.filter(function (s) { return s.id === id; })[0]; }
  function adStats(a) {
    var st = adStatus(a); if (st === 'programme') return null;
    var t = day(0), last = a.end < t ? a.end : t, days = Math.max(1, Math.round((new Date(last) - new Date(a.start)) / 864e5) + 1);
    var seedN = 0; for (var i = 0; i < a.id.length; i++) seedN += a.id.charCodeAt(i);
    var imp = days * (2600 + (seedN % 9) * 520), clk = Math.round(imp * (0.0025 + (seedN % 5) * 0.0007));
    return { imp: imp, clk: clk, ctr: (clk / imp * 100).toFixed(2).replace('.', ',') };
  }
  function readImage(file, maxW, done) {
    if (!file || !/^image\//.test(file.type)) { toast('Choisissez un fichier image (JPG, PNG, WebP ou GIF)'); return; }
    var r = new FileReader();
    r.onload = function () {
      var img = new Image();
      img.onload = function () {
        var k = Math.min(1, maxW / img.width), c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        var ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0, c.width, c.height);
        done({ data: c.toDataURL('image/jpeg', 0.86), w: img.width, h: img.height, name: file.name });
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  }
  function adVisual(a, slot) {
    var ratio = slot && slot.w && slot.h ? slot.w + ' / ' + slot.h : '16 / 10', tall = slot && slot.h > slot.w * 0.9;
    return '<div class="ad-adprev" style="aspect-ratio:' + ratio + ';' + (tall ? 'height:240px;width:auto' : 'width:100%') + '">' + (a.visual ? '<img src="' + esc(a.visual) + '" alt="' + esc(a.alt || '') + '">' : '<span>' + esc(slot ? slot.format : '') + '</span>') + '</div>';
  }

  function adForm(src, presetSlot, onDone) {
    var isNew = !src;
    var a = src ? clone(src) : { id: '', name: '', advertiser: '', slot: presetSlot || S.slots[0].id, start: day(0), end: addDays(day(0), 29), url: '', visual: '', alt: '', paused: false };
    openDrawer(isNew ? 'Nouvelle publicité' : 'Modifier la publicité',
      field('pbA', 'Annonceur', '<input class="ad-input" id="pbA" value="' + esc(a.advertiser) + '" placeholder="Nom de la marque ou de l’entreprise">') +
      field('pbN', 'Nom de la campagne', '<input class="ad-input" id="pbN" value="' + esc(a.name) + '" placeholder="Ex. Lancement offre entreprises">', 'Facultatif : sert à retrouver la campagne.') +
      field('pbS', 'Emplacement', '<select class="ad-select" id="pbS">' + options(S.slots.map(function (s) { return { value: s.id, label: s.name + ' (' + s.format + ')' }; }), a.slot) + '</select>') +
      '<div class="ad-form-grid">' + field('pbD', 'Début', '<input class="ad-input" type="date" id="pbD" value="' + esc(a.start) + '">') + field('pbE', 'Fin', '<input class="ad-input" type="date" id="pbE" value="' + esc(a.end) + '">') + '</div>' +
      field('pbU', 'Lien de destination', '<input class="ad-input" type="url" id="pbU" value="' + esc(a.url) + '" placeholder="https://">') +
      '<div class="ad-field"><span class="ad-label d-block mb-2" id="pbVL">Visuel</span><div id="pbPrev"></div>' +
        '<div class="d-flex gap-2 mt-2 flex-wrap"><label class="ad-btn ad-btn--outline ad-btn--sm mb-0" for="pbF"><i class="bi bi-upload" aria-hidden="true"></i>' + (a.visual ? 'Remplacer le visuel' : 'Importer le visuel') + '</label><input type="file" id="pbF" accept="image/*" hidden aria-labelledby="pbVL">' +
        '<button type="button" class="ad-btn ad-btn--ghost ad-btn--sm" id="pbFx"' + (a.visual ? '' : ' hidden') + '>Retirer</button></div>' +
        '<p class="ad-hint" id="pbHint"></p><p class="ad-error" id="pbFErr"></p></div>' +
      field('pbAlt', 'Texte alternatif', '<input class="ad-input" id="pbAlt" value="' + esc(a.alt) + '" placeholder="Ce que montre la publicité">') +
      '<button type="button" class="ad-btn ad-btn--primary w-100" id="pbOk">' + (isNew ? 'Enregistrer la publicité' : 'Enregistrer') + '</button>',
      function (b, close) {
        function prev() {
          var s = slotById($('#pbS', b).value);
          $('#pbPrev', b).innerHTML = adVisual(a, s);
          $('#pbHint', b).textContent = 'Format attendu : ' + s.format + ' px. JPG, PNG ou GIF.' + (a.vw ? ' Fichier importé : ' + a.vw + ' × ' + a.vh + ' px.' : '');
          $('#pbFx', b).hidden = !a.visual;
          var lab = $('label[for="pbF"]', b); lab.lastChild.textContent = a.visual ? 'Remplacer le visuel' : 'Importer le visuel';
        }
        prev();
        $('#pbS', b).addEventListener('change', prev);
        $('#pbF', b).addEventListener('change', function () {
          var f = this.files[0]; this.value = '';
          readImage(f, 1600, function (img) {
            a.visual = img.data; a.vw = img.w; a.vh = img.h;
            if (!$('#pbAlt', b).value) $('#pbAlt', b).value = img.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ');
            $('#pbFErr', b).textContent = ''; prev();
            var s = slotById($('#pbS', b).value);
            if (s.w && s.h && Math.abs(img.w / img.h - s.w / s.h) > 0.08) toast('Proportions différentes du format ' + s.format + ' : le visuel sera recadré');
          });
        });
        $('#pbFx', b).addEventListener('click', function () { a.visual = ''; a.vw = a.vh = 0; prev(); });
        $('#pbA', b).focus();
        $('#pbOk', b).addEventListener('click', function () {
          var sl = $('#pbS', b).value, s = $('#pbD', b).value, e = $('#pbE', b).value, u = $('#pbU', b).value.trim();
          var ok = setErr(b, 'pbA', $('#pbA', b).value.trim() ? '' : 'Indiquez l’annonceur.');
          ok = setErr(b, 'pbD', s ? '' : 'Choisissez la date de début.') && ok;
          ok = setErr(b, 'pbE', e && e >= s ? '' : 'La fin doit suivre le début.') && ok;
          ok = setErr(b, 'pbU', /^https?:\/\/\S+\.\S+/.test(u) ? '' : 'Saisissez une adresse complète, par exemple https://exemple.com.') && ok;
          $('#pbFErr', b).textContent = a.visual ? '' : 'Importez le visuel de la publicité.'; ok = !!a.visual && ok;
          if (!ok) { var bad = $('[aria-invalid="true"]', b); if (bad) bad.focus(); return; }
          var clash = S.ads.filter(function (x) { return x.id !== a.id && x.slot === sl && !x.paused && x.start <= e && x.end >= s; })[0];
          if (clash) { setErr(b, 'pbS', 'Cet emplacement est déjà réservé par ' + clash.advertiser + ' du ' + periodText(clash.start, clash.end) + '. Changez les dates ou l’emplacement.'); $('#pbS', b).focus(); return; }
          var obj = Object.assign(a, { id: a.id || 'p' + uid(), name: $('#pbN', b).value.trim(), advertiser: $('#pbA', b).value.trim(), slot: sl, start: s, end: e, url: u, alt: $('#pbAlt', b).value.trim() });
          if (isNew) S.ads.unshift(obj); else S.ads[S.ads.indexOf(S.ads.filter(function (x) { return x.id === obj.id; })[0])] = obj;
          log((isNew ? 'a ajouté la publicité ' : 'a modifié la publicité ') + obj.advertiser + ' (' + slotById(sl).name + ')'); save(); close();
          toast('Publicité enregistrée : ' + AD_LABEL[adStatus(obj)]); onDone(adStatus(obj));
        });
      });
  }

  function slotForm(onDone) {
    openDrawer('Nouvel emplacement',
      field('slN', 'Nom', '<input class="ad-input" id="slN" placeholder="Ex. Bannière bas d’article">') +
      field('slW', 'Où il apparaît', '<input class="ad-input" id="slW" placeholder="Ex. Sous le texte des articles">') +
      '<div class="ad-form-grid">' + field('slX', 'Largeur (px)', '<input class="ad-input" id="slX" inputmode="numeric" placeholder="728">') + field('slY', 'Hauteur (px)', '<input class="ad-input" id="slY" inputmode="numeric" placeholder="90">') + '</div>' +
      '<button type="button" class="ad-btn ad-btn--primary w-100" id="slOk">Ajouter l’emplacement</button>',
      function (b, close) {
        $('#slN', b).focus();
        $('#slOk', b).addEventListener('click', function () {
          var n = $('#slN', b).value.trim(), w = parseInt($('#slX', b).value, 10), h = parseInt($('#slY', b).value, 10);
          var ok = setErr(b, 'slN', !n ? 'Indiquez un nom.' : S.slots.some(function (s) { return norm(s.name) === norm(n); }) ? 'Cet emplacement existe déjà.' : '');
          ok = setErr(b, 'slX', w >= 50 && w <= 3000 ? '' : 'Entre 50 et 3 000 px.') && ok;
          ok = setErr(b, 'slY', h >= 50 && h <= 3000 ? '' : 'Entre 50 et 3 000 px.') && ok;
          if (!ok) return;
          S.slots.push({ id: slugify(n) + '-' + uid().slice(-3), name: n, where: $('#slW', b).value.trim(), w: w, h: h, format: w + ' × ' + h });
          log('a créé l’emplacement publicitaire ' + n); save(); close(); onDone(); toast('Emplacement ajouté');
        });
      });
  }

  VIEWS.publicite = function (v) {
    var tab = 'active';
    function draw() {
      var t = day(0), counts = { active: 0, programme: 0, pause: 0, terminee: 0, tous: S.ads.length };
      S.ads.forEach(function (a) { counts[adStatus(a)]++; });
      var running = S.ads.filter(function (a) { return adStatus(a) === 'active'; });
      var imp = S.ads.reduce(function (n, a) { var s = adStats(a); return n + (s && adStatus(a) === 'active' ? s.imp : 0); }, 0);
      var free = S.slots.filter(function (s) { return !running.some(function (a) { return a.slot === s.id; }); }).length;
      var list = S.ads.filter(function (a) { return tab === 'tous' || adStatus(a) === tab; }).sort(function (a, b) { return b.start.localeCompare(a.start); });
      v.innerHTML = pagehead('Publicité', 'Les emplacements du kit média et les campagnes des annonceurs.', '<button type="button" class="ad-btn ad-btn--outline" id="slNew"><i class="bi bi-plus-square" aria-hidden="true"></i>Nouvel emplacement</button><button type="button" class="ad-btn ad-btn--primary" id="pbNew"><i class="bi bi-plus-lg" aria-hidden="true"></i>Nouvelle publicité</button>') +
        '<div class="ad-grid ad-grid--kpi mb-4">' +
          '<div class="ad-panel ad-kpi"><p class="ad-kpi__label">En diffusion</p><p class="ad-kpi__value">' + counts.active + '</p><p class="ad-kpi__hint">' + plural(counts.programme, 'campagne programmée', 'campagnes programmées') + '</p></div>' +
          '<div class="ad-panel ad-kpi"><p class="ad-kpi__label">Emplacements libres</p><p class="ad-kpi__value">' + free + '</p><p class="ad-kpi__hint">sur ' + S.slots.length + ' aujourd’hui</p></div>' +
          '<div class="ad-panel ad-kpi ad-kpi--dark"><p class="ad-kpi__label">Impressions des campagnes en cours</p><p class="ad-kpi__value tnum">' + fmtNum.format(imp) + '</p><p class="ad-kpi__hint">Données de démonstration</p></div>' +
        '</div>' +
        '<section class="ad-panel mb-4" aria-labelledby="slT"><div class="ad-panel__head"><h2 id="slT">Emplacements</h2></div><div class="ad-tablewrap"><table class="ad-table"><thead><tr><th>Emplacement</th><th>Format</th><th>Aujourd’hui</th><th>Prochaine campagne</th><th class="actions"><span class="visually-hidden">Actions</span></th></tr></thead><tbody>' +
          S.slots.map(function (s) {
            var on = running.filter(function (a) { return a.slot === s.id; })[0];
            var next = S.ads.filter(function (a) { return a.slot === s.id && !a.paused && a.start > t; }).sort(function (a, b) { return a.start.localeCompare(b.start); })[0];
            var used = S.ads.some(function (a) { return a.slot === s.id; });
            return '<tr><td><div class="ad-title-cell" style="min-width:200px"><strong>' + esc(s.name) + '</strong><small>' + esc(s.where || '') + '</small></div></td><td class="tnum" style="white-space:nowrap">' + esc(s.format) + '</td>' +
              '<td>' + (on ? '<strong>' + esc(on.advertiser) + '</strong><small class="d-block ad-muted">jusqu’au ' + dshort(on.end + 'T12:00:00') + '</small>' : '<span class="ad-status ad-status--libre">Disponible</span>') + '</td>' +
              '<td class="ad-muted">' + (next ? esc(next.advertiser) + ', dès le ' + dshort(next.start + 'T12:00:00') : '—') + '</td>' +
              '<td class="actions"><button type="button" class="ad-btn ad-btn--' + (on ? 'outline' : 'dark') + ' ad-btn--sm" data-slbook="' + s.id + '">Réserver</button>' + (used ? '' : '<button type="button" class="ad-iconbtn ad-iconbtn--sm ad-iconbtn--danger" data-slx="' + s.id + '" aria-label="Supprimer l’emplacement ' + esc(s.name) + '"><i class="bi bi-trash3" aria-hidden="true"></i></button>') + '</td></tr>';
          }).join('') + '</tbody></table></div></section>' +
        '<div class="ad-tabs" role="tablist" aria-label="Campagnes">' + [['active', 'En diffusion'], ['programme', 'Programmées'], ['pause', 'En pause'], ['terminee', 'Terminées'], ['tous', 'Toutes']].map(function (x) { return '<button type="button" role="tab" data-pbt="' + x[0] + '" aria-selected="' + (tab === x[0]) + '">' + x[1] + '<small>' + counts[x[0]] + '</small></button>'; }).join('') + '</div>' +
        '<section class="ad-panel"><div class="ad-tablewrap"><table class="ad-table"><thead><tr><th>Publicité</th><th>Emplacement</th><th>Période</th><th class="num">Impressions</th><th class="num">Clics</th><th>Statut</th><th class="actions"><span class="visually-hidden">Actions</span></th></tr></thead><tbody>' +
          (list.length ? list.map(function (a) {
            var s = slotById(a.slot) || { name: 'Emplacement supprimé', format: '' }, st = adStatus(a), k = adStats(a);
            return '<tr><td><div class="d-flex gap-3 align-items-center"><div class="ad-adthumb">' + (a.visual ? '<img src="' + esc(a.visual) + '" alt="">' : '<span>' + esc(s.format) + '</span>') + '</div><div class="ad-title-cell" style="min-width:180px"><a href="#" data-pbe="' + a.id + '">' + esc(a.advertiser) + '</a><small>' + esc(a.name || a.url.replace(/^https?:\/\//, '')) + '</small></div></div></td>' +
              '<td style="white-space:nowrap">' + esc(s.name) + '<small class="d-block ad-muted tnum">' + esc(s.format) + '</small></td><td class="ad-muted" style="white-space:nowrap">' + period(a.start, a.end) + '</td>' +
              '<td class="num">' + (k ? fmtNum.format(k.imp) : '—') + '</td><td class="num">' + (k ? fmtNum.format(k.clk) + '<small class="d-block ad-muted">' + k.ctr + ' %</small>' : '—') + '</td>' +
              '<td><span class="ad-status ad-status--' + AD_PILL[st] + '">' + AD_LABEL[st] + '</span></td>' +
              '<td class="actions">' + (st !== 'terminee' ? '<button type="button" class="ad-iconbtn ad-iconbtn--sm" data-pbp="' + a.id + '" aria-label="' + (a.paused ? 'Reprendre la diffusion' : 'Mettre en pause') + '" title="' + (a.paused ? 'Reprendre' : 'Mettre en pause') + '"><i class="bi bi-' + (a.paused ? 'play' : 'pause') + '-fill" aria-hidden="true"></i></button>' : '') +
                '<button type="button" class="ad-iconbtn ad-iconbtn--sm" data-pbe="' + a.id + '" aria-label="Modifier"><i class="bi bi-pencil" aria-hidden="true"></i></button>' +
                '<button type="button" class="ad-iconbtn ad-iconbtn--sm ad-iconbtn--danger" data-pbx="' + a.id + '" aria-label="Supprimer"><i class="bi bi-trash3" aria-hidden="true"></i></button></td></tr>';
          }).join('') : '<tr><td colspan="7"><div class="ad-empty"><strong>Aucune campagne</strong>Ajoutez-en une avec « Nouvelle publicité ».</div></td></tr>') +
        '</tbody></table></div></section><p class="ad-note">Impressions et clics : données de démonstration, à relier à votre régie publicitaire.</p>';
    }
    function byId(id) { return S.ads.filter(function (a) { return a.id === id; })[0]; }
    function after(st) { if (st) tab = st; draw(); }
    v.addEventListener('click', function (e) {
      var b = e.target.closest('button, a'); if (!b) return;
      if (b.id === 'pbNew') { adForm(null, null, after); return; }
      if (b.id === 'slNew') { slotForm(draw); return; }
      var id;
      if ((id = b.getAttribute('data-pbt'))) { tab = id; draw(); }
      else if ((id = b.getAttribute('data-slbook'))) { adForm(null, id, after); }
      else if ((id = b.getAttribute('data-slx'))) { var sl = slotById(id); confirmBox('Supprimer cet emplacement ?', '« ' + sl.name + ' » sera retiré du kit média.', 'Supprimer', function () { S.slots = S.slots.filter(function (x) { return x !== sl; }); save(); draw(); toast('Emplacement supprimé'); }); }
      else if ((id = b.getAttribute('data-pbe'))) { e.preventDefault(); adForm(byId(id), null, after); }
      else if ((id = b.getAttribute('data-pbp'))) {
        var a = byId(id);
        if (a.paused) { var clash = S.ads.filter(function (x) { return x !== a && x.slot === a.slot && !x.paused && x.start <= a.end && x.end >= a.start; })[0]; if (clash) { toast('Impossible : ' + clash.advertiser + ' occupe déjà cet emplacement sur la période'); return; } }
        a.paused = !a.paused; log((a.paused ? 'a mis en pause la publicité ' : 'a relancé la publicité ') + a.advertiser); save(); draw(); toast(a.paused ? 'Diffusion en pause' : 'Diffusion reprise');
      }
      else if ((id = b.getAttribute('data-pbx'))) { var x = byId(id); confirmBox('Supprimer cette publicité ?', 'La campagne de ' + x.advertiser + ' sera supprimée.', 'Supprimer', function () { S.ads = S.ads.filter(function (y) { return y !== x; }); log('a supprimé la publicité ' + x.advertiser); save(); draw(); toast('Publicité supprimée'); }); }
    });
    draw();
  };

  /* ===================== Messages (formulaire de contact) ===================== */
  var MSG_SUBJECTS = { redaction: 'Écrire à la rédaction', publicite: 'Publicité et kit média', agenda: 'Proposer un événement', reponse: 'Droit de réponse', autre: 'Autre demande' };
  function msgSubject(m) { return MSG_SUBJECTS[m.subject] || m.subject; }
  VIEWS.messages = function (v) {
    function draw() {
      var list = S.messages || [];
      $('#msgTbody').innerHTML = list.length ? list.map(function (m, i) {
        return '<tr' + (m.read ? '' : ' style="font-weight:600"') + '><td><div class="ad-title-cell"><strong>' + esc(m.name) + '</strong><small>' + esc(m.email) + '</small></div></td>' +
          '<td>' + esc(msgSubject(m)) + '</td><td class="ad-muted" style="white-space:nowrap">' + rel(m.date) + '</td>' +
          '<td><span class="ad-status ad-status--' + (m.read ? 'libre' : 'active') + '">' + (m.read ? 'Lu' : 'Non lu') + '</span></td>' +
          '<td class="actions"><button type="button" class="ad-iconbtn ad-iconbtn--sm" data-mr="' + i + '" aria-label="Lire le message de ' + esc(m.name) + '" title="Lire"><i class="bi bi-envelope-open" aria-hidden="true"></i></button>' +
          '<a class="ad-iconbtn ad-iconbtn--sm" href="mailto:' + encodeURIComponent(m.email) + '?subject=' + encodeURIComponent('Re : ' + msgSubject(m)) + '" aria-label="Répondre à ' + esc(m.name) + '" title="Répondre"><i class="bi bi-reply" aria-hidden="true"></i></a>' +
          '<button type="button" class="ad-iconbtn ad-iconbtn--sm ad-iconbtn--danger" data-mx="' + i + '" aria-label="Supprimer le message de ' + esc(m.name) + '" title="Supprimer"><i class="bi bi-trash3" aria-hidden="true"></i></button></td></tr>';
      }).join('') : '<tr><td colspan="5"><div class="ad-empty"><strong>Aucun message</strong>Les demandes envoyées depuis le formulaire de contact du site apparaîtront ici.</div></td></tr>';
      var u = unreadMsg();
      $('#msgUnread').innerHTML = u ? '<span class="ad-status ad-status--attente">' + u + ' non lu' + (u > 1 ? 's' : '') + '</span>' : '';
    }
    v.innerHTML = pagehead('Messages', 'Les demandes envoyées via le formulaire de contact du site.', '<span id="msgUnread"></span>') +
      '<section class="ad-panel"><div class="ad-tablewrap"><table class="ad-table"><thead><tr><th>Expéditeur</th><th>Objet</th><th>Reçu</th><th>Statut</th><th class="actions"><span class="visually-hidden">Actions</span></th></tr></thead><tbody id="msgTbody"></tbody></table></div></section>';
    draw();
    v.addEventListener('click', function (e) {
      var b = e.target.closest('[data-mr],[data-mx]'); if (!b) return;
      var i;
      if ((i = b.getAttribute('data-mr')) !== null) {
        var m = S.messages[+i];
        openBig('Message de ' + m.name, '<p class="ad-muted"><strong>' + esc(msgSubject(m)) + '</strong> — ' + esc(m.email) + ', ' + rel(m.date) + '</p><p style="white-space:pre-wrap">' + esc(m.message) + '</p><p><a class="ad-btn ad-btn--primary" href="mailto:' + encodeURIComponent(m.email) + '?subject=' + encodeURIComponent('Re : ' + msgSubject(m)) + '"><i class="bi bi-reply" aria-hidden="true"></i>Répondre par e-mail</a></p>');
        if (!m.read) { m.read = true; save(); draw(); }
      } else if ((i = b.getAttribute('data-mx')) !== null) {
        var m2 = S.messages[+i];
        confirmBox('Supprimer ce message ?', 'Le message de ' + m2.name + ' sera définitivement supprimé.', 'Supprimer', function () { S.messages.splice(+i, 1); save(); draw(); });
      }
    });
  };

  /* ===================== Équipe ===================== */
  var PERMS = [['Rédiger des articles', 1, 1, 1, 1], ['Publier et programmer', 1, 1, 0, 0], ['Modérer les commentaires', 1, 1, 1, 0], ['Gérer la newsletter et la publicité', 1, 1, 0, 0], ['Gérer l’équipe et les paramètres', 1, 0, 0, 0]];
  VIEWS.equipe = function (v) {
    v.innerHTML = pagehead('Équipe', 'Les personnes qui ont accès à l’administration.', '<a class="ad-btn ad-btn--outline" href="#statistiques"><i class="bi bi-bar-chart-line" aria-hidden="true"></i>Statistiques</a><button type="button" class="ad-btn ad-btn--primary" id="tmInvite"><i class="bi bi-person-plus" aria-hidden="true"></i>Inviter</button>') +
      '<section class="ad-panel mb-4"><div class="ad-tablewrap"><table class="ad-table" id="tmTable"></table></div></section>' +
      '<section class="ad-panel"><div class="ad-panel__head"><h2>Droits par rôle</h2></div><div class="ad-tablewrap"><table class="ad-table ad-perm"><thead><tr><th>Action</th>' + Object.keys(ROLES).map(function (r) { return '<th>' + ROLES[r] + '</th>'; }).join('') + '</tr></thead><tbody>' +
        PERMS.map(function (p) { return '<tr><td>' + p[0] + '</td>' + p.slice(1).map(function (x) { return x ? '<td class="yes"><i class="bi bi-check-lg" aria-hidden="true"></i><span class="visually-hidden">Oui</span></td>' : '<td class="no">—<span class="visually-hidden">Non</span></td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div></section>';
    function draw() {
      var isAdmin = ME.role === 'admin';
      $('#tmTable').innerHTML = '<thead><tr><th>Membre</th><th>Rôle</th><th>Articles</th><th>Dernière activité</th><th>Statut</th><th class="actions"><span class="visually-hidden">Actions</span></th></tr></thead><tbody>' +
        S.users.map(function (u) {
          var n = S.articles.filter(function (a) { return a.author === u.name && a.status !== 'corbeille'; }).length, me = u.id === ME.id;
          return '<tr><td><div class="d-flex align-items-center gap-3"><span class="ad-avatar ad-avatar--sm" aria-hidden="true">' + initials(u.name) + '</span><div class="ad-title-cell" style="min-width:180px"><strong>' + esc(u.name) + (me ? ' <span class="ad-muted fw-normal">(vous)</span>' : '') + '</strong><small>' + esc(u.email) + '</small></div></div></td>' +
            '<td><label class="visually-hidden" for="role' + u.id + '">Rôle de ' + esc(u.name) + '</label><select class="ad-select" style="min-width:170px" id="role' + u.id + '" data-role="' + u.id + '"' + (me || !isAdmin ? ' disabled' : '') + '>' + options(Object.keys(ROLES).map(function (k) { return { value: k, label: ROLES[k] }; }), u.role) + '</select></td>' +
            '<td class="tnum">' + n + '</td><td class="ad-muted">' + (u.status === 'invite' ? '—' : rel(u.last)) + '</td><td><span class="ad-status ad-status--' + (u.status === 'invite' ? 'invite' : 'active') + '">' + (u.status === 'invite' ? 'Invitation envoyée' : 'Actif') + '</span></td>' +
            '<td class="actions">' + (me || !isAdmin ? '' : '<button type="button" class="ad-iconbtn ad-iconbtn--sm ad-iconbtn--danger" data-rmu="' + u.id + '" aria-label="Retirer l’accès de ' + esc(u.name) + '"><i class="bi bi-person-dash" aria-hidden="true"></i></button>') + '</td></tr>';
        }).join('') + '</tbody>';
    }
    v.addEventListener('change', function (e) { if (e.target.hasAttribute('data-role')) { var u = S.users.filter(function (x) { return x.id === e.target.getAttribute('data-role'); })[0]; u.role = e.target.value; log('a donné le rôle ' + ROLES[u.role] + ' à ' + u.name); save(); toast(u.name + ' : ' + ROLES[u.role]); } });
    v.addEventListener('click', function (e) {
      var b = e.target.closest('[data-rmu]'); if (!b) return;
      var u = S.users.filter(function (x) { return x.id === b.getAttribute('data-rmu'); })[0];
      confirmBox('Retirer l’accès de ' + u.name + ' ?', 'Ses articles restent publiés ; la personne ne pourra plus se connecter.', 'Retirer l’accès', function () { S.users = S.users.filter(function (x) { return x !== u; }); log('a retiré l’accès de ' + u.name); save(); draw(); toast('Accès retiré'); });
    });
    $('#tmInvite').addEventListener('click', function () {
      if (ME.role !== 'admin') { toast('Seul un administrateur peut inviter un membre'); return; }
      openDrawer('Inviter un membre', field('ivN', 'Nom', '<input class="ad-input" id="ivN">') + field('ivE', 'Adresse e-mail', '<input class="ad-input" type="email" id="ivE">') + field('ivR', 'Rôle', '<select class="ad-select" id="ivR">' + options(Object.keys(ROLES).map(function (k) { return { value: k, label: ROLES[k] }; }), 'journaliste') + '</select>') + '<button type="button" class="ad-btn ad-btn--primary w-100" id="ivOk">Envoyer l’invitation</button>', function (b, close) {
        $('#ivN', b).focus();
        $('#ivOk', b).addEventListener('click', function () {
          var em = $('#ivE', b).value.trim().toLowerCase();
          var ok = setErr(b, 'ivN', $('#ivN', b).value.trim() ? '' : 'Indiquez le nom.');
          ok = setErr(b, 'ivE', !validEmail(em) ? 'Saisissez une adresse e-mail valide.' : S.users.some(function (u) { return u.email === em; }) ? 'Cette personne fait déjà partie de l’équipe.' : '') && ok;
          if (!ok) return;
          S.users.push({ id: 'u' + uid(), name: $('#ivN', b).value.trim(), email: em, role: $('#ivR', b).value, status: 'invite', last: new Date().toISOString() });
          log('a invité ' + $('#ivN', b).value.trim()); save(); close(); draw(); toast('Invitation envoyée à ' + em);
        });
      });
    });
    draw();
  };

  /* ===================== Paramètres ===================== */
  VIEWS.parametres = function (v) {
    var s = S.settings;
    v.innerHTML = pagehead('Paramètres', 'Réglages généraux du site.', '<button type="button" class="ad-btn ad-btn--primary" id="stSave">Enregistrer</button>') +
      '<div class="ad-settings"><nav class="ad-settings__nav" aria-label="Sections"><a href="#st-general" data-scroll>Général</a><a href="#st-contact" data-scroll>Contact</a><a href="#st-social" data-scroll>Réseaux sociaux</a><a href="#st-pub" data-scroll>Publication</a><a href="#st-data" data-scroll>Données</a></nav><div class="d-grid gap-4">' +
        '<section class="ad-panel" id="st-general"><div class="ad-panel__head"><h2>Général</h2></div><div class="ad-panel__body"><div class="ad-form-grid">' + field('stName', 'Nom du média', '<input class="ad-input" id="stName" value="' + esc(s.name) + '">') + field('stTz', 'Fuseau horaire', '<select class="ad-select" id="stTz">' + options([{ value: 'Africa/Abidjan', label: 'Abidjan, Dakar (GMT)' }, { value: 'Africa/Lagos', label: 'Lagos, Douala (GMT+1)' }, { value: 'Africa/Johannesburg', label: 'Johannesburg (GMT+2)' }, { value: 'Africa/Nairobi', label: 'Nairobi (GMT+3)' }], s.timezone) + '</select>') + '</div>' + field('stSlogan', 'Signature', '<input class="ad-input" id="stSlogan" value="' + esc(s.slogan) + '">') + '</div></section>' +
        '<section class="ad-panel" id="st-contact"><div class="ad-panel__head"><h2>Contact</h2></div><div class="ad-panel__body"><div class="ad-form-grid">' + field('stMailR', 'E-mail de la rédaction', '<input class="ad-input" type="email" id="stMailR" value="' + esc(s.emailRedaction) + '">') + field('stMailP', 'E-mail de la régie', '<input class="ad-input" type="email" id="stMailP" value="' + esc(s.emailPub) + '">') + '</div></div></section>' +
        '<section class="ad-panel" id="st-social"><div class="ad-panel__head"><h2>Réseaux sociaux</h2></div><div class="ad-panel__body"><div class="ad-form-grid">' + [['stFb', 'Facebook', 'facebook'], ['stX', 'X', 'x'], ['stLi', 'LinkedIn', 'linkedin'], ['stYt', 'YouTube', 'youtube']].map(function (f) { return field(f[0], f[1], '<input class="ad-input" type="url" id="' + f[0] + '" value="' + esc(s[f[2]]) + '" placeholder="https://">'); }).join('') + '</div></div></section>' +
        '<section class="ad-panel" id="st-pub"><div class="ad-panel__head"><h2>Publication</h2></div><div class="ad-panel__body">' + field('stPer', 'Articles par page de rubrique', '<input class="ad-input" type="number" min="6" max="48" id="stPer" value="' + esc(s.perPage) + '" style="max-width:140px">') +
          '<div class="ad-field"><label class="ad-switch"><input type="checkbox" id="stMod"' + (s.moderation ? ' checked' : '') + '>Modérer les commentaires avant publication</label></div>' +
          '<div class="ad-field"><label class="ad-switch"><input type="checkbox" id="stMaint"' + (s.maintenance ? ' checked' : '') + '>Mode maintenance (le site affiche une page d’attente)</label></div></div></section>' +
        '<section class="ad-panel" id="st-data"><div class="ad-panel__head"><h2>Données de démonstration</h2></div><div class="ad-panel__body"><p class="ad-muted mt-0">Cette maquette garde vos modifications dans ce navigateur. Réinitialisez pour revenir aux contenus de départ.</p><button type="button" class="ad-btn ad-btn--outline" id="stReset"><i class="bi bi-arrow-counterclockwise" aria-hidden="true"></i>Réinitialiser les données</button></div></section>' +
      '</div></div>';
    $$('[data-scroll]', v).forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); $(a.getAttribute('href')).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }); }); });
    $('#stSave').addEventListener('click', function () {
      var ok = setErr(v, 'stName', $('#stName').value.trim() ? '' : 'Indiquez le nom du média.');
      ['stMailR', 'stMailP'].forEach(function (id) { ok = setErr(v, id, !$('#' + id).value.trim() || validEmail($('#' + id).value) ? '' : 'Adresse e-mail invalide.') && ok; });
      ['stFb', 'stX', 'stLi', 'stYt'].forEach(function (id) { var u = $('#' + id).value.trim(); ok = setErr(v, id, !u || /^https?:\/\/\S+\.\S+/.test(u) ? '' : 'Adresse incomplète : commencez par https://') && ok; });
      var per = +$('#stPer').value; ok = setErr(v, 'stPer', per >= 6 && per <= 48 ? '' : 'Choisissez entre 6 et 48.') && ok;
      if (!ok) { var bad = $('[aria-invalid="true"]', v); if (bad) bad.focus(); return; }
      Object.assign(s, { name: $('#stName').value.trim(), timezone: $('#stTz').value, slogan: $('#stSlogan').value.trim(), emailRedaction: $('#stMailR').value.trim(), emailPub: $('#stMailP').value.trim(), facebook: $('#stFb').value.trim(), x: $('#stX').value.trim(), linkedin: $('#stLi').value.trim(), youtube: $('#stYt').value.trim(), perPage: per, moderation: $('#stMod').checked, maintenance: $('#stMaint').checked });
      log('a modifié les paramètres'); save(); toast('Paramètres enregistrés');
    });
    $('#stReset').addEventListener('click', function () {
      confirmBox('Réinitialiser les données ?', 'Tous les articles, réglages et modifications faits dans cette maquette seront remplacés par les contenus de départ.', 'Réinitialiser', function () {
        var me = ME.id; S = seed(); save(); ME = S.users.filter(function (u) { return u.id === me; })[0] || S.users[0]; try { sessionStorage.setItem('aq-admin-user', ME.id); } catch (e) {} listState.sel = {}; render(); toast('Données de démonstration rétablies');
      });
    });
  };

  /* ===================== Démarrage ===================== */
  function closeSide() { $('#side').classList.remove('is-open'); $('#backdrop').hidden = true; }
  function bindShell() {
    $('#sideOpen').addEventListener('click', function () { $('#side').classList.add('is-open'); $('#backdrop').hidden = false; $('#nav a').focus(); });
    $('#sideClose').addEventListener('click', closeSide);
    $('#backdrop').addEventListener('click', closeSide);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSide(); });
    var tb = $('#themeBtn');
    function applyTheme(t) { document.documentElement.setAttribute('data-theme', t); tb.setAttribute('aria-pressed', String(t === 'dark')); tb.setAttribute('aria-label', t === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'); tb.innerHTML = '<i class="bi bi-' + (t === 'dark' ? 'sun' : 'moon-stars') + '" aria-hidden="true"></i>'; }
    applyTheme(document.documentElement.getAttribute('data-theme') || 'light');
    tb.addEventListener('click', function () { var t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; applyTheme(t); store('aq-admin-theme', t); });
    $('#topSearch').addEventListener('submit', function (e) { e.preventDefault(); listState.q = $('#topQ').value.trim(); listState.tab = 'all'; listState.page = 1; $('#topQ').value = ''; go('articles'); });
  }
  var shellBound = false;
  function start() {
    ME = currentUser();
    if (!ME) { $('#login').hidden = false; $('#app').hidden = true; return; }
    $('#login').hidden = true; $('#app').hidden = false;
    if (!shellBound) { bindShell(); shellBound = true; }
    render();
    $('#view').focus({ preventScroll: true });
  }
  bindLogin();
  start();
})();
