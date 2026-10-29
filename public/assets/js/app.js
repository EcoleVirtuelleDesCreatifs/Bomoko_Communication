/* =========================================================
   Afriquinfos — moteur de la maquette
   Une seule source de données (data.js), rendue sur chaque page.
   Pages : home, rubrique, article, portraits, agendas, recherche, contact
   ========================================================= */
(function () {
  'use strict';

  var D = window.AQ_DATA;
  var R = D.rubriques, G = D.regions;
  var MENU = ['politique', 'economie', 'sports', 'societe', 'culture', 'opinion'];
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var params = new URLSearchParams(location.search);
  var PAGE = (document.querySelector('[data-page]') || document.body).getAttribute('data-page');

  /* ===================== Outils ===================== */
  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  // typographie française : espaces insécables
  function fr(s) { return esc(s).replace(/ ([:;?!%»])/g, ' $1').replace(/« /g, '« ').replace(/(\d+)e (édition|Cameroon)/g, '$1<sup>e</sup> $2'); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function initials(name) { return String(name).split(/[\s,]+/).filter(Boolean).slice(0, 2).map(function (p) { return p.charAt(0).toUpperCase(); }).join(''); }

  var sorted = D.articles.slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
  function byRub(r) { return sorted.filter(function (a) { return a.rub === r; }); }
  function byRegion(g) { return sorted.filter(function (a) { return a.region === g; }); }
  function find(id) { return D.articles.filter(function (a) { return a.id === id; })[0]; }

  function urlArticle(a) { return 'article.html?id=' + encodeURIComponent(a.id); }
  function urlRub(r) { return r === 'portraits' ? 'portraits.html' : 'rubrique.html?r=' + r; }
  function urlRegion(g) { return 'rubrique.html?region=' + g; }

  var fmtLong = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  var fmtShort = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  // Dates : relatif sous 24 h (« il y a 3 h »), puis « Hier, 08:10 », puis date courte (« 26 oct. »)
  var fmtTime = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Abidjan' });
  var fmtDayMonth = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', timeZone: 'Africa/Abidjan' });
  function dayKey(d) { return d.toISOString().slice(0, 10); }
  function rel(iso) {
    var d = new Date(iso), min = (Date.now() - d.getTime()) / 60000;
    if (min < 1) return 'à l’instant';
    if (min < 60) return 'il y a ' + Math.round(min) + ' min';
    if (min < 1440) return 'il y a ' + Math.floor(min / 60) + ' h';
    var y = new Date(); y.setUTCDate(y.getUTCDate() - 1);
    if (dayKey(d) === dayKey(y)) return 'Hier, ' + fmtTime.format(d);
    if (min < 525600) return fmtDayMonth.format(d);
    return fmtShort.format(d);
  }

  /* ===================== Gabarits ===================== */
  // Visuel : vraie photo si a.src est fourni (CMS), sinon aplat de démonstration.
  // opt.alt : true quand l'image porte du sens (figure d'article) ; dans une carte, le titre suffit → décoratif.
  // opt.priority : true pour l'image principale visible au chargement (LCP).
  function ph(a, opt) {
    opt = opt || {};
    if (a.src) {
      var base = a.src.replace(/\.(jpe?g|png|webp|avif)$/i, '');
      return '<img src="' + esc(a.src) + '" srcset="' + esc(base) + '-480.webp 480w, ' + esc(base) + '-800.webp 800w, ' + esc(base) + '-1200.webp 1200w" sizes="' + (opt.sizes || '(min-width: 992px) 50vw, 100vw') + '"' +
        ' alt="' + (opt.alt ? esc(a.img) : '') + '" width="1200" height="750" decoding="async"' + (opt.priority ? ' fetchpriority="high"' : ' loading="lazy"') + '>';
    }
    var inner = a.person ? '<span class="aq-ph__initials" aria-hidden="true">' + esc(a.person.initials) + '</span>' : '';
    return '<div class="aq-ph aq-ph--' + a.ph + '"' + (opt.alt ? ' role="img" aria-label="Photo : ' + esc(a.img) + '"' : ' aria-hidden="true"') + '>' + inner + '</div>';
  }
  function media(a, cls, opt) { return '<div class="aq-media aq-media--cut ' + (cls || '') + '">' + ph(a, opt) + '</div>'; }
  function kicker(a, mode) {
    if (mode === 'rub') return R[a.rub].label + (a.country && a.rub !== 'opinion' ? ', ' + a.country : '');
    return a.country || R[a.rub].label;
  }
  function card(a, opt) {
    opt = opt || {};
    return '<article class="aq-card ' + (opt.h ? 'aq-card--h ' : '') + (opt.col || '') + '"><a href="' + urlArticle(a) + '">' + media(a) +
      '<div><span class="aq-card__place">' + fr(kicker(a, opt.kicker)) + '</span><h3 class="aq-card__title">' + fr(a.title) + '</h3>' +
      '<time class="aq-card__meta" datetime="' + a.date + '">' + rel(a.date) + '</time></div></a></article>';
  }
  // level : 1 pour le titre d'une page intérieure (un seul h1 par page, indispensable au référencement)
  function chapterHead(title, tagline, href, more, level) {
    var h = 'h' + (level || 2);
    return '<header class="aq-chapter__head"><' + h + ' class="aq-chapter__title">' + esc(title) + '</' + h + '>' +
      '<p class="aq-chapter__tagline">' + esc(tagline) + '</p>' + (href ? '<a class="aq-more" href="' + href + '">' + esc(more || 'Toute la rubrique') + '</a>' : '') + '</header>';
  }
  function logoPicture(cls, variant) {
    // variant : '' (fond clair) ou '-negatif' (fond sombre). Sur mobile, logo compact plus lisible et moins haut.
    return '<picture class="' + cls + '"><source media="(max-width: 575.98px)" srcset="assets/img/logo-compact' + variant + '.png" width="600" height="158">' +
      '<img src="assets/img/logo-afriquinfos' + variant + '.png" alt="Afriquinfos — Ni totems, ni tabous" width="600" height="214"' +
      // le logo du thème inactif est masqué : en « lazy », le navigateur ne le télécharge pas
      ((variant === '-negatif') !== (document.documentElement.getAttribute('data-theme') === 'dark') ? ' loading="lazy"' : '') + '></picture>';
  }
  function portraitCard(a, col) {
    return '<article class="aq-portrait ' + (col || '') + '"><a href="' + urlArticle(a) + '"><div class="aq-portrait__visual">' + ph(a) + '</div>' +
      '<h3 class="aq-portrait__name">' + esc(a.person.name) + '</h3><p class="aq-portrait__role">' + fr(a.person.role + ', ' + a.person.city + ' (' + a.country + ')') + '</p>' +
      '<p class="aq-portrait__chapo">' + fr(a.chapo) + '</p></a></article>';
  }
  function top5(list) {
    return '<ol class="aq-top5">' + list.slice().sort(function (a, b) { return b.views - a.views; }).slice(0, 5)
      .map(function (a) { return '<li><a href="' + urlArticle(a) + '"><span>' + fr(a.title) + '</span></a></li>'; }).join('') + '</ol>';
  }
  function newsletterBlock() {
    return '<section class="aq-newsletter aq-below" id="newsletter" aria-labelledby="h-nl"><div class="container-xl"><div class="aq-newsletter__box"><div>' +
      '<h2 id="h-nl">Le brief panafricain, chaque matin</h2><p>L’essentiel de l’actualité du continent, sans totems ni tabous. Gratuit, désinscription en un clic.</p></div>' +
      '<form class="aq-form" data-newsletter novalidate><label for="nlEmail" class="visually-hidden">Adresse e-mail</label><div class="aq-form__row">' +
      '<input type="email" class="form-control" id="nlEmail" placeholder="votre@email.com" autocomplete="email" required aria-describedby="nlMsg">' +
      '<button class="aq-btn aq-btn--ink" type="submit">S’inscrire</button></div><p class="aq-form__msg" id="nlMsg" role="status"></p></form></div></div></section>';
  }
  function crumbs(items) {
    return '<nav aria-label="Fil d’Ariane"><ol class="aq-crumbs"><li><a href="index.html">Accueil</a></li>' +
      items.map(function (it, i) { return '<li>' + (it.href && i < items.length - 1 ? '<a href="' + it.href + '">' + esc(it.label) + '</a>' : '<span aria-current="page">' + esc(it.label) + '</span>') + '</li>'; }).join('') + '</ol></nav>';
  }

  /* ===================== En-tête, menu, pied de page ===================== */
  var currentRub = PAGE === 'rubrique' ? (params.get('r') || (params.get('region') ? 'afriques' : '')) : PAGE === 'article' ? ((find(params.get('id')) || {}).rub || '') : '';
  if (PAGE === 'article' && find(params.get('id')) && find(params.get('id')).rub === 'portraits') currentRub = 'portraits';
  function cur(key) { return currentRub === key ? ' aria-current="page"' : ''; }

  function renderHeader() {
    var host = $('#aq-header'); if (!host) return;
    var today = cap(new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Abidjan' }).format(new Date()));
    var regionItems = Object.keys(G).map(function (g) { return '<li><a class="dropdown-item" href="' + urlRegion(g) + '"' + (params.get('region') === g ? ' aria-current="page"' : '') + '>' + esc(G[g]) + '</a></li>'; }).join('');
    // LinkedIn : lien retiré tant que l'adresse de la page n'est pas connue (href="#" = lien mort)
    var social = '<a href="https://www.facebook.com/afriquinfoscom/" aria-label="Afriquinfos sur Facebook" rel="noopener"><i class="bi bi-facebook" aria-hidden="true"></i></a>' +
      '<a href="https://x.com/AfriquinfosActu" aria-label="Afriquinfos sur X" rel="noopener"><i class="bi bi-twitter-x" aria-hidden="true"></i></a>';
    var q = PAGE === 'recherche' ? esc(params.get('q') || '') : '';

    host.innerHTML =
      '<div class="aq-top"><div class="container-xl"><span class="aq-top__date">' + esc(today) + '</span><nav aria-label="Liens utiles">' +
        '<a class="d-none d-sm-inline" href="portraits.html"' + (PAGE === 'portraits' ? ' aria-current="page"' : '') + '>Portraits</a>' +
        '<a class="d-none d-sm-inline" href="agendas.html"' + (PAGE === 'agendas' ? ' aria-current="page"' : '') + '>Agendas</a>' +
        '<a class="d-none d-md-inline" href="contact.html"' + (PAGE === 'contact' ? ' aria-current="page"' : '') + '>Contact</a>' +
        '<a class="d-none d-md-inline" href="rss.xml"><i class="bi bi-rss" aria-hidden="true"></i> RSS</a>' +
        '<span class="aq-social aq-social--top d-none d-lg-flex">' + social + '</span>' +
        '<button class="aq-theme" id="themeToggle" type="button" aria-pressed="false"><i class="bi bi-moon-stars" aria-hidden="true"></i><span>Sombre</span></button>' +
      '</nav></div></div>' +
      '<header class="aq-head"><div class="container-xl aq-head__row">' +
        '<button class="aq-icon d-lg-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#menu" aria-controls="menu" aria-label="Ouvrir le menu"><i class="bi bi-list" aria-hidden="true"></i></button>' +
        '<a class="aq-head__brand" href="index.html" aria-label="Afriquinfos, accueil">' + logoPicture('aq-logo--light', '') + logoPicture('aq-logo--dark', '-negatif') + '</a>' +
        '<form class="aq-searchbar d-none d-lg-block" action="recherche.html" role="search"><i class="bi bi-search" aria-hidden="true"></i>' +
          '<label class="visually-hidden" for="hq">Rechercher</label><input id="hq" name="q" type="search" value="' + q + '" placeholder="Rechercher une actualité, un pays, un sujet…"></form>' +
        // l'appel à l'inscription remplace les icônes sociales : l'emplacement le plus vu sert l'objectif d'audience
        '<a class="aq-btn aq-btn--primary aq-head__cta d-none d-lg-inline-flex" href="' + (['home', 'rubrique', 'article', 'portraits'].indexOf(PAGE) > -1 ? '' : 'index.html') + '#newsletter"><i class="bi bi-envelope" aria-hidden="true"></i>Recevoir le brief</a>' +
        '<a class="aq-icon d-lg-none" href="recherche.html" aria-label="Rechercher"><i class="bi bi-search" aria-hidden="true"></i></a>' +
      '</div></header>' +
      '<nav class="aq-mainnav" id="mainNav" aria-label="Rubriques"><div class="container-xl">' +
        '<a class="aq-mainnav__mini" href="index.html" aria-label="Afriquinfos, accueil"><img src="assets/img/logo-compact-negatif.png" alt="" width="600" height="158" loading="lazy"></a>' +
        '<ul class="aq-menu d-none d-lg-flex">' +
          MENU.map(function (r) { return '<li><a href="' + urlRub(r) + '"' + cur(r) + '>' + esc(R[r].label) + '</a></li>'; }).join('') +
          '<li class="dropdown"><a href="rubrique.html?r=afriques" class="dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" role="button"' + cur('afriques') + '>Les Afriques <i class="bi bi-chevron-down" aria-hidden="true"></i></a>' +
            '<ul class="dropdown-menu aq-dropdown"><li><a class="dropdown-item dropdown-item--all" href="rubrique.html?r=afriques">Toutes les Afriques</a></li>' + regionItems + '</ul></li>' +
          '<li><a href="' + urlRub('tips') + '"' + cur('tips') + '>Tips</a></li>' +
        '</ul>' +
        '<div class="aq-menu-scroll d-lg-none">' +
          MENU.map(function (r) { return '<a href="' + urlRub(r) + '"' + cur(r) + '>' + esc(R[r].label) + '</a>'; }).join('') +
          '<a href="rubrique.html?r=afriques"' + cur('afriques') + '>Les Afriques</a><a href="' + urlRub('tips') + '"' + cur('tips') + '>Tips</a><a href="portraits.html">Portraits</a>' +
        '</div>' +
        '<div class="aq-mainnav__tools ms-auto"><a class="aq-icon aq-icon--light aq-mainnav__search" href="recherche.html" aria-label="Rechercher"><i class="bi bi-search" aria-hidden="true"></i></a></div>' +
      '</div></nav>' +
      '<div class="offcanvas offcanvas-start aq-offcanvas" tabindex="-1" id="menu" aria-labelledby="menuTitre"><div class="offcanvas-header">' +
        '<h2 class="visually-hidden" id="menuTitre">Menu</h2><img src="assets/img/logo-compact-negatif.png" alt="Afriquinfos" width="129" height="34" loading="lazy">' +
        '<button type="button" class="aq-icon aq-icon--light" data-bs-dismiss="offcanvas" aria-label="Fermer le menu"><i class="bi bi-x-lg" aria-hidden="true"></i></button></div>' +
        '<div class="offcanvas-body"><form class="aq-searchbar mb-3" action="recherche.html" role="search"><i class="bi bi-search" aria-hidden="true"></i><label class="visually-hidden" for="mq">Rechercher</label><input id="mq" name="q" type="search" placeholder="Rechercher…"></form>' +
        '<nav class="aq-offcanvas__nav" aria-label="Rubriques">' +
          MENU.map(function (r) { return '<a href="' + urlRub(r) + '"' + cur(r) + '>' + esc(R[r].label) + '</a>'; }).join('') +
          '<a href="rubrique.html?r=afriques"' + cur('afriques') + '>Les Afriques</a>' + Object.keys(G).map(function (g) { return '<a class="is-sub" href="' + urlRegion(g) + '"' + (params.get('region') === g ? ' aria-current="page"' : '') + '>' + esc(G[g]) + '</a>'; }).join('') +
          '<a href="' + urlRub('tips') + '"' + cur('tips') + '>Tips</a></nav>' +
        '<p class="aq-offcanvas__label">Afriquinfos</p><nav class="aq-offcanvas__nav" aria-label="Liens utiles"><a class="is-sub" href="portraits.html">Portraits</a><a class="is-sub" href="agendas.html">Agendas</a><a class="is-sub" href="contact.html">Contact</a><a class="is-sub" href="rss.xml">Flux RSS</a></nav>' +
        '<div class="aq-social mt-4">' + social + '</div></div></div>';

    // menu collant : mini-logo quand l'en-tête disparaît
    var nav = $('#mainNav'), head = $('.aq-head');
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { nav.classList.toggle('is-stuck', !e[0].isIntersecting); }).observe(head);
    // la dropdown s'ouvre aussi au survol sur grand écran
    // Bootstrap est chargé après app.js (le contenu s'affiche sans l'attendre) : on attend window.load
    var dd = $('.aq-menu .dropdown');
    function hoverDropdown() {
      if (!dd || !window.bootstrap || !window.matchMedia('(hover: hover) and (min-width: 992px)').matches) return;
      var t = dd.querySelector('.dropdown-toggle'), inst = bootstrap.Dropdown.getOrCreateInstance(t), timer;
      dd.addEventListener('mouseenter', function () { clearTimeout(timer); inst.show(); });
      dd.addEventListener('mouseleave', function () { timer = setTimeout(function () { inst.hide(); }, 150); });
    }
    if (window.bootstrap) hoverDropdown(); else window.addEventListener('load', hoverDropdown);
  }

  function renderFooter() {
    var host = $('#aq-footer'); if (!host) return;
    host.innerHTML = '<footer class="aq-footer"><div class="container-xl"><div class="aq-footer__top">' +
      '<img src="assets/img/logo-afriquinfos-negatif.png" alt="Afriquinfos — Ni totems, ni tabous. L’actualité panafricaine" width="600" height="214" loading="lazy">' +
      '<div class="aq-social"><a href="https://www.facebook.com/afriquinfoscom/" aria-label="Afriquinfos sur Facebook" rel="noopener"><i class="bi bi-facebook" aria-hidden="true"></i></a><a href="https://x.com/AfriquinfosActu" aria-label="Afriquinfos sur X" rel="noopener"><i class="bi bi-twitter-x" aria-hidden="true"></i></a><a href="rss.xml" aria-label="Flux RSS"><i class="bi bi-rss" aria-hidden="true"></i></a></div></div>' +
      '<div class="row g-4">' +
        '<nav class="col-6 col-md-3" aria-label="Rubriques"><h2>Rubriques</h2>' + MENU.concat(['tips']).map(function (r) { return '<a href="' + urlRub(r) + '">' + esc(R[r].label) + '</a>'; }).join('') + '</nav>' +
        '<nav class="col-6 col-md-3" aria-label="Les Afriques"><h2>Les Afriques</h2>' + Object.keys(G).map(function (g) { return '<a href="' + urlRegion(g) + '">' + esc(G[g]) + '</a>'; }).join('') + '</nav>' +
        '<nav class="col-6 col-md-3" aria-label="Afriquinfos"><h2>Afriquinfos</h2><a href="portraits.html">Portraits</a><a href="agendas.html">Agendas</a><a href="contact.html">Contact</a><a href="rss.xml">Flux RSS</a></nav>' +
        '<nav class="col-6 col-md-3" aria-label="Annonceurs"><h2>Annonceurs</h2><a href="contact.html?sujet=publicite">Kit média</a><a href="contact.html?sujet=publicite">Publicité</a><a href="contact.html?sujet=publicite">Contenus de marque</a></nav>' +
      '</div><div class="aq-footer__bottom"><span>© ' + new Date().getFullYear() + ' Afriquinfos. Tous droits réservés.</span><span><a href="#" data-todo>Mentions légales</a><a href="#" data-todo>Confidentialité</a><a href="#" data-todo>Cookies</a><a href="admin/index.html" rel="nofollow">Administration</a></span></div></div></footer>';
  }

  function flashBlock() {
    // un flash = { id: article, text } ; un texte seul reste accepté
    function item(f, hidden) {
      var t = typeof f === 'string' ? f : f.text, a = typeof f === 'string' ? null : find(f.id);
      return a ? '<a class="aq-flash__item" href="' + urlArticle(a) + '"' + (hidden ? ' tabindex="-1"' : '') + '>' + fr(t) + '</a>' : '<span class="aq-flash__item">' + fr(t) + '</span>';
    }
    var items = D.flash.map(function (f) { return item(f); }).join(''), copy = D.flash.map(function (f) { return item(f, true); }).join('');
    return '<div class="aq-flashbar"><div class="container-xl"><div class="aq-flash" role="region" aria-label="Flash info">' +
      '<div class="aq-flash__label"><span class="aq-flash__dot" aria-hidden="true"></span><span><small>En direct</small><strong>Flash info</strong></span></div>' +
      '<div class="aq-flash__viewport"><div class="aq-flash__track">' + items + '<span class="aq-flash__copy" aria-hidden="true">' + copy + '</span></div></div>' +
      '<button class="aq-flash__pause" type="button" aria-label="Mettre le défilement en pause" aria-pressed="false"><i class="bi bi-pause-fill" aria-hidden="true"></i></button></div></div></div>';
  }
  function bindFlash() {
    $$('.aq-flash__pause').forEach(function (b) {
      b.addEventListener('click', function () {
        var box = b.closest('.aq-flash'), on = !box.classList.contains('is-paused');
        box.classList.toggle('is-paused', on);
        b.setAttribute('aria-pressed', String(on));
        b.setAttribute('aria-label', on ? 'Reprendre le défilement' : 'Mettre le défilement en pause');
        b.innerHTML = '<i class="bi bi-' + (on ? 'play' : 'pause') + '-fill" aria-hidden="true"></i>';
      });
    });
  }

  /* ===================== Comportements communs ===================== */
  function bindTheme() {
    var root = document.documentElement, btn = $('#themeToggle');
    function apply(t) {
      root.setAttribute('data-theme', t);
      if (!btn) return;
      btn.setAttribute('aria-pressed', String(t === 'dark'));
      btn.innerHTML = '<i class="bi bi-' + (t === 'dark' ? 'sun' : 'moon-stars') + '" aria-hidden="true"></i><span>' + (t === 'dark' ? 'Clair' : 'Sombre') + '</span>';
    }
    apply(root.getAttribute('data-theme') || 'light');
    if (btn) btn.addEventListener('click', function () {
      var t = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(t); store('aq-theme', t);
    });
  }
  function bindNewsletter() {
    // « Recevoir le brief » : on amène le lecteur jusqu'au champ, curseur placé
    $$('a[href="#newsletter"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var input = $('#nlEmail'); if (!input) return;
        e.preventDefault();
        $('#newsletter').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        setTimeout(function () { input.focus({ preventScroll: true }); }, reduceMotion ? 0 : 450);
      });
    });
    $$('[data-newsletter]').forEach(function (form) {
      var input = form.querySelector('input'), msg = form.querySelector('.aq-form__msg');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim())) {
          msg.textContent = 'Saisissez une adresse e-mail valide, par exemple nom@domaine.com.';
          input.setAttribute('aria-invalid', 'true'); input.focus(); return;
        }
        input.removeAttribute('aria-invalid');
        msg.textContent = 'Inscription confirmée : votre premier brief arrive demain matin.';
        form.reset();
      });
    });
  }
  function bindRails() {
    $$('[data-rail]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var rail = document.getElementById(btn.getAttribute('data-rail')); if (!rail) return;
        var item = rail.firstElementChild, step = item ? item.getBoundingClientRect().width + 20 : 280;
        rail.scrollBy({ left: step * Number(btn.getAttribute('data-dir')), behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    });
  }
  function toast(text) {
    var t = $('.aq-toast');
    if (!t) { t = document.createElement('div'); t.className = 'aq-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = text; t.classList.add('is-on');
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('is-on'); }, 2500);
  }
  function filterChips(container, options, current, onPick) {
    container.innerHTML = options.map(function (o) {
      return '<button type="button" data-value="' + esc(o.value) + '" aria-pressed="' + (o.value === current) + '">' + esc(o.label) + (o.count != null ? '<small>' + o.count + '</small>' : '') + '</button>';
    }).join('');
    container.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      $$('button', container).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      onPick(b.getAttribute('data-value'));
    });
  }

  /* ===================== Page : accueil (minimaliste, couleurs du média) ===================== */
  // Une seule palette : noir, orange, blanc. COLORS reste pour les pages qui l'utilisent.
  var COLORS = { politique: 'ink', economie: 'ink', sports: 'ink', societe: 'ink', culture: 'ink', opinion: 'ink', tips: 'ink', portraits: 'ink' };

  function section(id, tone, inner, extra) {
    return '<section class="aq-section aq-section--' + tone + ' ' + (extra || '') + '" id="' + id + '" aria-labelledby="h-' + id + '"><div class="container-xl">' + inner + '</div></section>';
  }
  function head(id, title, tagline, href, more) {
    return '<header class="aq-chapter__head"><h2 class="aq-chapter__title" id="h-' + id + '">' + esc(title) + '</h2><p class="aq-chapter__tagline">' + esc(tagline) + '</p>' +
      (href ? '<a class="aq-more" href="' + href + '">' + esc(more || 'Tout voir') + '</a>' : '') + '</header>';
  }
  function two(n) { return n < 10 ? '0' + n : String(n); }

  function pageHome(main) {
    var une = sorted.filter(function (a) { return a.une; })[0] || sorted[0];
    var slides = [une];
    ['politique', 'societe', 'sports', 'culture'].forEach(function (r) {
      var a = byRub(r).filter(function (x) { return slides.indexOf(x) < 0; })[0];
      if (a) slides.push(a);
    });
    var fil = sorted.filter(function (a) { return slides.indexOf(a) < 0 && a.rub !== 'portraits'; }).slice(0, 4);
    // Anti-doublons : un article déjà vu plus haut (une, fil, autre section) n'est réutilisé
    // que s'il n'y a pas assez de contenus inédits pour remplir le bloc.
    var seen = slides.concat(fil);
    function pick(list, n) {
      var fresh = list.filter(function (a) { return seen.indexOf(a) < 0; }), out = fresh.slice(0, n);
      if (out.length < n) out = out.concat(list.filter(function (a) { return out.indexOf(a) < 0; }).slice(0, n - out.length));
      out.forEach(function (a) { if (seen.indexOf(a) < 0) seen.push(a); });
      return out;
    }
    // ordre de la page : Les Afriques d'abord, puis les rubriques
    var regional = sorted.filter(function (a) { return a.region && a.rub !== 'portraits'; });
    var afr = pick(regional, 6);
    var pol = pick(byRub('politique'), 5), eco = pick(byRub('economie'), 5), soc = pick(byRub('societe'), 3), cul = pick(byRub('culture'), 6), spo = pick(byRub('sports'), 5),
        opi = byRub('opinion'), tips = byRub('tips'), por = byRub('portraits');

    var nowDay = new Date().toISOString().slice(0, 10);
    var nextEvents = D.agenda.filter(function (e) { return (e.end || e.date) >= nowDay; }).slice(0, 3);

    var slider =
      '<section class="aq-slider" aria-roledescription="carrousel" aria-label="À la une"><div class="container-xl">' +
        '<div class="aq-slider__stage" id="slTrack" aria-live="off">' +
          slides.map(function (a, i) {
            var hidden = i ? ' aria-hidden="true"' : '', tab = i ? ' tabindex="-1"' : '', h = 'h2';
            return '<article class="aq-slide' + (i === 0 ? ' is-active' : '') + '" id="slide-' + i + '" role="group" aria-roledescription="diapositive" aria-label="' + (i + 1) + ' sur ' + slides.length + '"' + hidden + '>' +
              '<a class="aq-slide__media" href="' + urlArticle(a) + '" tabindex="-1" aria-hidden="true">' + ph(a, { priority: i === 0, sizes: '(min-width: 992px) 58vw, 100vw' }) + '</a>' +
              '<div class="aq-slide__text">' +
                '<span class="aq-slide__kicker">' + fr(kicker(a, 'rub')) + '</span>' +
                '<' + h + ' class="aq-slide__title"><a href="' + urlArticle(a) + '"' + tab + '>' + fr(a.title) + '</a></' + h + '>' +
                '<p class="aq-slide__chapo">' + fr(a.chapo) + '</p>' +
                '<p class="aq-slide__meta">Par ' + esc(a.author) + ', ' + rel(a.date) + ', ' + a.read + ' min de lecture</p>' +
                '<a class="aq-slide__cta" href="' + urlArticle(a) + '"' + tab + '>Lire l’article</a>' +
              '</div></article>';
          }).join('') +
        '</div>' +
        '<div class="aq-slider__nav">' +
          '<div class="aq-slider__tabs" role="tablist" aria-label="Articles à la une">' +
            slides.map(function (a, i) {
              return '<button type="button" role="tab" class="aq-slider__tab" aria-controls="slide-' + i + '" aria-selected="' + (i === 0) + '" data-go="' + i + '">' +
                '<span class="aq-slider__progress" aria-hidden="true"></span>' +
                '<small><b>' + two(i + 1) + '</b>' + esc(R[a.rub].label) + '</small><span class="aq-slider__tabtitle">' + fr(a.title) + '</span></button>';
            }).join('') +
          '</div>' +
          '<div class="aq-slider__btns"><button type="button" class="aq-slider__btn" data-step="-1" aria-label="Article précédent"><i class="bi bi-arrow-left" aria-hidden="true"></i></button>' +
          '<button type="button" class="aq-slider__btn" id="slPause" aria-label="Mettre le défilement en pause"><i class="bi bi-pause-fill" aria-hidden="true"></i></button>' +
          '<button type="button" class="aq-slider__btn" data-step="1" aria-label="Article suivant"><i class="bi bi-arrow-right" aria-hidden="true"></i></button></div>' +
        '</div></div></section>';

    main.innerHTML = '<h1 class="visually-hidden">Afriquinfos, l’actualité panafricaine</h1><div class="aq-hero">' + flashBlock() + slider + '</div>' +

      // Le fil
      '<section class="aq-section aq-section--white aq-section--fil" aria-labelledby="filTitre"><div class="container-xl"><div class="aq-filrow">' +
        '<h2 class="aq-filrow__title" id="filTitre"><span class="aq-live" aria-hidden="true"></span>Le fil</h2>' +
        '<ol class="aq-filrow__list">' + fil.map(function (a) { return '<li><a href="' + urlArticle(a) + '"><span class="aq-filrow__meta"><time datetime="' + a.date + '">' + rel(a.date) + '</time>' + esc(R[a.rub].label) + '</span><strong>' + fr(a.title) + '</strong></a></li>'; }).join('') + '</ol>' +
      '</div></div></section>' +

      // Les Afriques
      section('afriques', 'white', head('afriques', 'Les Afriques', 'Six régions, une même exigence', 'rubrique.html?r=afriques') +
        '<div class="aq-filters" id="homeRegions" role="group" aria-label="Filtrer par région"></div><div class="row g-4 g-xl-5" id="homeRegionGrid" aria-live="polite"></div>') +

      // Politique
      section('politique', 'white', head('politique', 'Politique', R.politique.tagline, urlRub('politique')) +
        '<div class="row g-5"><article class="col-lg-7 aq-lead"><a href="' + urlArticle(pol[0]) + '">' + media(pol[0], 'aq-media--wide') +
        '<span class="aq-card__place">' + fr(kicker(pol[0])) + '</span><h3 class="aq-lead__title">' + fr(pol[0].title) + '</h3><p class="aq-lead__text">' + fr(pol[0].chapo) + '</p></a></article>' +
        '<div class="col-lg-5 aq-stack">' + pol.slice(1, 5).map(function (a) { return '<a class="aq-stack__item" href="' + urlArticle(a) + '"><span class="aq-card__place">' + fr(kicker(a)) + '</span><h3>' + fr(a.title) + '</h3><time class="aq-card__meta">' + rel(a.date) + '</time></a>'; }).join('') + '</div></div>') +

      '<div class="container-xl"><div class="aq-ad aq-ad--billboard" role="complementary" aria-label="Publicité"><span>Publicité</span><b class="d-none d-md-block">970 × 250</b><b class="d-md-none">300 × 250</b></div></div>' +

      // Économie : la bande noire
      section('economie', 'ink', head('economie', 'Économie', R.economie.tagline, urlRub('economie')) +
        '<div class="row g-5"><article class="col-lg-6 aq-lead"><a href="' + urlArticle(eco[0]) + '">' + media(eco[0], 'aq-media--wide') +
        '<span class="aq-card__place">' + fr(eco[0].country) + '</span><h3 class="aq-lead__title">' + fr(eco[0].title) + '</h3><p class="aq-lead__text">' + fr(eco[0].chapo) + '</p></a></article>' +
        '<div class="col-lg-6 aq-hlist">' + eco.slice(1, 5).map(function (a) { return card(a, { h: true }); }).join('') + '</div></div>') +

      // Société
      section('societe', 'white', head('societe', 'Société', R.societe.tagline, urlRub('societe')) +
        '<div class="row g-4 g-xl-5">' + soc.slice(0, 3).map(function (a) { return card(a, { col: 'col-md-4' }); }).join('') + '</div>', 'aq-below') +

      // Culture
      section('culture', 'white', head('culture', 'Culture', R.culture.tagline, urlRub('culture')) +
        '<div class="aq-rail-x" id="cultureRail" tabindex="0" aria-label="Articles culture">' +
          cul.map(function (a) { return '<a class="aq-poster" href="' + urlArticle(a) + '">' + ph(a) + '<span class="aq-poster__kind">' + fr(a.country) + '</span><h3>' + fr(a.title) + '</h3></a>'; }).join('') + '</div>' +
        '<div class="aq-rail-x__nav"><button type="button" class="aq-icon aq-icon--outline" data-rail="cultureRail" data-dir="-1" aria-label="Précédent"><i class="bi bi-arrow-left" aria-hidden="true"></i></button><button type="button" class="aq-icon aq-icon--outline" data-rail="cultureRail" data-dir="1" aria-label="Suivant"><i class="bi bi-arrow-right" aria-hidden="true"></i></button></div>', 'aq-below') +

      // Sports
      section('sports', 'white', head('sports', 'Sports', R.sports.tagline, urlRub('sports')) +
        '<div class="row g-5"><article class="col-lg-7 aq-lead"><a href="' + urlArticle(spo[0]) + '">' + media(spo[0], 'aq-media--wide') + '<span class="aq-card__place">' + fr(spo[0].country) + '</span><h3 class="aq-lead__title">' + fr(spo[0].title) + '</h3><p class="aq-lead__text">' + fr(spo[0].chapo) + '</p></a></article>' +
        '<div class="col-lg-5 aq-stack">' + spo.slice(1, 5).map(function (a) { return '<a class="aq-stack__item" href="' + urlArticle(a) + '"><span class="aq-card__place">' + fr(a.country) + '</span><h3>' + fr(a.title) + '</h3><time class="aq-card__meta">' + rel(a.date) + '</time></a>'; }).join('') + '</div></div>', 'aq-below') +

      // Portraits
      section('portraits', 'stone', head('portraits', 'Portraits', R.portraits.tagline, 'portraits.html') +
        '<div class="row g-4">' + por.slice(0, 4).map(function (a) { return portraitCard(a, 'col-sm-6 col-lg-3'); }).join('') + '</div>', 'aq-below') +

      // Opinion : la bande orange
      section('opinion', 'orange', head('opinion', 'Opinion', R.opinion.tagline, urlRub('opinion'), 'Toutes les tribunes') +
        '<div class="aq-debate"><p class="aq-debate__q">Le débat de la semaine</p><h3 class="aq-debate__title">' + fr(D.debat.question) + '</h3>' +
          '<div class="aq-debate__sides"><article class="aq-side"><span class="aq-side__label">Pour</span><blockquote>« ' + fr(D.debat.pour.text) + ' »</blockquote><p class="aq-side__who">' + fr(D.debat.pour.who) + '</p></article>' +
          '<article class="aq-side"><span class="aq-side__label">Contre</span><blockquote>« ' + fr(D.debat.contre.text) + ' »</blockquote><p class="aq-side__who">' + fr(D.debat.contre.who) + '</p></article></div>' +
          '<div class="aq-poll" id="poll"><p class="aq-poll__ask">Et vous, qu’en pensez-vous ?</p><div class="aq-poll__buttons"><button type="button" class="aq-btn aq-btn--ink" data-vote="pour" aria-pressed="false">Je suis pour</button><button type="button" class="aq-btn aq-btn--outline" data-vote="contre" aria-pressed="false">Je suis contre</button></div>' +
          '<div id="pollResult" hidden><div class="aq-poll__bar" role="img" id="pollBar" aria-label="Résultats du vote"><span class="aq-poll__pour" id="barPour"></span><span class="aq-poll__contre" id="barContre"></span></div>' +
          '<p class="aq-poll__legend"><b id="pctPour"></b> pour, <b id="pctContre"></b> contre, <b id="pollTotal"></b> votes</p><p class="aq-poll__thanks" id="pollThanks" role="status"></p></div></div></div>' +
        '<div class="row g-4">' + opi.slice(0, 3).map(function (a) { return '<article class="col-md-4 aq-tribune"><a href="' + urlArticle(a) + '"><span class="aq-avatar" aria-hidden="true">' + initials(a.author) + '</span><h3>' + fr(a.title) + '</h3><p>' + fr(a.author) + '</p></a></article>'; }).join('') + '</div>', 'aq-below') +

      // Tips
      section('tips', 'white', head('tips', 'Tips', R.tips.tagline, urlRub('tips')) +
        '<div class="row g-4 g-xl-5">' + tips.slice(0, 3).map(function (a) { return '<article class="col-md-4 aq-tip"><a href="' + urlArticle(a) + '"><i class="bi ' + (a.icon || 'bi-lightbulb') + '" aria-hidden="true"></i><h3>' + fr(a.title) + '</h3><p>' + fr(a.chapo) + '</p></a></article>'; }).join('') + '</div>', 'aq-below') +

      // Agenda
      section('agenda', 'white', head('agenda', 'Agenda', 'Les rendez-vous à ne pas manquer', 'agendas.html', 'Tout l’agenda') +
        (nextEvents.length ? '<div class="aq-agenda-row">' + nextEvents.map(eventItem).join('') + '</div>' : '<p class="aq-empty">Aucun événement à venir pour le moment.</p>'), 'aq-below') +

      newsletterBlock();

    // Les Afriques : filtre par région
    var grid = $('#homeRegionGrid');
    function showRegion(g) {
      var list = (g === 'all' ? afr : byRegion(g).filter(function (a) { return a.rub !== 'portraits'; })).slice(0, 6);
      grid.innerHTML = list.length ? list.map(function (a) { return card(a, { col: 'col-md-6 col-xl-4 aq-fade', kicker: 'rub' }); }).join('') : '<p class="aq-empty">Aucun article récent pour cette région.</p>';
    }
    filterChips($('#homeRegions'), [{ value: 'all', label: 'Toutes' }].concat(Object.keys(G).map(function (g) { return { value: g, label: G[g] }; })), 'all', showRegion);
    showRegion('all');

    jsonLd({ '@context': 'https://schema.org', '@type': 'NewsMediaOrganization', name: 'Afriquinfos', url: SITE, logo: SITE + 'assets/img/logo-afriquinfos.png',
      slogan: 'Ni totems, ni tabous', sameAs: ['https://www.facebook.com/afriquinfoscom/', 'https://x.com/AfriquinfosActu'] });
    jsonLd({ '@context': 'https://schema.org', '@type': 'WebSite', name: 'Afriquinfos', url: SITE, inLanguage: 'fr',
      potentialAction: { '@type': 'SearchAction', target: SITE + 'recherche.html?q={search_term_string}', 'query-input': 'required name=search_term_string' } });
    bindSlider();
    bindPoll();
    bindAgendaButtons(main);
  }

  /* ---------- Slider « À la une » : sans bibliothèque ---------- */
  function bindSlider() {
    var root = $('.aq-slider'); if (!root) return;
    var slides = $$('.aq-slide', root), tabs = $$('.aq-slider__tab', root), stage = $('#slTrack');
    var pauseBtn = $('#slPause'), DURATION = 7000;
    var i = 0, start = 0, elapsed = 0;
    var userPaused = reduceMotion, hoverPaused = false;

    function go(n, fromUser) {
      n = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) {
        var on = k === n;
        s.classList.toggle('is-active', on);
        if (on) s.removeAttribute('aria-hidden'); else s.setAttribute('aria-hidden', 'true');
        $$('a', s).forEach(function (a) { if (on && !a.classList.contains('aq-slide__media')) a.removeAttribute('tabindex'); else a.setAttribute('tabindex', '-1'); });
      });
      tabs.forEach(function (t, k) { t.setAttribute('aria-selected', String(k === n)); t.style.setProperty('--p', k < n ? 1 : 0); });
      i = n; elapsed = 0; start = performance.now();
      stage.setAttribute('aria-live', fromUser ? 'polite' : 'off');
      var bar = tabs[n].parentElement;
      if (bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: Math.max(0, tabs[n].offsetLeft - tabs[0].offsetLeft), behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    // la boucle s'arrête quand le carrousel sort de l'écran (batterie, processeur des mobiles d'entrée de gamme)
    var visible = true, running = false;
    function loop(now) {
      if (!visible) { running = false; return; }
      if (!(userPaused || hoverPaused || document.hidden)) {
        elapsed += now - start;
        if (elapsed >= DURATION) go(i + 1, false);
      }
      start = now;
      tabs[i].style.setProperty('--p', Math.min(1, elapsed / DURATION));
      requestAnimationFrame(loop);
    }
    function kick() { if (!running) { running = true; start = performance.now(); requestAnimationFrame(loop); } }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; if (visible) kick(); }).observe(root);
    function setPaused(p) {
      userPaused = p;
      pauseBtn.setAttribute('aria-label', p ? 'Reprendre le défilement' : 'Mettre le défilement en pause');
      pauseBtn.innerHTML = '<i class="bi bi-' + (p ? 'play' : 'pause') + '-fill" aria-hidden="true"></i>';
    }
    tabs.forEach(function (t) { t.addEventListener('click', function () { go(Number(t.getAttribute('data-go')), true); }); });
    $$('[data-step]', root).forEach(function (b) { b.addEventListener('click', function () { go(i + Number(b.getAttribute('data-step')), true); }); });
    pauseBtn.addEventListener('click', function () { setPaused(!userPaused); });
    stage.addEventListener('mouseenter', function () { hoverPaused = true; });
    stage.addEventListener('mouseleave', function () { hoverPaused = false; });
    root.addEventListener('focusin', function () { hoverPaused = true; });
    root.addEventListener('focusout', function () { hoverPaused = false; });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { go(i + 1, true); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { go(i - 1, true); e.preventDefault(); }
    });
    var x0 = null;
    stage.addEventListener('pointerdown', function (e) { x0 = e.clientX; });
    stage.addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) go(i + (dx < 0 ? 1 : -1), true);
    });
    setPaused(userPaused);
    go(0, false);
    kick();
  }

  function bindScrollSpy() {
    var links = $$('#rail [data-section]');
    if (!links.length || !('IntersectionObserver' in window)) return;
    var vis = {};
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { vis[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0; });
      var best = null, r = 0;
      Object.keys(vis).forEach(function (id) { if (vis[id] > r) { best = id; r = vis[id]; } });
      links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('data-section') === best); });
    }, { rootMargin: '-20% 0px -45% 0px', threshold: [0, .1, .25, .5, .75, 1] });
    links.forEach(function (a) { var s = document.getElementById(a.getAttribute('data-section')); if (s) spy.observe(s); });
  }

  function bindPoll() {
    var poll = $('#poll'); if (!poll) return;
    var base = D.debat.base; // totaux de démonstration : en production, ils viennent du serveur
    function render(choice) {
      var pour = base.pour + (choice === 'pour' ? 1 : 0), contre = base.contre + (choice === 'contre' ? 1 : 0), total = pour + contre;
      var p = Math.round(pour / total * 100), c = 100 - p;
      $('#pollResult').hidden = false;
      requestAnimationFrame(function () { $('#barPour').style.width = p + '%'; $('#barContre').style.width = c + '%'; });
      $('#pctPour').textContent = p + ' %'; $('#pctContre').textContent = c + ' %'; $('#pollTotal').textContent = total;
      $('#pollBar').setAttribute('aria-label', p + ' % pour, ' + c + ' % contre');
      $$('[data-vote]', poll).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-vote') === choice)); });
      $('#pollThanks').textContent = 'Vote enregistré : vous êtes ' + choice + '. Vous pouvez changer d’avis à tout moment.';
    }
    var prev = store('aq-vote'); if (prev) render(prev);
    $$('[data-vote]', poll).forEach(function (b) { b.addEventListener('click', function () { var v = b.getAttribute('data-vote'); store('aq-vote', v); render(v); }); });
  }

  /* ===================== Agenda (partagé) ===================== */
  var fmtDay = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', timeZone: 'UTC' });
  var fmtMon = new Intl.DateTimeFormat('fr-FR', { month: 'short', timeZone: 'UTC' });
  var fmtRange = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  var fmtDayMon = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', timeZone: 'UTC' });
  function eventItem(e) {
    var d = new Date(e.date + 'T00:00:00Z'), end = new Date((e.end || e.date) + 'T00:00:00Z');
    var range = !e.end || e.end === e.date ? 'Le ' + fmtRange.format(d)
      : e.date.slice(0, 7) === e.end.slice(0, 7) ? 'Du ' + fmtDay.format(d) + ' au ' + fmtRange.format(end)
      : e.date.slice(0, 4) === e.end.slice(0, 4) ? 'Du ' + fmtDayMon.format(d) + ' au ' + fmtRange.format(end)
      : 'Du ' + fmtRange.format(d) + ' au ' + fmtRange.format(end);
    return '<article class="aq-event"><div class="aq-event__date" aria-hidden="true"><span class="aq-event__day">' + fmtDay.format(d) + '</span><span class="aq-event__month">' + fmtMon.format(d).replace('.', '') + '</span></div>' +
      '<div><span class="aq-event__cat">' + esc(e.cat) + '</span><h3 class="aq-event__title">' + fr(e.title) + '</h3>' +
      '<p class="aq-event__where"><i class="bi bi-geo-alt" aria-hidden="true"></i> ' + esc(e.city) + ', ' + esc(e.country) + ' — ' + range + '</p>' +
      '<p class="aq-event__desc">' + fr(e.desc) + '</p><button type="button" class="aq-linkbtn" data-ics="' + esc(e.id) + '" aria-label="Ajouter « ' + esc(e.title) + ' » à mon agenda"><i class="bi bi-calendar-plus" aria-hidden="true"></i>Ajouter à mon agenda</button></div></article>';
  }
  function bindAgendaButtons(scope) {
    scope.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-ics]'); if (!b) return;
      var e = D.agenda.filter(function (x) { return x.id === b.getAttribute('data-ics'); })[0]; if (!e) return;
      var endPlus = new Date((e.end || e.date) + 'T00:00:00Z'); endPlus.setUTCDate(endPlus.getUTCDate() + 1);
      var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Afriquinfos//Agenda//FR', 'BEGIN:VEVENT',
        'UID:' + e.id + '@afriquinfos.com', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z',
        'DTSTART;VALUE=DATE:' + e.date.replace(/-/g, ''), 'DTEND;VALUE=DATE:' + endPlus.toISOString().slice(0, 10).replace(/-/g, ''),
        'SUMMARY:' + e.title, 'LOCATION:' + e.city + ', ' + e.country, 'DESCRIPTION:' + e.desc, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
      var url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
      var a = document.createElement('a'); a.href = url; a.download = e.id + '.ics'; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      toast('Événement ajouté : ouvrez le fichier .ics pour l’enregistrer dans votre agenda.');
    });
  }

  /* ===================== Page : rubrique / région ===================== */
  function pageRubrique(main) {
    var r = params.get('r'), g = params.get('region');
    var list, title, tagline, chips, chipKey, crumb;
    if (g && G[g]) {
      list = byRegion(g); title = G[g]; tagline = 'Toute l’actualité de la région, toutes rubriques confondues';
      crumb = [{ label: 'Les Afriques', href: 'rubrique.html?r=afriques' }, { label: G[g] }];
      chipKey = 'rub'; chips = uniq(list.map(function (a) { return a.rub; })).map(function (x) { return { value: x, label: R[x].label }; });
    } else if (r === 'afriques') {
      list = sorted.filter(function (a) { return a.region; }); title = 'Les Afriques'; tagline = 'Six régions, une même exigence';
      crumb = [{ label: 'Les Afriques' }];
      chipKey = 'region'; chips = Object.keys(G).map(function (x) { return { value: x, label: G[x] }; });
    } else if (r && R[r]) {
      if (r === 'portraits') { location.replace('portraits.html'); return; }
      list = byRub(r); title = R[r].label; tagline = R[r].tagline; crumb = [{ label: R[r].label }];
      chipKey = 'region'; chips = uniq(list.map(function (a) { return a.region; }).filter(Boolean)).map(function (x) { return { value: x, label: G[x] }; });
    } else {
      main.innerHTML = notFound('Cette rubrique n’existe pas', 'Le lien que vous avez suivi est peut-être incomplet. Choisissez une rubrique dans le menu ou revenez à l’accueil.');
      return;
    }
    document.title = title + ' — Afriquinfos';
    setMeta(tagline);
    setCanonical(SITE + 'rubrique.html?' + (g ? 'region=' + g : 'r=' + r));

    var showFlash = r !== 'tips';
    main.innerHTML = (showFlash ? flashBlock() : '') +
      '<div class="aq-pagehero"><div class="container-xl">' + crumbs(crumb) + chapterHead(title, tagline, null, null, 1) + '</div></div>' +
      '<div class="container-xl"><div class="row g-5"><div class="col-lg-8">' +
        (chips.length > 1 ? '<div class="aq-filters" id="rubFilters" role="group" aria-label="Filtrer"></div>' : '') +
        '<div id="rubLead"></div><div class="row g-4 mt-1" id="rubGrid" aria-live="polite"></div>' +
        '<div class="aq-loadmore"><button type="button" class="aq-btn aq-btn--outline" id="loadMore">Afficher plus d’articles</button></div>' +
      '</div><aside class="col-lg-4"><div class="aq-sticky"><div class="aq-side-box"><h2>Les plus lus</h2>' + top5(list.length >= 3 ? list : sorted) + '</div>' +
        '<div class="aq-ad aq-ad--pave mb-4" role="complementary" aria-label="Publicité"><span>Publicité</span><b>300 × 250</b></div></div></aside></div></div>' + newsletterBlock();

    var PAGE_SIZE = 6, shown = 0, current = list;
    function draw(reset) {
      if (reset) { shown = 0; $('#rubGrid').innerHTML = ''; }
      var lead = current[0];
      $('#rubLead').innerHTML = lead ? '<article class="aq-lead aq-fade"><a href="' + urlArticle(lead) + '">' + media(lead, 'aq-media--wide') + '<span class="aq-card__place mt-3">' + fr(kicker(lead, g ? 'rub' : null)) + '</span><h2 class="aq-lead__title mt-1">' + fr(lead.title) + '</h2><p class="aq-lead__text">' + fr(lead.chapo) + '</p></a></article>' :
        '<p class="aq-empty">Aucun article pour ce filtre. Choisissez « Tout » pour tout afficher.</p>';
      var rest = current.slice(1), next = rest.slice(shown, shown + PAGE_SIZE);
      $('#rubGrid').insertAdjacentHTML('beforeend', next.map(function (a) { return card(a, { col: 'col-md-6 aq-fade', kicker: g ? 'rub' : null }); }).join(''));
      shown += next.length;
      var btn = $('#loadMore'); btn.hidden = shown >= rest.length;
    }
    $('#loadMore').addEventListener('click', function () { draw(false); });
    if ($('#rubFilters')) {
      filterChips($('#rubFilters'), [{ value: 'all', label: 'Tout', count: list.length }].concat(chips.map(function (c) {
        c.count = list.filter(function (a) { return a[chipKey] === c.value; }).length; return c;
      })), 'all', function (v) {
        current = v === 'all' ? list : list.filter(function (a) { return a[chipKey] === v; });
        draw(true);
      });
    }
    draw(true);
  }
  function uniq(arr) { return arr.filter(function (x, i) { return arr.indexOf(x) === i; }); }

  /* ===================== Page : article ===================== */
  function pageArticle(main) {
    var a = find(params.get('id'));
    if (!a) { main.innerHTML = notFound('Article introuvable', 'Cet article a peut-être été déplacé. Retrouvez-le avec la recherche ou parcourez les rubriques.'); return; }
    document.title = a.title + ' — Afriquinfos';
    setMeta(a.chapo);

    var sameRub = byRub(a.rub), idx = sameRub.indexOf(a);
    var newer = sameRub[idx - 1], older = sameRub[idx + 1];
    var related = sameRub.filter(function (x) { return x !== a; }).slice(0, 3);
    var sameRegion = a.region ? byRegion(a.region).filter(function (x) { return x !== a && related.indexOf(x) < 0; }).slice(0, 3) : [];
    var crumb = [{ label: R[a.rub].label, href: urlRub(a.rub) }];
    if (a.region) crumb.push({ label: G[a.region], href: urlRegion(a.region) });
    crumb.push({ label: a.title.length > 48 ? a.title.slice(0, 46) + '…' : a.title });

    var body = a.body.map(function (b) {
      if (b.indexOf('## ') === 0) return '<h2>' + fr(b.slice(3)) + '</h2>';
      if (b.indexOf('> ') === 0) return '<blockquote>' + fr(b.slice(2)) + '</blockquote>';
      return '<p>' + fr(b) + '</p>';
    }).join('');
    var fiche = a.person ? '<div class="aq-fiche"><div class="aq-fiche__mono" aria-hidden="true">' + esc(a.person.initials) + '</div><dl>' +
      '<div><dt>Nom</dt><dd>' + esc(a.person.name) + '</dd></div><div><dt>Activité</dt><dd>' + esc(a.person.role) + '</dd></div>' +
      '<div><dt>Ville</dt><dd>' + esc(a.person.city) + ', ' + esc(a.country) + '</dd></div><div><dt>Domaine</dt><dd>' + esc(a.person.field) + '</dd></div>' +
      '<div><dt>En activité depuis</dt><dd>' + esc(a.person.since) + '</dd></div></dl></div>' : '';
    var share = encodeURIComponent(location.href), text = encodeURIComponent(a.title);

    main.innerHTML = '<div class="aq-progress" id="progress" aria-hidden="true"></div>' +
      '<article class="aq-article" itemscope itemtype="https://schema.org/NewsArticle"><div class="container-xl">' + crumbs(crumb) +
      '<div class="row g-5"><div class="col-lg-8">' +
        '<a class="aq-tag" href="' + urlRub(a.rub) + '">' + esc(R[a.rub].label) + '</a>' +
        '<h1 class="aq-article__title" itemprop="headline">' + fr(a.title) + '</h1><p class="aq-article__chapo" itemprop="description">' + fr(a.chapo) + '</p>' +
        '<div class="aq-article__bar"><div class="aq-byline"><span class="aq-avatar" aria-hidden="true">' + initials(a.author) + '</span><div><strong itemprop="author">Par ' + esc(a.author) + '</strong>' +
          '<time datetime="' + a.date + '" itemprop="datePublished">' + cap(fmtLong.format(new Date(a.date))) + '</time>, ' + a.read + ' min de lecture</div></div>' +
          '<div class="aq-tools"><button class="aq-icon" type="button" data-size="-1" aria-label="Réduire la taille du texte"><span class="aq-tools__size">A-</span></button><button class="aq-icon" type="button" data-size="1" aria-label="Agrandir la taille du texte"><span class="aq-tools__size">A+</span></button><span class="aq-tools__sep" aria-hidden="true"></span>' +
          '<a class="aq-icon" href="https://www.facebook.com/sharer/sharer.php?u=' + share + '" target="_blank" rel="noopener" aria-label="Partager sur Facebook"><i class="bi bi-facebook" aria-hidden="true"></i></a>' +
          '<a class="aq-icon" href="https://x.com/intent/post?url=' + share + '&text=' + text + '" target="_blank" rel="noopener" aria-label="Partager sur X"><i class="bi bi-twitter-x" aria-hidden="true"></i></a>' +
          '<a class="aq-icon" href="https://www.linkedin.com/sharing/share-offsite/?url=' + share + '" target="_blank" rel="noopener" aria-label="Partager sur LinkedIn"><i class="bi bi-linkedin" aria-hidden="true"></i></a>' +
          '<a class="aq-icon" href="https://wa.me/?text=' + text + '%20' + share + '" target="_blank" rel="noopener" aria-label="Partager sur WhatsApp"><i class="bi bi-whatsapp" aria-hidden="true"></i></a>' +
          '<button class="aq-icon" type="button" id="copyLink" aria-label="Copier le lien"><i class="bi bi-link-45deg" aria-hidden="true"></i></button>' +
          // partage natif (mobile) : ouvre WhatsApp, Telegram, SMS… en un geste
          '<button class="aq-btn aq-btn--ink aq-share-native" type="button" id="shareNative" hidden><i class="bi bi-share" aria-hidden="true"></i>Partager</button></div></div>' +
        fiche +
        '<figure class="aq-figure"><div class="aq-media aq-media--cut">' + ph(a, { alt: true, priority: true, sizes: '(min-width: 992px) 760px, 100vw' }) + '</div><figcaption>' + fr(a.img) + '. Photo de démonstration.</figcaption></figure>' +
        '<div class="aq-prose" itemprop="articleBody">' + body + '</div>' +
        '<div class="aq-tags" aria-label="Mots-clés">' + a.tags.map(function (t) { return '<a href="recherche.html?q=' + encodeURIComponent(t) + '">' + esc(t) + '</a>'; }).join('') + '</div>' +
        '<div class="aq-author"><span class="aq-avatar" aria-hidden="true">' + initials(a.author) + '</span><p><strong>' + esc(a.author) + '</strong><br>' + (a.rub === 'opinion' ? 'Les tribunes publiées n’engagent que leurs auteurs.' : 'Journaliste à la rédaction d’Afriquinfos.') + '</p></div>' +
        '<p class="aq-demo">Maquette : ce texte est un contenu de démonstration.</p>' +
        '<nav class="aq-prevnext" aria-label="Articles de la même rubrique">' +
          (older ? '<a href="' + urlArticle(older) + '"><small><i class="bi bi-arrow-left" aria-hidden="true"></i> Article précédent</small><strong>' + fr(older.title) + '</strong></a>' : '<span></span>') +
          (newer ? '<a class="is-next" href="' + urlArticle(newer) + '"><small>Article suivant <i class="bi bi-arrow-right" aria-hidden="true"></i></small><strong>' + fr(newer.title) + '</strong></a>' : '') +
        '</nav></div>' +
        '<aside class="col-lg-4"><div class="aq-sticky"><div class="aq-side-box"><h2>À lire aussi</h2>' +
          related.map(function (x) { return '<a class="aq-stack__item" href="' + urlArticle(x) + '"><span class="aq-card__place">' + fr(kicker(x)) + '</span><h3>' + fr(x.title) + '</h3></a>'; }).join('') + '</div>' +
          '<div class="aq-side-box"><h2>Les plus lus</h2>' + top5(sorted) + '</div>' +
          '<div class="aq-ad aq-ad--pave" role="complementary" aria-label="Publicité"><span>Publicité</span><b>300 × 250</b></div></div></aside></div></div></article>' +
      (sameRegion.length ? '<section class="aq-section aq-section--related aq-below" aria-label="Dans la même région"><div class="container-xl">' + chapterHead(G[a.region], 'Dans la même région', urlRegion(a.region), 'Toute la région') +
        '<div class="row g-4">' + sameRegion.map(function (x) { return card(x, { col: 'col-md-4', kicker: 'rub' }); }).join('') + '</div></div></section>' : '') +
      newsletterBlock();

    // Référencement et partage. En production, ces balises doivent sortir du serveur (CMS) :
    // Facebook, WhatsApp, LinkedIn et X n'exécutent pas JavaScript.
    var canonical = SITE + urlArticle(a), image = a.src ? SITE + a.src : SITE + 'assets/img/og-default.jpg';
    setCanonical(canonical);
    setOg({ 'og:title': a.title, 'og:description': a.chapo, 'og:url': canonical, 'og:image': image, 'og:type': 'article', 'article:published_time': a.date, 'article:section': R[a.rub].label });
    jsonLd({ '@context': 'https://schema.org', '@type': 'NewsArticle', mainEntityOfPage: { '@type': 'WebPage', '@id': canonical }, headline: a.title, description: a.chapo,
      image: [image], datePublished: a.date, dateModified: a.updated || a.date, inLanguage: 'fr',
      author: { '@type': 'Person', name: a.author }, articleSection: R[a.rub].label, keywords: a.tags.join(', '),
      publisher: { '@type': 'NewsMediaOrganization', name: 'Afriquinfos', logo: { '@type': 'ImageObject', url: SITE + 'assets/img/logo-afriquinfos.png', width: 600, height: 214 } } });
    jsonLd({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ name: 'Accueil', url: SITE }].concat(crumb.slice(0, -1).map(function (c) { return { name: c.label, url: SITE + c.href }; }), [{ name: a.title, url: canonical }])
      .map(function (c, i) { return { '@type': 'ListItem', position: i + 1, name: c.name, item: c.url }; }) });
    // partage natif
    var sn = $('#shareNative');
    if (navigator.share) { sn.hidden = false; sn.addEventListener('click', function () { navigator.share({ title: a.title, text: a.chapo, url: location.href }).catch(function () {}); }); }

    // taille du texte
    var size = Number(store('aq-size')) || 0;
    function applySize() { document.documentElement.style.setProperty('--aq-article-size', (1.1875 + size * 0.125) + 'rem'); }
    applySize();
    $$('[data-size]').forEach(function (b) { b.addEventListener('click', function () { size = Math.max(-2, Math.min(3, size + Number(b.getAttribute('data-size')))); applySize(); store('aq-size', size); }); });
    // copier le lien
    $('#copyLink').addEventListener('click', function () {
      var done = function () { toast('Lien copié dans le presse-papiers'); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(location.href).then(done, fallback); else fallback();
      function fallback() { var t = document.createElement('textarea'); t.value = location.href; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); done(); } catch (e) { toast('Copiez l’adresse depuis la barre du navigateur'); } t.remove(); }
    });
    // barre de progression de lecture
    var bar = $('#progress'), prose = $('.aq-prose'), ticking = false;
    function progress() {
      var r = prose.getBoundingClientRect(), total = r.height - window.innerHeight * .5;
      var p = Math.min(1, Math.max(0, (-r.top + window.innerHeight * .3) / Math.max(total, 1)));
      bar.style.width = (p * 100) + '%'; ticking = false;
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(progress); } }, { passive: true });
    progress();
  }

  /* ===================== Page : portraits ===================== */
  function pagePortraits(main) {
    var list = byRub('portraits');
    document.title = 'Portraits — Afriquinfos'; setMeta(R.portraits.tagline);
    var regions = uniq(list.map(function (a) { return a.region; }).filter(Boolean));
    main.innerHTML = '<div class="aq-pagehero"><div class="container-xl">' + crumbs([{ label: 'Portraits' }]) + chapterHead('Portraits', R.portraits.tagline, null, null, 1) + '</div></div><div class="container-xl aq-page-head">' +
      '<div class="aq-filters" id="porFilters" role="group" aria-label="Filtrer par région"></div><div class="row g-4 mb-5" id="porGrid" aria-live="polite"></div></div>' + newsletterBlock();
    function draw(v) {
      var l = v === 'all' ? list : list.filter(function (a) { return a.region === v; });
      $('#porGrid').innerHTML = l.map(function (a) { return portraitCard(a, 'col-sm-6 col-lg-3 aq-fade'); }).join('');
    }
    filterChips($('#porFilters'), [{ value: 'all', label: 'Tous', count: list.length }].concat(regions.map(function (g) { return { value: g, label: G[g], count: list.filter(function (a) { return a.region === g; }).length }; })), 'all', draw);
    draw('all');
  }

  /* ===================== Page : agendas ===================== */
  function pageAgendas(main) {
    document.title = 'Agendas — Afriquinfos'; setMeta('Les rendez-vous politiques, économiques, culturels et sportifs du continent.');
    var nowDay = new Date().toISOString().slice(0, 10);
    var events = D.agenda.filter(function (e) { return (e.end || e.date) >= nowDay; }).sort(function (a, b) { return a.date.localeCompare(b.date); });
    var cats = uniq(events.map(function (e) { return e.cat; }));
    var fmtMonth = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    main.innerHTML = '<div class="container-xl aq-page-head">' + crumbs([{ label: 'Agendas' }]) + chapterHead('Agendas', 'Les rendez-vous à ne pas manquer sur le continent', null, null, 1) +
      '<div class="row g-5 mb-5"><div class="col-lg-8"><div class="aq-filters" id="agFilters" role="group" aria-label="Filtrer par thème"></div><div id="agList" aria-live="polite"></div></div>' +
      '<aside class="col-lg-4"><div class="aq-sticky"><div class="aq-side-box"><h2>Vous organisez un événement&nbsp;?</h2><p class="mb-3 aq-serif">Proposez-le à la rédaction pour figurer dans l’agenda.</p><a class="aq-btn aq-btn--primary" href="contact.html?sujet=agenda">Proposer un événement</a></div>' +
      '<p class="aq-demo">Maquette : événements et dates de démonstration.</p></div></aside></div></div>';
    function draw(v) {
      var l = v === 'all' ? events : events.filter(function (e) { return e.cat === v; });
      var html = '', month = '';
      l.forEach(function (e) {
        var m = fmtMonth.format(new Date(e.date + 'T00:00:00Z'));
        if (m !== month) { html += '<h2 class="aq-month">' + esc(m) + '</h2>'; month = m; }
        html += eventItem(e);
      });
      $('#agList').innerHTML = html || '<p class="aq-empty">Aucun événement à venir dans ce thème.</p>';
    }
    filterChips($('#agFilters'), [{ value: 'all', label: 'Tous', count: events.length }].concat(cats.map(function (c) { return { value: c, label: c, count: events.filter(function (e) { return e.cat === c; }).length }; })), 'all', draw);
    draw('all');
    bindAgendaButtons(main);
  }

  /* ===================== Page : recherche ===================== */
  function pageRecherche(main) {
    document.title = 'Recherche — Afriquinfos';
    var q0 = params.get('q') || '';
    main.innerHTML = '<div class="container-xl aq-page-head mb-5">' + crumbs([{ label: 'Recherche' }]) + '<h1 class="visually-hidden">Rechercher sur Afriquinfos</h1>' +
      '<form role="search" id="searchForm"><label class="visually-hidden" for="bigq">Rechercher sur Afriquinfos</label><div class="aq-bigsearch"><i class="bi bi-search" aria-hidden="true"></i>' +
      '<input id="bigq" name="q" type="search" autocomplete="off" placeholder="Un pays, un sujet, une personnalité…" value="' + esc(q0) + '"></div></form>' +
      '<p id="searchCount" class="fw-semibold" role="status"></p><div class="aq-filters" id="searchFilters" role="group" aria-label="Filtrer par rubrique"></div><div id="results"></div></div>';
    var input = $('#bigq'), rubFilter = 'all', timer;
    function norm(s) { return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
    function hl(text, terms) {
      var out = fr(text);
      terms.forEach(function (t) {
        if (t.length < 2) return;
        var re = new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
        out = out.replace(/(^|>)([^<]+)/g, function (m, p1, p2) { return p1 + p2.replace(re, '<mark>$1</mark>'); });
      });
      return out;
    }
    function run() {
      var q = input.value.trim(), terms = norm(q).split(/\s+/).filter(Boolean);
      history.replaceState(null, '', q ? 'recherche.html?q=' + encodeURIComponent(q) : 'recherche.html');
      var res = !terms.length ? sorted : sorted.filter(function (a) {
        var hay = norm([a.title, a.chapo, a.country, a.author, R[a.rub].label, a.region ? G[a.region] : '', a.tags.join(' '), a.body.join(' ')].join(' '));
        return terms.every(function (t) { return hay.indexOf(t) > -1; });
      });
      var rubs = uniq(res.map(function (a) { return a.rub; }));
      if (rubFilter !== 'all' && rubs.indexOf(rubFilter) < 0) rubFilter = 'all';
      var fc = $('#searchFilters');
      fc.innerHTML = res.length ? [{ value: 'all', label: 'Tout', count: res.length }].concat(rubs.map(function (r) { return { value: r, label: R[r].label, count: res.filter(function (a) { return a.rub === r; }).length }; }))
        .map(function (o) { return '<button type="button" data-value="' + o.value + '" aria-pressed="' + (o.value === rubFilter) + '">' + esc(o.label) + '<small>' + o.count + '</small></button>'; }).join('') : '';
      var shownList = rubFilter === 'all' ? res : res.filter(function (a) { return a.rub === rubFilter; });
      $('#searchCount').textContent = q ? res.length + ' résultat' + (res.length > 1 ? 's' : '') + ' pour « ' + q + ' »' : 'Toute l’actualité, de la plus récente à la plus ancienne';
      $('#results').innerHTML = shownList.length ? shownList.map(function (a) {
        return '<article class="aq-result aq-fade"><a href="' + urlArticle(a) + '">' + media(a) + '<div><span class="aq-card__place">' + fr(kicker(a, 'rub')) + '</span><h3>' + hl(a.title, terms) + '</h3><p>' + hl(a.chapo, terms) + '</p><time class="aq-card__meta">' + rel(a.date) + '</time></div></a></article>';
      }).join('') : '<div class="aq-empty"><h2>Aucun résultat</h2><p>Vérifiez l’orthographe ou essayez un mot plus général, par exemple un pays ou une rubrique&nbsp;: ' +
        ['Cameroun', 'Sahel', 'Climat', 'Football', 'Paiement mobile'].map(function (s) { return '<a class="aq-more" href="recherche.html?q=' + encodeURIComponent(s) + '" data-suggest>' + s + '</a>'; }).join(' ') + '</p></div>';
    }
    input.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(run, 180); });
    $('#searchForm').addEventListener('submit', function (e) { e.preventDefault(); run(); });
    $('#searchFilters').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; rubFilter = b.getAttribute('data-value'); run(); });
    main.addEventListener('click', function (e) { var s = e.target.closest('[data-suggest]'); if (!s) return; e.preventDefault(); input.value = s.textContent; run(); });
    run();
    if (!q0) input.focus();
  }

  /* ===================== Page : contact ===================== */
  function pageContact(main) {
    document.title = 'Contact — Afriquinfos'; setMeta('Contactez la rédaction ou la régie publicitaire d’Afriquinfos.');
    var subjects = { redaction: 'Écrire à la rédaction', publicite: 'Publicité et kit média', agenda: 'Proposer un événement', reponse: 'Droit de réponse', autre: 'Autre demande' };
    var pre = params.get('sujet');
    main.innerHTML = '<div class="container-xl aq-page-head">' + crumbs([{ label: 'Contact' }]) + chapterHead('Contact', 'Une information, une réaction, un projet ? Écrivez-nous.', null, null, 1) +
      '<div class="row g-5 mb-5"><div class="col-lg-7"><form id="contactForm" novalidate>' +
        '<div class="row g-3"><div class="col-md-6 aq-field"><label for="cName">Nom et prénom</label><input class="form-control" id="cName" name="name" autocomplete="name" required><div class="invalid-feedback">Indiquez votre nom.</div></div>' +
        '<div class="col-md-6 aq-field"><label for="cEmail">Adresse e-mail</label><input class="form-control" id="cEmail" name="email" type="email" autocomplete="email" required><div class="invalid-feedback">Saisissez une adresse e-mail valide, par exemple nom@domaine.com.</div></div></div>' +
        '<div class="aq-field"><label for="cSubject">Objet</label><select class="form-select" id="cSubject" name="subject" required><option value="">Choisissez un objet</option>' +
          Object.keys(subjects).map(function (k) { return '<option value="' + k + '"' + (k === pre ? ' selected' : '') + '>' + esc(subjects[k]) + '</option>'; }).join('') + '</select><div class="invalid-feedback">Choisissez l’objet de votre message.</div></div>' +
        '<div class="aq-field"><label for="cMsg">Message</label><textarea class="form-control" id="cMsg" name="message" rows="6" minlength="20" required></textarea><div class="invalid-feedback">Votre message doit contenir au moins 20 caractères.</div></div>' +
        '<div class="form-check aq-field"><input class="form-check-input" type="checkbox" id="cOk" required><label class="form-check-label fw-normal" for="cOk">J’accepte qu’Afriquinfos utilise ces informations pour me répondre.</label><div class="invalid-feedback">Cochez cette case pour envoyer votre message.</div></div>' +
        '<button class="aq-btn aq-btn--primary" type="submit">Envoyer le message</button><div id="contactDone" class="mt-4" role="status"></div></form></div>' +
      '<aside class="col-lg-5"><div class="aq-side-box"><h2>Rédaction</h2><p class="aq-serif">[Adresse de la rédaction]<br>[Téléphone]<br>[redaction@afriquinfos.com]</p></div>' +
        '<div class="aq-side-box"><h2>Régie publicitaire</h2><p class="aq-serif">[Nom du contact]<br>[pub@afriquinfos.com]</p></div>' +
        '<div class="aq-side-box"><h2>Suivez-nous</h2><div class="aq-social"><a href="https://www.facebook.com/afriquinfoscom/" aria-label="Afriquinfos sur Facebook" rel="noopener"><i class="bi bi-facebook" aria-hidden="true"></i></a><a href="https://x.com/AfriquinfosActu" aria-label="Afriquinfos sur X" rel="noopener"><i class="bi bi-twitter-x" aria-hidden="true"></i></a></div></div></aside></div></div>';
    var form = $('#contactForm');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      $$('input, select, textarea', form).forEach(function (f) {
        var valid = f.type === 'checkbox' ? f.checked : f.type === 'email' ? /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.value.trim()) : f.value.trim().length >= (f.minLength > 0 ? f.minLength : 1);
        f.classList.toggle('is-invalid', !valid);
        f.setAttribute('aria-invalid', String(!valid));
        if (!valid && ok) { f.focus(); ok = false; }
      });
      if (!ok) return;
      // À brancher sur votre serveur (endpoint d'envoi d'e-mail)
      $('#contactDone').innerHTML = '<div class="aq-success">Message envoyé à « ' + esc(subjects[$('#cSubject').value]) + ' ». Nous vous répondrons à ' + esc($('#cEmail').value) + '.</div>';
      form.reset();
      $$('.is-invalid', form).forEach(function (f) { f.classList.remove('is-invalid'); });
    });
    form.addEventListener('input', function (e) { if (e.target.classList.contains('is-invalid')) e.target.classList.remove('is-invalid'); });
  }

  /* ===================== Divers ===================== */
  function notFound(title, text) {
    return '<div class="container-xl aq-page-head"><div class="aq-empty"><h1>' + esc(title) + '</h1><p>' + esc(text) + '</p><p><a class="aq-btn aq-btn--primary" href="index.html">Revenir à l’accueil</a> <a class="aq-btn aq-btn--outline ms-2" href="recherche.html">Rechercher</a></p></div></div>';
  }
  var SITE = 'https://afriquinfos.com/';
  function setCanonical(href) {
    var l = $('link[rel="canonical"]');
    if (!l) { l = document.createElement('link'); l.rel = 'canonical'; document.head.appendChild(l); }
    l.href = href;
  }
  function setOg(map) {
    Object.keys(map).forEach(function (k) {
      var m = $('meta[property="' + k + '"]');
      if (!m) { m = document.createElement('meta'); m.setAttribute('property', k); document.head.appendChild(m); }
      m.content = map[k];
    });
  }
  function jsonLd(obj) { var el = document.createElement('script'); el.type = 'application/ld+json'; el.textContent = JSON.stringify(obj); document.head.appendChild(el); }
  function setMeta(text) {
    var m = $('meta[name="description"]');
    if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); }
    m.content = text;
    setOg({ 'og:description': text, 'og:title': document.title });
  }

  /* ===================== Démarrage ===================== */
  renderHeader();
  var main = $('#contenu');
  var pages = { home: pageHome, rubrique: pageRubrique, article: pageArticle, portraits: pagePortraits, agendas: pageAgendas, recherche: pageRecherche, contact: pageContact };
  if (pages[PAGE] && main) pages[PAGE](main);
  renderFooter();
  bindTheme(); bindFlash(); bindNewsletter(); bindRails();
  // flèches de défilement masquées quand tout tient à l'écran
  function checkRails() { $$('.aq-rail-x').forEach(function (r) { var nav = r.nextElementSibling; if (nav && nav.classList.contains('aq-rail-x__nav')) nav.hidden = r.scrollWidth <= r.clientWidth + 4; }); }
  checkRails(); window.addEventListener('resize', checkRails);
  // heures relatives à jour
  setInterval(function () { $$('time[datetime]').forEach(function (t) { if (/^il y a|à l’instant/.test(t.textContent)) t.textContent = rel(t.getAttribute('datetime')); }); }, 60000);
})();
