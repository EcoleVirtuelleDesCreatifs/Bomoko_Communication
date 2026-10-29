// Typographie française : espaces insécables avant la ponctuation double.
export function fr(s) {
    return String(s == null ? '' : s)
        .replace(/ ([:;?!%»])/g, ' $1')
        .replace(/« /g, '« ')
        .replace(/(\d+)e (édition|Cameroon)/g, '$1ᵉ $2');
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
