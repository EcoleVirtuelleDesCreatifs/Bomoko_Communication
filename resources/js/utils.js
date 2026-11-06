// Typographie française : espaces insécables avant la ponctuation double.
export function fr(s) {
    return String(s == null ? '' : s)
        .replace(/ ([:;?!%»])/g, ' $1')
        .replace(/« /g, '« ')
        .replace(/(\d+)e (édition|Cameroon)/g, '$1ᵉ $2');
}

// Corps d'article : échappe le HTML puis rend **texte** en gras et [texte](url) en lien.
export function inline(s) {
    return fr(String(s == null ? '' : s)
        .replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])))
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

export function initials(name) {
    return String(name || '?').split(/[\s,]+/).filter(Boolean).slice(0, 2)
        .map((p) => p.charAt(0).toUpperCase()).join('');
}

const fmtLong = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const fmtShort = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const fmtTime = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Abidjan' });
const fmtDayMonth = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', timeZone: 'Africa/Abidjan' });
const fmtDay = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', timeZone: 'UTC' });
const fmtMon = new Intl.DateTimeFormat('fr-FR', { month: 'short', timeZone: 'UTC' });
const fmtRange = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const fmtDayMon = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', timeZone: 'UTC' });
const fmtMonth = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' });

export const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
export const fmtLongDate = (iso) => cap(fmtLong.format(new Date(iso)));
export const todayLong = () => cap(new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Abidjan' }).format(new Date()));

function dayKey(d) { return d.toISOString().slice(0, 10); }

export function rel(iso) {
    const d = new Date(iso), min = (Date.now() - d.getTime()) / 60000;
    if (min < 1) return 'à l’instant';
    if (min < 60) return 'il y a ' + Math.round(min) + ' min';
    if (min < 1440) return 'il y a ' + Math.floor(min / 60) + ' h';
    const y = new Date(); y.setUTCDate(y.getUTCDate() - 1);
    if (dayKey(d) === dayKey(y)) return 'Hier, ' + fmtTime.format(d);
    if (min < 525600) return fmtDayMonth.format(d);
    return fmtShort.format(d);
}

export function eventRange(e) {
    const d = new Date(e.start_date + 'T00:00:00Z'), end = new Date((e.end_date || e.start_date) + 'T00:00:00Z');
    if (!e.end_date || e.end_date === e.start_date) return 'Le ' + fmtRange.format(d);
    if (e.start_date.slice(0, 7) === e.end_date.slice(0, 7)) return 'Du ' + fmtDay.format(d) + ' au ' + fmtRange.format(end);
    if (e.start_date.slice(0, 4) === e.end_date.slice(0, 4)) return 'Du ' + fmtDayMon.format(d) + ' au ' + fmtRange.format(end);
    return 'Du ' + fmtRange.format(d) + ' au ' + fmtRange.format(end);
}
export const evDay = (e) => fmtDay.format(new Date(e.start_date + 'T00:00:00Z'));
export const evMonth = (e) => fmtMon.format(new Date(e.start_date + 'T00:00:00Z')).replace('.', '');
export const evMonthLong = (e) => fmtMonth.format(new Date(e.start_date + 'T00:00:00Z'));

export function kicker(a, mode) {
    if (mode === 'rub') return a.rub_label + (a.country && a.rub !== 'opinion' ? ', ' + a.country : '');
    return a.country || a.rub_label;
}

export function store(k, v) {
    try {
        if (typeof localStorage === 'undefined') return null;
        if (v === undefined) return localStorage.getItem(k);
        localStorage.setItem(k, v);
    } catch (e) { return null; }
}

export const reduceMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function toast(text) {
    let t = document.querySelector('.aq-toast');
    if (!t) {
        t = document.createElement('div');
        t.className = 'aq-toast';
        t.setAttribute('role', 'status');
        document.body.appendChild(t);
    }
    t.textContent = text;
    t.classList.add('is-on');
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove('is-on'), 2500);
}

// Base URL des assets : suit APP_URL/ASSET_URL (meta injectée dans app.blade.php)
export function asset(p) {
    const base = (typeof document !== 'undefined' && document.querySelector('meta[name="asset-url"]')?.content) || '';
    return base + '/' + String(p).replace(/^\//, '');
}

export function createHomeMediaMotion(root, browser = typeof window !== 'undefined' ? window : null) {
    if (!root || !browser) return { refresh() {}, destroy() {} };
    const preference = browser.matchMedia('(prefers-reduced-motion: reduce)');
    const seen = new WeakSet(), pending = new Set(), waiting = new Map();
    let observer = null, destroyed = false;
    function clearWaiting(frame) {
        const entry = waiting.get(frame);
        if (!entry) return;
        entry.image.removeEventListener('load', entry.ready);
        entry.image.removeEventListener('error', entry.ready);
        waiting.delete(frame);
    }
    function reveal(frame) {
        clearWaiting(frame);
        frame.classList.remove('aq-home-media-pending');
        pending.delete(frame);
        seen.add(frame);
        observer?.unobserve(frame);
    }
    function stop() {
        observer?.disconnect(); observer = null;
        pending.forEach((frame) => { clearWaiting(frame); frame.classList.remove('aq-home-media-pending'); });
        pending.clear();
    }
    function refresh() {
        if (destroyed) return;
        if (preference.matches || typeof browser.IntersectionObserver !== 'function') { stop(); return; }
        if (!observer) observer = new browser.IntersectionObserver((entries, activeObserver) => {
            if (activeObserver && activeObserver !== observer) return;
            entries.forEach(({ target: frame, isIntersecting }) => {
                if (destroyed || preference.matches || !pending.has(frame) || !isIntersecting || waiting.has(frame)) return;
                const image = frame.querySelector('img');
                if (!image || image.complete) { reveal(frame); return; }
                const ready = () => reveal(frame);
                waiting.set(frame, { image, ready });
                image.addEventListener('load', ready);
                image.addEventListener('error', ready);
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -3% 0px' });
        pending.forEach((frame) => {
            if (root.contains(frame)) return;
            clearWaiting(frame); observer.unobserve(frame);
            frame.classList.remove('aq-home-media-pending'); pending.delete(frame);
        });
        root.querySelectorAll('.aq-media, .aq-slide__media, .aq-poster, .aq-portrait__visual').forEach((frame) => {
            if (seen.has(frame) || pending.has(frame) || frame.closest('.aq-slide') || !frame.querySelector('img')) return;
            const rect = frame.getBoundingClientRect();
            if (rect.top < browser.innerHeight && rect.bottom > 0 && rect.left < browser.innerWidth && rect.right > 0) { reveal(frame); return; }
            frame.classList.add('aq-home-media-pending'); pending.add(frame); observer.observe(frame);
        });
    }
    if (preference.addEventListener) preference.addEventListener('change', refresh);
    else preference.addListener(refresh);
    refresh();
    return {
        refresh,
        destroy() {
            destroyed = true; stop();
            if (preference.removeEventListener) preference.removeEventListener('change', refresh);
            else preference.removeListener(refresh);
        },
    };
}
