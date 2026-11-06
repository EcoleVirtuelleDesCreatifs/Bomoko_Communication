import { ref, mergeProps, unref, useSSRContext, createVNode, resolveDynamicComponent, withCtx, createTextVNode, toDisplayString, computed, onMounted, watch, onBeforeUnmount, openBlock, createBlock, Fragment, renderList, onUnmounted, createSSRApp, h } from "vue";
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrRenderDynamicModel, ssrRenderClass, ssrIncludeBooleanAttr, ssrRenderVNode, ssrRenderComponent, ssrRenderList, ssrRenderStyle, ssrLooseContain, ssrLooseEqual, ssrRenderSlot, renderToString } from "vue/server-renderer";
import { useForm, usePage, Link, router, createInertiaApp } from "@inertiajs/vue3";
import createServer from "@inertiajs/vue3/server";
function fr(s) {
  return String(s == null ? "" : s).replace(/ ([:;?!%»])/g, " $1").replace(/« /g, "« ").replace(/(\d+)e (édition|Cameroon)/g, "$1ᵉ $2");
}
function inline(s) {
  return fr(String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c])).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}
function initials(name) {
  return String(name || "?").split(/[\s,]+/).filter(Boolean).slice(0, 2).map((p) => p.charAt(0).toUpperCase()).join("");
}
const fmtLong = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const fmtShort = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const fmtTime = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Abidjan" });
const fmtDayMonth = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "Africa/Abidjan" });
const fmtDay = new Intl.DateTimeFormat("fr-FR", { day: "numeric", timeZone: "UTC" });
const fmtMon = new Intl.DateTimeFormat("fr-FR", { month: "short", timeZone: "UTC" });
const fmtRange = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const fmtDayMon = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", timeZone: "UTC" });
const fmtMonth = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" });
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const fmtLongDate = (iso) => cap(fmtLong.format(new Date(iso)));
const todayLong = () => cap(new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Abidjan" }).format(/* @__PURE__ */ new Date()));
function dayKey(d) {
  return d.toISOString().slice(0, 10);
}
function rel(iso) {
  const d = new Date(iso), min = (Date.now() - d.getTime()) / 6e4;
  if (min < 1) return "à l’instant";
  if (min < 60) return "il y a " + Math.round(min) + " min";
  if (min < 1440) return "il y a " + Math.floor(min / 60) + " h";
  const y = /* @__PURE__ */ new Date();
  y.setUTCDate(y.getUTCDate() - 1);
  if (dayKey(d) === dayKey(y)) return "Hier, " + fmtTime.format(d);
  if (min < 525600) return fmtDayMonth.format(d);
  return fmtShort.format(d);
}
function eventRange(e) {
  const d = /* @__PURE__ */ new Date(e.start_date + "T00:00:00Z"), end = /* @__PURE__ */ new Date((e.end_date || e.start_date) + "T00:00:00Z");
  if (!e.end_date || e.end_date === e.start_date) return "Le " + fmtRange.format(d);
  if (e.start_date.slice(0, 7) === e.end_date.slice(0, 7)) return "Du " + fmtDay.format(d) + " au " + fmtRange.format(end);
  if (e.start_date.slice(0, 4) === e.end_date.slice(0, 4)) return "Du " + fmtDayMon.format(d) + " au " + fmtRange.format(end);
  return "Du " + fmtRange.format(d) + " au " + fmtRange.format(end);
}
const evDay = (e) => fmtDay.format(/* @__PURE__ */ new Date(e.start_date + "T00:00:00Z"));
const evMonth = (e) => fmtMon.format(/* @__PURE__ */ new Date(e.start_date + "T00:00:00Z")).replace(".", "");
const evMonthLong = (e) => fmtMonth.format(/* @__PURE__ */ new Date(e.start_date + "T00:00:00Z"));
function kicker(a, mode) {
  if (mode === "rub") return a.rub_label + (a.country && a.rub !== "opinion" ? ", " + a.country : "");
  return a.country || a.rub_label;
}
function store(k, v) {
  try {
    if (typeof localStorage === "undefined") return null;
    if (v === void 0) return localStorage.getItem(k);
    localStorage.setItem(k, v);
  } catch (e) {
    return null;
  }
}
const reduceMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function norm(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}
function asset(p) {
  var _a;
  const base = typeof document !== "undefined" && ((_a = document.querySelector('meta[name="asset-url"]')) == null ? void 0 : _a.content) || "";
  return base + "/" + String(p).replace(/^\//, "");
}
const _sfc_main$j = {
  __name: "AcceptInvite",
  __ssrInlineRender: true,
  props: { email: String, name: String },
  setup(__props) {
    const form = useForm({ password: "", password_confirmation: "" });
    const show = ref(false);
    const page = usePage();
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: "ad-login",
        "aria-labelledby": "inviteTitle"
      }, _attrs))}><div class="ad-login__brand"><img${ssrRenderAttr("src", ((_a = unref(page).props.siteAssets) == null ? void 0 : _a["assets/img/logo-afriquinfos-negatif.png"]) || unref(asset)("assets/img/logo-afriquinfos-negatif.png"))} alt="Afriquinfos" width="320" height="114"><p class="ad-login__claim">Ni totems, ni tabous.</p><p class="ad-login__sub">Espace de rédaction et d’administration</p></div><div class="ad-login__panel"><form class="ad-login__form" novalidate><h1 id="inviteTitle">Bienvenue ${ssrInterpolate(__props.name)}</h1><p class="ad-muted">Définissez votre mot de passe pour activer votre compte (${ssrInterpolate(__props.email)}).</p><div class="ad-field"><label for="ivPass">Nouveau mot de passe</label><div class="ad-input-group"><input class="ad-input" id="ivPass"${ssrRenderAttr("type", show.value ? "text" : "password")} autocomplete="new-password"${ssrRenderDynamicModel(show.value ? "text" : "password", unref(form).password, null)}${ssrRenderAttr("aria-invalid", !!unref(form).errors.password)} required><button type="button" class="ad-iconbtn"${ssrRenderAttr("aria-label", show.value ? "Masquer" : "Afficher")}${ssrRenderAttr("aria-pressed", show.value)}><i class="${ssrRenderClass([show.value ? "bi-eye-slash" : "bi-eye", "bi"])}" aria-hidden="true"></i></button></div><p class="ad-error">${ssrInterpolate(unref(form).errors.password)}</p></div><div class="ad-field"><label for="ivPass2">Confirmer le mot de passe</label><input class="ad-input" id="ivPass2"${ssrRenderAttr("type", show.value ? "text" : "password")} autocomplete="new-password"${ssrRenderDynamicModel(show.value ? "text" : "password", unref(form).password_confirmation, null)} required></div><button class="ad-btn ad-btn--primary w-100" type="submit"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""}>Activer mon compte</button></form></div></section>`);
    };
  }
};
const _sfc_setup$j = _sfc_main$j.setup;
_sfc_main$j.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Admin/AcceptInvite.vue");
  return _sfc_setup$j ? _sfc_setup$j(props, ctx) : void 0;
};
const __vite_glob_0_0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _sfc_main$j
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$i = {
  __name: "Login",
  __ssrInlineRender: true,
  setup(__props) {
    const form = useForm({ email: "", password: "", remember: false });
    const show = ref(false);
    const page = usePage();
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: "ad-login",
        "aria-labelledby": "loginTitle"
      }, _attrs))}><div class="ad-login__brand"><img${ssrRenderAttr("src", ((_a = unref(page).props.siteAssets) == null ? void 0 : _a["assets/img/logo-afriquinfos-negatif.png"]) || unref(asset)("assets/img/logo-afriquinfos-negatif.png"))} alt="Afriquinfos" width="320" height="114"><p class="ad-login__claim">Ni totems, ni tabous.</p><p class="ad-login__sub">Espace de rédaction et d’administration</p></div><div class="ad-login__panel"><form class="ad-login__form" novalidate><h1 id="loginTitle">Connexion</h1><p class="ad-muted">Accès réservé à l’équipe d’Afriquinfos.</p><div class="ad-field"><label for="lgEmail">Adresse e-mail</label><input class="ad-input" id="lgEmail" type="email" autocomplete="username"${ssrRenderAttr("value", unref(form).email)}${ssrRenderAttr("aria-invalid", !!unref(form).errors.email)} required><p class="ad-error">${ssrInterpolate(unref(form).errors.email)}</p></div><div class="ad-field"><label for="lgPass">Mot de passe</label><div class="ad-input-group"><input class="ad-input" id="lgPass"${ssrRenderAttr("type", show.value ? "text" : "password")} autocomplete="current-password"${ssrRenderDynamicModel(show.value ? "text" : "password", unref(form).password, null)}${ssrRenderAttr("aria-invalid", !!unref(form).errors.password)} required><button type="button" class="ad-iconbtn"${ssrRenderAttr("aria-label", show.value ? "Masquer le mot de passe" : "Afficher le mot de passe")}${ssrRenderAttr("aria-pressed", show.value)}><i class="${ssrRenderClass([show.value ? "bi-eye-slash" : "bi-eye", "bi"])}" aria-hidden="true"></i></button></div><p class="ad-error">${ssrInterpolate(unref(form).errors.password)}</p></div><button class="ad-btn ad-btn--primary w-100" type="submit"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""}>Se connecter</button><p class="ad-demo-note">Compte de démonstration : awa.kone@afriquinfos.com / afriquinfos</p></form></div></section>`);
    };
  }
};
const _sfc_setup$i = _sfc_main$i.setup;
_sfc_main$i.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Admin/Login.vue");
  return _sfc_setup$i ? _sfc_setup$i(props, ctx) : void 0;
};
const __vite_glob_0_1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _sfc_main$i
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$h = {
  __name: "ChapterHead",
  __ssrInlineRender: true,
  props: {
    id: { type: String, default: "" },
    title: { type: String, required: true },
    tagline: { type: String, default: "" },
    href: { type: String, default: "" },
    more: { type: String, default: "Tout voir" },
    level: { type: Number, default: 2 }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<header${ssrRenderAttrs(mergeProps({ class: "aq-chapter__head" }, _attrs))}>`);
      ssrRenderVNode(_push, createVNode(resolveDynamicComponent("h" + __props.level), {
        class: "aq-chapter__title",
        id: __props.id ? "h-" + __props.id : null
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(__props.title)}`);
          } else {
            return [
              createTextVNode(toDisplayString(__props.title), 1)
            ];
          }
        }),
        _: 1
      }), _parent);
      _push(`<p class="aq-chapter__tagline">${ssrInterpolate(__props.tagline)}</p>`);
      if (__props.href) {
        _push(ssrRenderComponent(unref(Link), {
          class: "aq-more",
          href: __props.href
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(__props.more)}`);
            } else {
              return [
                createTextVNode(toDisplayString(__props.more), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</header>`);
    };
  }
};
const _sfc_setup$h = _sfc_main$h.setup;
_sfc_main$h.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/ChapterHead.vue");
  return _sfc_setup$h ? _sfc_setup$h(props, ctx) : void 0;
};
const _sfc_main$g = {
  __name: "Crumbs",
  __ssrInlineRender: true,
  props: { items: { type: Array, required: true } },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<nav${ssrRenderAttrs(mergeProps({ "aria-label": "Fil d’Ariane" }, _attrs))}><ol class="aq-crumbs"><li>`);
      _push(ssrRenderComponent(unref(Link), { href: "/" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Accueil`);
          } else {
            return [
              createTextVNode("Accueil")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><!--[-->`);
      ssrRenderList(__props.items, (it, i) => {
        _push(`<li>`);
        if (it.href && i < __props.items.length - 1) {
          _push(ssrRenderComponent(unref(Link), {
            href: it.href
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(it.label)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(it.label), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        } else {
          _push(`<span aria-current="page">${ssrInterpolate(it.label)}</span>`);
        }
        _push(`</li>`);
      });
      _push(`<!--]--></ol></nav>`);
    };
  }
};
const _sfc_setup$g = _sfc_main$g.setup;
_sfc_main$g.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/Crumbs.vue");
  return _sfc_setup$g ? _sfc_setup$g(props, ctx) : void 0;
};
const _sfc_main$f = {
  __name: "EventItem",
  __ssrInlineRender: true,
  props: { e: { type: Object, required: true } },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<article${ssrRenderAttrs(mergeProps({ class: "aq-event" }, _attrs))}><div class="aq-event__date" aria-hidden="true"><span class="aq-event__day">${ssrInterpolate(unref(evDay)(__props.e))}</span><span class="aq-event__month">${ssrInterpolate(unref(evMonth)(__props.e))}</span></div><div><span class="aq-event__cat">${ssrInterpolate(__props.e.cat)}</span><h3 class="aq-event__title">${ssrInterpolate(unref(fr)(__props.e.title))}</h3><p class="aq-event__where"><i class="bi bi-geo-alt" aria-hidden="true"></i> ${ssrInterpolate(__props.e.city)}, ${ssrInterpolate(__props.e.country)} — ${ssrInterpolate(unref(eventRange)(__props.e))}</p><p class="aq-event__desc">${ssrInterpolate(unref(fr)(__props.e.desc))}</p><button type="button" class="aq-linkbtn"${ssrRenderAttr("aria-label", "Ajouter « " + __props.e.title + " » à mon agenda")}><i class="bi bi-calendar-plus" aria-hidden="true"></i>Ajouter à mon agenda</button></div></article>`);
    };
  }
};
const _sfc_setup$f = _sfc_main$f.setup;
_sfc_main$f.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/EventItem.vue");
  return _sfc_setup$f ? _sfc_setup$f(props, ctx) : void 0;
};
const _sfc_main$e = {
  __name: "Agendas",
  __ssrInlineRender: true,
  props: { events: { type: Array, default: () => [] } },
  setup(__props) {
    const props = __props;
    const cats = computed(() => [...new Set(props.events.map((e) => e.cat).filter(Boolean))]);
    const filter = ref("all");
    const list = computed(() => filter.value === "all" ? props.events : props.events.filter((e) => e.cat === filter.value));
    const grouped = computed(() => {
      const out = [];
      let month = null;
      list.value.forEach((e) => {
        const m = evMonthLong(e);
        if (m !== month) {
          out.push({ month: m, events: [e] });
          month = m;
        } else out[out.length - 1].events.push(e);
      });
      return out;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-xl aq-page-head" }, _attrs))}>`);
      _push(ssrRenderComponent(_sfc_main$g, { items: [{ label: "Agendas" }] }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$h, {
        title: "Agendas",
        tagline: "Les rendez-vous à ne pas manquer sur le continent",
        level: 1
      }, null, _parent));
      _push(`<div class="row g-5 mb-5"><div class="col-lg-8"><div class="aq-filters" role="group" aria-label="Filtrer par thème"><button type="button"${ssrRenderAttr("aria-pressed", filter.value === "all")}>Tous<small>${ssrInterpolate(__props.events.length)}</small></button><!--[-->`);
      ssrRenderList(cats.value, (c) => {
        _push(`<button type="button"${ssrRenderAttr("aria-pressed", filter.value === c)}>${ssrInterpolate(c)}<small>${ssrInterpolate(__props.events.filter((e) => e.cat === c).length)}</small></button>`);
      });
      _push(`<!--]--></div><div aria-live="polite"><!--[-->`);
      ssrRenderList(grouped.value, (g) => {
        _push(`<!--[--><h2 class="aq-month">${ssrInterpolate(g.month)}</h2><!--[-->`);
        ssrRenderList(g.events, (e) => {
          _push(ssrRenderComponent(_sfc_main$f, {
            key: e.slug,
            e
          }, null, _parent));
        });
        _push(`<!--]--><!--]-->`);
      });
      _push(`<!--]-->`);
      if (!grouped.value.length) {
        _push(`<p class="aq-empty">Aucun événement à venir dans ce thème.</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><aside class="col-lg-4"><div class="aq-sticky"><div class="aq-side-box"><h2>Vous organisez un événement ?</h2><p class="mb-3 aq-serif">Proposez-le à la rédaction pour figurer dans l’agenda.</p>`);
      _push(ssrRenderComponent(unref(Link), {
        class: "aq-btn aq-btn--primary",
        href: "/contact?sujet=agenda"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Proposer un événement`);
          } else {
            return [
              createTextVNode("Proposer un événement")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></aside></div></div>`);
    };
  }
};
const _sfc_setup$e = _sfc_main$e.setup;
_sfc_main$e.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Agendas.vue");
  return _sfc_setup$e ? _sfc_setup$e(props, ctx) : void 0;
};
const __vite_glob_0_2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _sfc_main$e
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$d = {
  __name: "AqAd",
  __ssrInlineRender: true,
  props: {
    slot: { type: String, required: true },
    variant: { type: String, default: "pave" }
  },
  setup(__props) {
    const props = __props;
    const el = ref(null);
    const page = usePage();
    const ad = computed(() => (page.props.ads || []).find((a) => a.slot === props.slot));
    let observer = null;
    function xsrf() {
      return decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || "");
    }
    function track(type) {
      var _a;
      if (!((_a = ad.value) == null ? void 0 : _a.id)) return;
      fetch("/ad-event", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest", "X-XSRF-TOKEN": xsrf() },
        body: JSON.stringify({ ad: ad.value.id, slot: props.slot, type }),
        credentials: "same-origin",
        keepalive: true
      }).catch(() => {
      });
    }
    const seen = /* @__PURE__ */ new Set();
    function observe() {
      observer == null ? void 0 : observer.disconnect();
      if (!ad.value || !el.value || seen.has(ad.value.id) || !("IntersectionObserver" in window)) return;
      observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && entries[0].intersectionRatio >= 0.5) {
          seen.add(ad.value.id);
          track("imp");
          observer.disconnect();
        }
      }, { threshold: 0.5 });
      observer.observe(el.value);
    }
    onMounted(observe);
    watch(() => {
      var _a;
      return (_a = ad.value) == null ? void 0 : _a.id;
    }, observe, { flush: "post" });
    onBeforeUnmount(() => observer == null ? void 0 : observer.disconnect());
    return (_ctx, _push, _parent, _attrs) => {
      if (ad.value) {
        _push(`<div${ssrRenderAttrs(mergeProps({
          ref_key: "el",
          ref: el,
          class: ["aq-ad", "aq-ad--" + __props.variant],
          role: "complementary",
          "aria-label": "Publicité",
          style: __props.variant === "mobile" ? "overflow:hidden;text-align:center;background:#0d0d0f" : null
        }, _attrs))}><span style="${ssrRenderStyle(__props.variant === "mobile" ? "display:block;padding:.3rem .6rem .15rem;font-size:.5625rem;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.55);text-align:right" : null)}">Publicité</span>`);
        if (ad.value.url) {
          _push(`<a class="aq-ad__link"${ssrRenderAttr("href", ad.value.url)} target="_blank" rel="noopener sponsored">`);
          if (ad.value.visual) {
            _push(`<img${ssrRenderAttr("src", ad.value.visual)}${ssrRenderAttr("alt", ad.value.advertiser)} loading="lazy" style="${ssrRenderStyle(__props.variant === "mobile" ? "display:block;width:100%;max-width:100%;height:auto;max-height:100px;object-fit:contain;margin:0 auto" : null)}">`);
          } else {
            _push(`<span class="aq-ad__text"><strong>${ssrInterpolate(ad.value.advertiser)}</strong>`);
            if (ad.value.name) {
              _push(`<small>${ssrInterpolate(ad.value.name)}</small>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</span>`);
          }
          _push(`</a>`);
        } else {
          _push(`<span class="aq-ad__text">`);
          if (ad.value.visual) {
            _push(`<img${ssrRenderAttr("src", ad.value.visual)}${ssrRenderAttr("alt", ad.value.advertiser)} loading="lazy" style="${ssrRenderStyle(__props.variant === "mobile" ? "display:block;width:100%;max-width:100%;height:auto;max-height:100px;object-fit:contain;margin:0 auto" : null)}">`);
          } else {
            _push(`<strong>${ssrInterpolate(ad.value.advertiser)}</strong>`);
          }
          if (!ad.value.visual && ad.value.name) {
            _push(`<small>${ssrInterpolate(ad.value.name)}</small>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</span>`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
};
const _sfc_setup$d = _sfc_main$d.setup;
_sfc_main$d.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/AqAd.vue");
  return _sfc_setup$d ? _sfc_setup$d(props, ctx) : void 0;
};
const _sfc_main$c = {
  __name: "AqMedia",
  __ssrInlineRender: true,
  props: {
    a: { type: Object, required: true },
    alt: { type: Boolean, default: false },
    priority: { type: Boolean, default: false },
    sizes: { type: String, default: "(min-width: 992px) 50vw, 100vw" }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.a.src) {
        _push(`<img${ssrRenderAttrs(mergeProps({
          src: __props.a.src,
          alt: __props.alt ? __props.a.img : "",
          width: "1200",
          height: "750",
          decoding: "async",
          fetchpriority: __props.priority ? "high" : null,
          loading: __props.priority ? null : "lazy"
        }, _attrs))}>`);
      } else {
        _push(`<div${ssrRenderAttrs(mergeProps({
          class: ["aq-ph", "aq-ph--" + __props.a.ph],
          role: __props.alt ? "img" : null,
          "aria-label": __props.alt ? "Photo : " + __props.a.img : null,
          "aria-hidden": __props.alt ? null : "true"
        }, _attrs))}>`);
        if (__props.a.person) {
          _push(`<span class="aq-ph__initials" aria-hidden="true">${ssrInterpolate(__props.a.person.initials)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
    };
  }
};
const _sfc_setup$c = _sfc_main$c.setup;
_sfc_main$c.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/AqMedia.vue");
  return _sfc_setup$c ? _sfc_setup$c(props, ctx) : void 0;
};
const _sfc_main$b = {
  __name: "ArticleCard",
  __ssrInlineRender: true,
  props: {
    a: { type: Object, required: true },
    h: { type: Boolean, default: false },
    col: { type: String, default: "" },
    kickerMode: { type: String, default: null }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<article${ssrRenderAttrs(mergeProps({
        class: ["aq-card", [__props.h ? "aq-card--h" : "", __props.col]]
      }, _attrs))}>`);
      _push(ssrRenderComponent(unref(Link), {
        href: __props.a.url
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="aq-media aq-media--cut"${_scopeId}>`);
            _push2(ssrRenderComponent(_sfc_main$c, { a: __props.a }, null, _parent2, _scopeId));
            _push2(`</div><div${_scopeId}><span class="aq-card__place"${_scopeId}>${ssrInterpolate(unref(fr)(unref(kicker)(__props.a, __props.kickerMode)))}</span><h3 class="aq-card__title"${_scopeId}>${ssrInterpolate(unref(fr)(__props.a.title))}</h3><time class="aq-card__meta"${ssrRenderAttr("datetime", __props.a.date)}${_scopeId}>${ssrInterpolate(unref(rel)(__props.a.date))}</time></div>`);
          } else {
            return [
              createVNode("div", { class: "aq-media aq-media--cut" }, [
                createVNode(_sfc_main$c, { a: __props.a }, null, 8, ["a"])
              ]),
              createVNode("div", null, [
                createVNode("span", { class: "aq-card__place" }, toDisplayString(unref(fr)(unref(kicker)(__props.a, __props.kickerMode))), 1),
                createVNode("h3", { class: "aq-card__title" }, toDisplayString(unref(fr)(__props.a.title)), 1),
                createVNode("time", {
                  class: "aq-card__meta",
                  datetime: __props.a.date
                }, toDisplayString(unref(rel)(__props.a.date)), 9, ["datetime"])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</article>`);
    };
  }
};
const _sfc_setup$b = _sfc_main$b.setup;
_sfc_main$b.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/ArticleCard.vue");
  return _sfc_setup$b ? _sfc_setup$b(props, ctx) : void 0;
};
const _sfc_main$a = {
  __name: "Newsletter",
  __ssrInlineRender: true,
  setup(__props) {
    const page = usePage();
    const form = useForm({ email: "" });
    const localMsg = ref("");
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      _push(`<section${ssrRenderAttrs(mergeProps({
        class: "aq-newsletter aq-below",
        id: "newsletter",
        "aria-labelledby": "h-nl"
      }, _attrs))}><div class="container-xl"><div class="aq-newsletter__box"><div><h2 id="h-nl">Le brief panafricain, chaque matin</h2><p>L’essentiel de l’actualité du continent, sans totems ni tabous. Gratuit, désinscription en un clic.</p></div><form class="aq-form" novalidate><label for="nlEmail" class="visually-hidden">Adresse e-mail</label><div class="aq-form__row"><input type="email" class="form-control" id="nlEmail"${ssrRenderAttr("value", unref(form).email)} placeholder="votre@email.com" autocomplete="email" required aria-describedby="nlMsg"><button class="aq-btn aq-btn--ink" type="submit"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""}>S’inscrire</button></div><p class="aq-form__msg" id="nlMsg" role="status">${ssrInterpolate(unref(form).errors.email || localMsg.value || ((_a = unref(page).props.flash) == null ? void 0 : _a.newsletter))}</p></form></div></div></section>`);
    };
  }
};
const _sfc_setup$a = _sfc_main$a.setup;
_sfc_main$a.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/Newsletter.vue");
  return _sfc_setup$a ? _sfc_setup$a(props, ctx) : void 0;
};
const IMG_STYLE = "display:block;width:auto;max-width:100%;height:auto;max-height:420px;object-fit:contain;margin:0 auto";
const _sfc_main$9 = {
  __name: "Article",
  __ssrInlineRender: true,
  props: {
    article: { type: Object, required: true },
    newer: { type: Object, default: null },
    older: { type: Object, default: null },
    related: { type: Array, default: () => [] },
    sameRegion: { type: Array, default: () => [] },
    top: { type: Array, default: () => [] },
    comments: { type: Array, default: () => [] }
  },
  setup(__props) {
    const props = __props;
    const a = props.article;
    const urlRub = (r) => r === "portraits" ? "/portraits" : "/rubrique/" + r;
    const crumb = computed(() => {
      const items = [{ label: a.rub_label, href: urlRub(a.rub) }];
      if (a.region) items.push({ label: a.region_label, href: "/afriques/" + a.region });
      items.push({ label: a.title.length > 48 ? a.title.slice(0, 46) + "…" : a.title });
      return items;
    });
    const stripFonts = (html) => html.replace(/<\/?font\b[^>]*>/gi, "").replace(/\sface="[^"]*"/gi, "").replace(/style="([^"]*)"/gi, (m, s) => {
      s = s.replace(/font-family:[^;]+;?/gi, "").replace(/font:[^;]+;?/gi, "");
      return s.trim() ? ` style="${s}"` : "";
    });
    const fitImgs = (html) => stripFonts(html).replace(/<img\b([^>]*?)>/gi, (tag, attrs) => {
      const clean = attrs.replace(/\sstyle="[^"]*"/gi, "").replace(/\swidth="[^"]*"/gi, "").replace(/\sheight="[^"]*"/gi, "");
      return `<img${clean} style="${IMG_STYLE}">`;
    });
    const blocks = computed(() => (a.body || []).map((b) => {
      if (b.trimStart().startsWith("<")) return { t: "html", x: fitImgs(b) };
      if (b.startsWith("## ")) return { t: "h2", x: b.slice(3) };
      if (b.startsWith("> ")) return { t: "quote", x: b.slice(2) };
      const img = b.match(/^\[img:([^\]|]+)\|?([^\]]*)\]$/);
      if (img) return { t: "img", src: img[1], cap: img[2] };
      return { t: "p", x: b };
    }));
    const shareUrl = computed(() => encodeURIComponent(a.url));
    const shareText = computed(() => encodeURIComponent(a.title));
    const canShareNative = ref(false);
    function normalizeReadingSize(value) {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? Math.max(-2, Math.min(3, Math.trunc(parsed))) : 0;
    }
    const size = ref(0);
    function applySize() {
      document.documentElement.style.setProperty("--aq-article-size-adjustment", size.value * 0.125 + "rem");
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
          bar.value.style.width = p * 100 + "%";
        }
        ticking = false;
      });
    }
    onMounted(() => {
      canShareNative.value = !!navigator.share;
      size.value = normalizeReadingSize(store("aq-size"));
      applySize();
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    });
    onBeforeUnmount(() => {
      window.removeEventListener("scroll", onScroll);
      document.documentElement.style.removeProperty("--aq-article-size-adjustment");
    });
    const page = usePage();
    const cform = useForm({ author: "", email: "", text: "", website: "" });
    const flashMsg = computed(() => {
      var _a;
      return (_a = page.props.flash) == null ? void 0 : _a.success;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[--><div class="aq-progress" aria-hidden="true"></div><article class="aq-article" itemscope itemtype="https://schema.org/NewsArticle"><div class="container-xl">`);
      _push(ssrRenderComponent(_sfc_main$g, { items: crumb.value }, null, _parent));
      _push(`<div class="row g-5"><div class="col-lg-8">`);
      _push(ssrRenderComponent(unref(Link), {
        class: "aq-tag",
        href: urlRub(unref(a).rub)
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(a).rub_label)}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(a).rub_label), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<h1 class="aq-article__title" itemprop="headline">${ssrInterpolate(unref(fr)(unref(a).title))}</h1><p class="aq-article__chapo" itemprop="description">${ssrInterpolate(unref(fr)(unref(a).chapo))}</p><div class="aq-article__bar"><div class="aq-byline"><span class="aq-avatar" aria-hidden="true">${ssrInterpolate(unref(initials)(unref(a).author))}</span><div><strong itemprop="author">Par ${ssrInterpolate(unref(a).author)}</strong><time${ssrRenderAttr("datetime", unref(a).date)} itemprop="datePublished">${ssrInterpolate(unref(fmtLongDate)(unref(a).date))}</time>, ${ssrInterpolate(unref(a).read)} min de lecture</div></div><div class="aq-tools"><button class="aq-icon" type="button" aria-label="Réduire la taille du texte"${ssrIncludeBooleanAttr(size.value <= -2) ? " disabled" : ""}><span class="aq-tools__size">A-</span></button><button class="aq-icon" type="button" aria-label="Agrandir la taille du texte"${ssrIncludeBooleanAttr(size.value >= 3) ? " disabled" : ""}><span class="aq-tools__size">A+</span></button><span class="aq-tools__sep" aria-hidden="true"></span><a class="aq-icon"${ssrRenderAttr("href", "https://www.facebook.com/sharer/sharer.php?u=" + shareUrl.value)} target="_blank" rel="noopener" aria-label="Partager sur Facebook"><i class="bi bi-facebook" aria-hidden="true"></i></a><a class="aq-icon"${ssrRenderAttr("href", "https://x.com/intent/post?url=" + shareUrl.value + "&text=" + shareText.value)} target="_blank" rel="noopener" aria-label="Partager sur X"><i class="bi bi-twitter-x" aria-hidden="true"></i></a><a class="aq-icon"${ssrRenderAttr("href", "https://www.linkedin.com/sharing/share-offsite/?url=" + shareUrl.value)} target="_blank" rel="noopener" aria-label="Partager sur LinkedIn"><i class="bi bi-linkedin" aria-hidden="true"></i></a><a class="aq-icon"${ssrRenderAttr("href", "https://wa.me/?text=" + shareText.value + "%20" + shareUrl.value)} target="_blank" rel="noopener" aria-label="Partager sur WhatsApp"><i class="bi bi-whatsapp" aria-hidden="true"></i></a><button class="aq-icon" type="button" aria-label="Copier le lien"><i class="bi bi-link-45deg" aria-hidden="true"></i></button>`);
      if (canShareNative.value) {
        _push(`<button class="aq-btn aq-btn--ink aq-share-native" type="button"><i class="bi bi-share" aria-hidden="true"></i>Partager</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      if (unref(a).person) {
        _push(`<div class="aq-fiche"><div class="aq-fiche__mono" aria-hidden="true">${ssrInterpolate(unref(a).person.initials)}</div><dl><div><dt>Nom</dt><dd>${ssrInterpolate(unref(a).person.name)}</dd></div><div><dt>Activité</dt><dd>${ssrInterpolate(unref(a).person.role)}</dd></div><div><dt>Ville</dt><dd>${ssrInterpolate(unref(a).person.city)}, ${ssrInterpolate(unref(a).country)}</dd></div><div><dt>Domaine</dt><dd>${ssrInterpolate(unref(a).person.field)}</dd></div><div><dt>En activité depuis</dt><dd>${ssrInterpolate(unref(a).person.since)}</dd></div></dl></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<figure class="aq-figure"><div class="aq-media aq-media--cut">`);
      _push(ssrRenderComponent(_sfc_main$c, {
        a: unref(a),
        alt: true,
        priority: true,
        sizes: "(min-width: 992px) 760px, 100vw"
      }, null, _parent));
      _push(`</div><figcaption>${ssrInterpolate(unref(fr)(unref(a).img))}`);
      if (!unref(a).src) {
        _push(`<!--[-->. Photo de démonstration.<!--]-->`);
      } else {
        _push(`<!---->`);
      }
      _push(`</figcaption></figure><div class="aq-prose" itemprop="articleBody"><!--[-->`);
      ssrRenderList(blocks.value, (b, i) => {
        _push(`<!--[-->`);
        if (b.t === "h2") {
          _push(`<h2>${unref(inline)(b.x) ?? ""}</h2>`);
        } else if (b.t === "quote") {
          _push(`<blockquote>${unref(inline)(b.x) ?? ""}</blockquote>`);
        } else if (b.t === "html") {
          _push(`<div class="aq-legacy">${b.x ?? ""}</div>`);
        } else if (b.t === "img") {
          _push(`<figure class="aq-figure aq-figure--body"><img${ssrRenderAttr("src", /^(https?:|data:)/.test(b.src) ? b.src : unref(asset)("storage/" + b.src))}${ssrRenderAttr("alt", b.cap)} loading="lazy" style="${ssrRenderStyle(IMG_STYLE)}">`);
          if (b.cap) {
            _push(`<figcaption>${ssrInterpolate(unref(fr)(b.cap))}</figcaption>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</figure>`);
        } else {
          _push(`<p>${unref(inline)(b.x) ?? ""}</p>`);
        }
        _push(`<!--]-->`);
      });
      _push(`<!--]--></div><div class="aq-tags" aria-label="Mots-clés"><!--[-->`);
      ssrRenderList(unref(a).tags, (t) => {
        _push(ssrRenderComponent(unref(Link), {
          key: t,
          href: "/recherche?q=" + encodeURIComponent(t)
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(t)}`);
            } else {
              return [
                createTextVNode(toDisplayString(t), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></div><div class="aq-author"><span class="aq-avatar" aria-hidden="true">${ssrInterpolate(unref(initials)(unref(a).author))}</span><p><strong>${ssrInterpolate(unref(a).author)}</strong><br>${ssrInterpolate(unref(a).rub === "opinion" ? "Les tribunes publiées n’engagent que leurs auteurs." : "Journaliste à la rédaction d’Afriquinfos.")}</p></div><section class="aq-comments" aria-labelledby="hComments"><h2 id="hComments">Commentaires `);
      if (__props.comments.length) {
        _push(`<small>(${ssrInterpolate(__props.comments.length)})</small>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</h2>`);
      if (flashMsg.value) {
        _push(`<div class="aq-success" role="status">${ssrInterpolate(flashMsg.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (__props.comments.length) {
        _push(`<ol class="aq-comments__list"><!--[-->`);
        ssrRenderList(__props.comments, (c, i) => {
          _push(`<li class="aq-comment"><span class="aq-avatar" aria-hidden="true">${ssrInterpolate(unref(initials)(c.author))}</span><div><strong>${ssrInterpolate(c.author)}</strong><time class="aq-comment__date">${ssrInterpolate(unref(rel)(c.date))}</time><p>${ssrInterpolate(unref(fr)(c.text))}</p>`);
          if (c.reply) {
            _push(`<div class="aq-comment__reply"><strong>Réponse de la rédaction</strong><p>${ssrInterpolate(unref(fr)(c.reply))}</p></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></li>`);
        });
        _push(`<!--]--></ol>`);
      } else {
        _push(`<p class="aq-comment__empty">Soyez le premier à commenter cet article.</p>`);
      }
      _push(`<form class="aq-cform" novalidate><div class="row g-3"><div class="col-md-6"><label class="form-label" for="cAuthor">Nom ou pseudo</label><input class="form-control" id="cAuthor"${ssrRenderAttr("value", unref(cform).author)} maxlength="120" autocomplete="name" required>`);
      if (unref(cform).errors.author) {
        _push(`<p class="aq-err">${ssrInterpolate(unref(cform).errors.author)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="col-md-6"><label class="form-label" for="cEmail">E-mail <small class="text-body-secondary">(jamais publié)</small></label><input class="form-control" id="cEmail" type="email"${ssrRenderAttr("value", unref(cform).email)} maxlength="160" autocomplete="email" required>`);
      if (unref(cform).errors.email) {
        _push(`<p class="aq-err">${ssrInterpolate(unref(cform).errors.email)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><label class="visually-hidden" for="cWeb">Ne pas remplir</label><input class="aq-hp" id="cWeb"${ssrRenderAttr("value", unref(cform).website)} tabindex="-1" autocomplete="off" aria-hidden="true"><label class="form-label mt-3" for="cText">Votre commentaire</label><textarea class="form-control" id="cText" rows="4" maxlength="2000" required placeholder="Votre avis, votre analyse, votre question…">${ssrInterpolate(unref(cform).text)}</textarea>`);
      if (unref(cform).errors.text) {
        _push(`<p class="aq-err">${ssrInterpolate(unref(cform).errors.text)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button class="aq-btn aq-btn--primary mt-3" type="submit"${ssrIncludeBooleanAttr(unref(cform).processing) ? " disabled" : ""}>${ssrInterpolate(unref(cform).processing ? "Envoi…" : "Publier mon commentaire")}</button></form></section><nav class="aq-prevnext" aria-label="Articles de la même rubrique">`);
      if (__props.older) {
        _push(ssrRenderComponent(unref(Link), {
          href: __props.older.url
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<small${_scopeId}><i class="bi bi-arrow-left" aria-hidden="true"${_scopeId}></i> Article précédent</small><strong${_scopeId}>${ssrInterpolate(unref(fr)(__props.older.title))}</strong>`);
            } else {
              return [
                createVNode("small", null, [
                  createVNode("i", {
                    class: "bi bi-arrow-left",
                    "aria-hidden": "true"
                  }),
                  createTextVNode(" Article précédent")
                ]),
                createVNode("strong", null, toDisplayString(unref(fr)(__props.older.title)), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<span></span>`);
      }
      if (__props.newer) {
        _push(ssrRenderComponent(unref(Link), {
          class: "is-next",
          href: __props.newer.url
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<small${_scopeId}>Article suivant <i class="bi bi-arrow-right" aria-hidden="true"${_scopeId}></i></small><strong${_scopeId}>${ssrInterpolate(unref(fr)(__props.newer.title))}</strong>`);
            } else {
              return [
                createVNode("small", null, [
                  createTextVNode("Article suivant "),
                  createVNode("i", {
                    class: "bi bi-arrow-right",
                    "aria-hidden": "true"
                  })
                ]),
                createVNode("strong", null, toDisplayString(unref(fr)(__props.newer.title)), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</nav></div><aside class="col-lg-4"><div class="aq-sticky"><div class="aq-side-box"><h2>À lire aussi</h2><!--[-->`);
      ssrRenderList(__props.related, (x) => {
        _push(ssrRenderComponent(unref(Link), {
          key: x.id,
          class: "aq-stack__item",
          href: x.url
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="aq-card__place"${_scopeId}>${ssrInterpolate(unref(fr)(unref(kicker)(x)))}</span><h3${_scopeId}>${ssrInterpolate(unref(fr)(x.title))}</h3>`);
            } else {
              return [
                createVNode("span", { class: "aq-card__place" }, toDisplayString(unref(fr)(unref(kicker)(x))), 1),
                createVNode("h3", null, toDisplayString(unref(fr)(x.title)), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></div><div class="aq-side-box"><h2>Les plus lus</h2><ol class="aq-top5"><!--[-->`);
      ssrRenderList(__props.top, (x) => {
        _push(`<li>`);
        _push(ssrRenderComponent(unref(Link), {
          href: x.url
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span${_scopeId}>${ssrInterpolate(unref(fr)(x.title))}</span>`);
            } else {
              return [
                createVNode("span", null, toDisplayString(unref(fr)(x.title)), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</li>`);
      });
      _push(`<!--]--></ol></div>`);
      _push(ssrRenderComponent(_sfc_main$d, {
        slot: "pave",
        variant: "pave"
      }, null, _parent));
      _push(`</div></aside></div></div></article>`);
      if (__props.sameRegion.length) {
        _push(`<section class="aq-section aq-section--related aq-below" aria-label="Dans la même région"><div class="container-xl">`);
        _push(ssrRenderComponent(_sfc_main$h, {
          title: unref(a).region_label,
          tagline: "Dans la même région",
          href: "/afriques/" + unref(a).region,
          more: "Toute la région"
        }, null, _parent));
        _push(`<div class="row g-4"><!--[-->`);
        ssrRenderList(__props.sameRegion, (x) => {
          _push(ssrRenderComponent(_sfc_main$b, {
            key: x.id,
            a: x,
            col: "col-md-4",
            "kicker-mode": "rub"
          }, null, _parent));
        });
        _push(`<!--]--></div></div></section>`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_sfc_main$a, null, null, _parent));
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Article.vue");
  return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
const __vite_glob_0_3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _sfc_main$9
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$8 = {
  __name: "Contact",
  __ssrInlineRender: true,
  props: { sujet: { type: String, default: "" } },
  setup(__props) {
    const props = __props;
    const page = usePage();
    const subjects = {
      redaction: "Écrire à la rédaction",
      publicite: "Publicité et kit média",
      agenda: "Proposer un événement",
      reponse: "Droit de réponse",
      autre: "Autre demande"
    };
    const form = useForm({
      name: "",
      email: "",
      subject: props.sujet || "",
      message: "",
      consent: false
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-xl aq-page-head" }, _attrs))}>`);
      _push(ssrRenderComponent(_sfc_main$g, { items: [{ label: "Contact" }] }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$h, {
        title: "Contact",
        tagline: "Une information, une réaction, un projet ? Écrivez-nous.",
        level: 1
      }, null, _parent));
      _push(`<div class="row g-5 mb-5"><div class="col-lg-7"><form novalidate><div class="row g-3"><div class="col-md-6 aq-field"><label for="cName">Nom et prénom</label><input id="cName"${ssrRenderAttr("value", unref(form).name)} autocomplete="name" class="${ssrRenderClass([{ "is-invalid": unref(form).errors.name }, "form-control"])}"><div class="invalid-feedback">${ssrInterpolate(unref(form).errors.name)}</div></div><div class="col-md-6 aq-field"><label for="cEmail">Adresse e-mail</label><input id="cEmail"${ssrRenderAttr("value", unref(form).email)} type="email" autocomplete="email" class="${ssrRenderClass([{ "is-invalid": unref(form).errors.email }, "form-control"])}"><div class="invalid-feedback">${ssrInterpolate(unref(form).errors.email)}</div></div></div><div class="aq-field"><label for="cSubject">Objet</label><select id="cSubject" class="${ssrRenderClass([{ "is-invalid": unref(form).errors.subject }, "form-select"])}"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).subject) ? ssrLooseContain(unref(form).subject, "") : ssrLooseEqual(unref(form).subject, "")) ? " selected" : ""}>Choisissez un objet</option><!--[-->`);
      ssrRenderList(subjects, (label, k) => {
        _push(`<option${ssrRenderAttr("value", k)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).subject) ? ssrLooseContain(unref(form).subject, k) : ssrLooseEqual(unref(form).subject, k)) ? " selected" : ""}>${ssrInterpolate(label)}</option>`);
      });
      _push(`<!--]--></select><div class="invalid-feedback">${ssrInterpolate(unref(form).errors.subject)}</div></div><div class="aq-field"><label for="cMsg">Message</label><textarea id="cMsg" rows="6" class="${ssrRenderClass([{ "is-invalid": unref(form).errors.message }, "form-control"])}">${ssrInterpolate(unref(form).message)}</textarea><div class="invalid-feedback">${ssrInterpolate(unref(form).errors.message)}</div></div><div class="form-check aq-field"><input type="checkbox" id="cOk"${ssrIncludeBooleanAttr(Array.isArray(unref(form).consent) ? ssrLooseContain(unref(form).consent, null) : unref(form).consent) ? " checked" : ""} class="${ssrRenderClass([{ "is-invalid": unref(form).errors.consent }, "form-check-input"])}"><label class="form-check-label fw-normal" for="cOk">J’accepte qu’Afriquinfos utilise ces informations pour me répondre.</label><div class="invalid-feedback">${ssrInterpolate(unref(form).errors.consent)}</div></div><button class="aq-btn aq-btn--primary" type="submit"${ssrIncludeBooleanAttr(unref(form).processing) ? " disabled" : ""}>Envoyer le message</button><div class="mt-4" role="status">`);
      if ((_a = unref(page).props.flash) == null ? void 0 : _a.success) {
        _push(`<div class="aq-success">${ssrInterpolate(unref(page).props.flash.success)}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></form></div><aside class="col-lg-5"><div class="aq-side-box"><h2>Rédaction</h2><p class="aq-serif"><strong>Afriquinfos</strong><br>Directeur de la publication : Gadegbeku Edem<br><a href="mailto:redaction@afriquinfos.com">redaction@afriquinfos.com</a></p></div><div class="aq-side-box"><h2>Suivez-nous</h2><div class="aq-social"><a href="https://www.facebook.com/afriquinfoscom/" aria-label="Afriquinfos sur Facebook" rel="noopener"><i class="bi bi-facebook" aria-hidden="true"></i></a><a href="https://x.com/AfriquinfosActu" aria-label="Afriquinfos sur X" rel="noopener"><i class="bi bi-twitter-x" aria-hidden="true"></i></a></div></div></aside></div></div>`);
    };
  }
};
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Contact.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const __vite_glob_0_4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _sfc_main$8
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$7 = {
  __name: "AqSkin",
  __ssrInlineRender: true,
  setup(__props) {
    const page = usePage();
    const ad = computed(() => (page.props.ads || []).find((a) => a.slot === "habillage" && a.visual));
    function track(type) {
      var _a;
      if (!((_a = ad.value) == null ? void 0 : _a.id)) return;
      fetch("/ad-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "X-XSRF-TOKEN": decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || "")
        },
        body: JSON.stringify({ ad: ad.value.id, slot: "habillage", type }),
        credentials: "same-origin",
        keepalive: true
      }).catch(() => {
      });
    }
    const el = ref(null);
    const seen = /* @__PURE__ */ new Set();
    let observer = null;
    function observe() {
      observer == null ? void 0 : observer.disconnect();
      if (!ad.value || !el.value || seen.has(ad.value.id) || !("IntersectionObserver" in window)) return;
      observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5)) {
          seen.add(ad.value.id);
          track("imp");
          observer.disconnect();
        }
      }, { threshold: 0.5 });
      el.value.querySelectorAll(".aq-skin__side").forEach((side) => observer.observe(side));
    }
    onMounted(observe);
    watch(() => {
      var _a;
      return (_a = ad.value) == null ? void 0 : _a.id;
    }, observe, { flush: "post" });
    onBeforeUnmount(() => observer == null ? void 0 : observer.disconnect());
    return (_ctx, _push, _parent, _attrs) => {
      if (ad.value) {
        _push(`<div${ssrRenderAttrs(mergeProps({
          ref_key: "el",
          ref: el,
          class: "aq-skin",
          role: "complementary",
          "aria-label": "Publicité"
        }, _attrs))}><!--[-->`);
        ssrRenderList(["l", "r"], (side) => {
          ssrRenderVNode(_push, createVNode(resolveDynamicComponent(ad.value.url ? "a" : "span"), {
            key: side,
            class: ["aq-skin__side", "aq-skin__side--" + side],
            href: ad.value.url || null,
            target: ad.value.url ? "_blank" : null,
            rel: ad.value.url ? "noopener sponsored" : null,
            "aria-label": ad.value.url ? "Publicité — " + ad.value.advertiser : null,
            style: { backgroundImage: "url(" + ad.value.visual + ")" },
            onClick: ($event) => track("clk")
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<span class="aq-skin__tag"${_scopeId}>Publicité</span>`);
              } else {
                return [
                  createVNode("span", { class: "aq-skin__tag" }, "Publicité")
                ];
              }
            }),
            _: 2
          }), _parent);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
};
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/AqSkin.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main$6 = {
  __name: "FlashBar",
  __ssrInlineRender: true,
  props: { items: { type: Array, default: () => [] } },
  setup(__props) {
    const props = __props;
    const paused = ref(false);
    const n = computed(() => props.items.length);
    const duration = computed(() => Math.max(20, n.value * 12) + "s");
    return (_ctx, _push, _parent, _attrs) => {
      if (n.value) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "aq-flashbar" }, _attrs))} data-v-5e5b3f1c><div class="container-xl" data-v-5e5b3f1c><div class="aq-flash" role="region" aria-label="Flash info" data-v-5e5b3f1c><div class="aq-flash__label" data-v-5e5b3f1c><span class="aq-flash__dot" aria-hidden="true" data-v-5e5b3f1c></span><span data-v-5e5b3f1c><small data-v-5e5b3f1c>En direct</small><strong data-v-5e5b3f1c>Flash info</strong></span></div><div class="aq-flash__viewport aq-flash__ticker" data-v-5e5b3f1c><div class="aq-flash__track" style="${ssrRenderStyle({ animationDuration: duration.value, animationPlayState: paused.value || unref(reduceMotion) ? "paused" : "running" })}" data-v-5e5b3f1c><!--[-->`);
        ssrRenderList(2, (rep) => {
          _push(`<!--[--><!--[-->`);
          ssrRenderList(__props.items, (f, i) => {
            _push(`<!--[-->`);
            if (f.url) {
              _push(ssrRenderComponent(unref(Link), {
                class: "aq-flash__item",
                href: f.url,
                "aria-hidden": rep === 2
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`${ssrInterpolate(unref(fr)(f.text))}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(unref(fr)(f.text)), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
            } else {
              _push(`<span class="aq-flash__item"${ssrRenderAttr("aria-hidden", rep === 2)} data-v-5e5b3f1c>${ssrInterpolate(unref(fr)(f.text))}</span>`);
            }
            _push(`<!--]-->`);
          });
          _push(`<!--]--><!--]-->`);
        });
        _push(`<!--]--></div></div>`);
        if (n.value > 1) {
          _push(`<div class="aq-flash__nav" data-v-5e5b3f1c><button class="aq-flash__pause" type="button"${ssrRenderAttr("aria-label", paused.value ? "Reprendre le défilement" : "Mettre le défilement en pause")}${ssrRenderAttr("aria-pressed", paused.value)} data-v-5e5b3f1c><i class="${ssrRenderClass([paused.value ? "bi-play-fill" : "bi-pause-fill", "bi"])}" aria-hidden="true" data-v-5e5b3f1c></i></button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
};
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Components/FlashBar.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const FlashBar = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__scopeId", "data-v-5e5b3f1c"]]);
const FLASH_N = 3;
const _sfc_main$5 = {
  __name: "Home",
  __ssrInlineRender: true,
  props: {
    articles: { type: Array, required: true },
    flashes: { type: Array, default: () => [] },
    events: { type: Array, default: () => [] },
    debate: { type: Object, default: null }
  },
  setup(__props) {
    var _a, _b, _c;
    const props = __props;
    const sorted = computed(() => [...props.articles].sort((a, b) => b.date.localeCompare(a.date)));
    const byRub = (r) => sorted.value.filter((a) => a.rub === r);
    const byRegion = (g) => sorted.value.filter((a) => a.region === g);
    const slides = computed(() => sorted.value.filter((a) => a.une).slice(0, 4));
    const fil = computed(() => sorted.value.filter((a) => !slides.value.includes(a) && a.rub !== "portraits").slice(0, 4));
    const flashAll = computed(() => props.flashes);
    const flash = ref(flashAll.value.slice(0, FLASH_N));
    const seen = computed(() => [...slides.value, ...fil.value]);
    function pick(list, n) {
      const fresh = list.filter((a) => !seen.value.includes(a));
      let out = fresh.slice(0, n);
      if (out.length < n) out = out.concat(list.filter((a) => !out.includes(a)).slice(0, n - out.length));
      out.forEach((a) => {
        if (!seen.value.includes(a)) seen.value.push(a);
      });
      return out;
    }
    const afr = computed(() => pick(sorted.value.filter((a) => a.region && a.rub !== "portraits"), 6));
    const pol = computed(() => pick(byRub("politique"), 5));
    const eco = computed(() => pick(byRub("economie"), 5));
    const soc = computed(() => pick(byRub("societe"), 3));
    const cul = computed(() => pick(byRub("culture"), 6));
    const spo = computed(() => pick(byRub("sports"), 5));
    const opi = computed(() => byRub("opinion"));
    const tips = computed(() => byRub("tips"));
    const por = computed(() => byRub("portraits"));
    const regions = ((_a = usePage().props.nav) == null ? void 0 : _a.regions) || [];
    const regionFilter = ref("all");
    const regionList = computed(() => {
      const l = regionFilter.value === "all" ? afr.value : byRegion(regionFilter.value).filter((a) => a.rub !== "portraits");
      return l.slice(0, 6);
    });
    const cur = ref(0);
    const progress = ref([]);
    onMounted(() => {
      try {
        let seenIds = JSON.parse(store("aq-flash-seen") || "[]");
        let unseen = flashAll.value.filter((f) => !seenIds.includes(f.id));
        if (unseen.length < FLASH_N) {
          seenIds = [];
          unseen = flashAll.value;
        }
        const pickFlash = unseen.slice(0, FLASH_N);
        store("aq-flash-seen", JSON.stringify(seenIds.concat(pickFlash.map((f) => f.id))));
        flash.value = pickFlash;
      } catch (e) {
      }
      progress.value = slides.value.map((_, k) => k === 0 ? 1 : 0);
      const rail = document.getElementById("cultureRail");
      if (rail) checkRail();
      window.addEventListener("resize", checkRail);
    });
    onBeforeUnmount(() => window.removeEventListener("resize", checkRail));
    const railNav = ref(false);
    function checkRail() {
      const rail = document.getElementById("cultureRail");
      railNav.value = rail ? rail.scrollWidth > rail.clientWidth + 4 : false;
    }
    const voted = ref(((_b = props.debate) == null ? void 0 : _b.voted) || null);
    const voting = ref(false);
    const voteError = ref("");
    const counts = ref(((_c = props.debate) == null ? void 0 : _c.base) || null);
    watch(() => props.debate, (debate) => {
      counts.value = (debate == null ? void 0 : debate.base) || null;
      voted.value = (debate == null ? void 0 : debate.voted) || null;
      voteError.value = "";
    });
    const poll = computed(() => {
      if (!counts.value) return null;
      const pour = Number(counts.value.pour), contre = Number(counts.value.contre), total = pour + contre;
      const pctP = total ? Math.round(pour / total * 100) : 0;
      return { pour, contre, total, pctP, pctC: total ? 100 - pctP : 0 };
    });
    const pollLabel = computed(() => poll.value ? poll.value.pctP + " % pour, " + poll.value.pctC + " % contre" : "");
    const two = (n) => n < 10 ? "0" + n : String(n);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      _push(ssrRenderComponent(FlashBar, { items: flashAll.value }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$7, null, null, _parent));
      _push(`<h1 class="visually-hidden" data-v-4a3cc294>Afriquinfos, l’actualité panafricaine</h1><div class="aq-hero" data-v-4a3cc294>`);
      if (slides.value.length) {
        _push(`<section class="aq-slider" aria-roledescription="carrousel" aria-label="À la une" data-v-4a3cc294><div class="container-xl" data-v-4a3cc294><div class="aq-slider__stage" aria-live="off" data-v-4a3cc294><!--[-->`);
        ssrRenderList(slides.value, (a, i) => {
          _push(`<article class="${ssrRenderClass([{ "is-active": i === cur.value }, "aq-slide"])}"${ssrRenderAttr("id", "slide-" + i)} role="group" aria-roledescription="diapositive"${ssrRenderAttr("aria-label", i + 1 + " sur " + slides.value.length)}${ssrRenderAttr("aria-hidden", i === cur.value ? null : "true")} data-v-4a3cc294>`);
          _push(ssrRenderComponent(unref(Link), {
            class: "aq-slide__media",
            href: a.url,
            tabindex: "-1",
            "aria-hidden": "true"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(ssrRenderComponent(_sfc_main$c, {
                  a,
                  priority: i === 0,
                  sizes: "(min-width: 992px) 58vw, 100vw"
                }, null, _parent2, _scopeId));
              } else {
                return [
                  createVNode(_sfc_main$c, {
                    a,
                    priority: i === 0,
                    sizes: "(min-width: 992px) 58vw, 100vw"
                  }, null, 8, ["a", "priority"])
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<div class="aq-slide__text" data-v-4a3cc294><span class="aq-slide__kicker" data-v-4a3cc294>${ssrInterpolate(unref(fr)(unref(kicker)(a, "rub")))}</span><h2 class="aq-slide__title" data-v-4a3cc294>`);
          _push(ssrRenderComponent(unref(Link), {
            href: a.url,
            tabindex: i === cur.value ? null : "-1"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(unref(fr)(a.title))}`);
              } else {
                return [
                  createTextVNode(toDisplayString(unref(fr)(a.title)), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</h2><p class="aq-slide__chapo" data-v-4a3cc294>${ssrInterpolate(unref(fr)(a.chapo))}</p><p class="aq-slide__meta" data-v-4a3cc294>Par ${ssrInterpolate(a.author)}, ${ssrInterpolate(unref(rel)(a.date))}, ${ssrInterpolate(a.read)} min de lecture</p>`);
          _push(ssrRenderComponent(unref(Link), {
            class: "aq-slide__cta",
            href: a.url,
            tabindex: i === cur.value ? null : "-1"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`Lire l’article`);
              } else {
                return [
                  createTextVNode("Lire l’article")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</div></article>`);
        });
        _push(`<!--]--></div><div class="aq-slider__nav" data-v-4a3cc294><div class="aq-slider__tabs" role="tablist" aria-label="Articles à la une" data-v-4a3cc294><!--[-->`);
        ssrRenderList(slides.value, (a, i) => {
          _push(`<button type="button" role="tab" class="aq-slider__tab"${ssrRenderAttr("aria-controls", "slide-" + i)}${ssrRenderAttr("aria-selected", i === cur.value)} data-v-4a3cc294><span class="aq-slider__progress" aria-hidden="true" style="${ssrRenderStyle({ "--p": progress.value[i] || 0 })}" data-v-4a3cc294></span><small data-v-4a3cc294><b data-v-4a3cc294>${ssrInterpolate(two(i + 1))}</b>${ssrInterpolate(a.rub_label)}</small><span class="aq-slider__tabtitle" data-v-4a3cc294>${ssrInterpolate(unref(fr)(a.title))}</span></button>`);
        });
        _push(`<!--]--></div><div class="aq-slider__btns" data-v-4a3cc294><button type="button" class="aq-slider__btn" aria-label="Article précédent" data-v-4a3cc294><i class="bi bi-arrow-left" aria-hidden="true" data-v-4a3cc294></i></button><button type="button" class="aq-slider__btn" aria-label="Article suivant" data-v-4a3cc294><i class="bi bi-arrow-right" aria-hidden="true" data-v-4a3cc294></i></button></div></div></div></section>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><section class="aq-section aq-section--white aq-section--fil" aria-labelledby="filTitre" data-v-4a3cc294><div class="container-xl" data-v-4a3cc294><div class="aq-filrow" data-v-4a3cc294><h2 class="aq-filrow__title" id="filTitre" data-v-4a3cc294><span class="aq-live" aria-hidden="true" data-v-4a3cc294></span>Le fil</h2><ol class="aq-filrow__list" data-v-4a3cc294><!--[-->`);
      ssrRenderList(fil.value, (a) => {
        _push(`<li data-v-4a3cc294>`);
        _push(ssrRenderComponent(unref(Link), {
          href: a.url
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="aq-filrow__meta" data-v-4a3cc294${_scopeId}><time${ssrRenderAttr("datetime", a.date)} data-v-4a3cc294${_scopeId}>${ssrInterpolate(unref(rel)(a.date))}</time>${ssrInterpolate(a.rub_label)}</span><strong data-v-4a3cc294${_scopeId}>${ssrInterpolate(unref(fr)(a.title))}</strong>`);
            } else {
              return [
                createVNode("span", { class: "aq-filrow__meta" }, [
                  createVNode("time", {
                    datetime: a.date
                  }, toDisplayString(unref(rel)(a.date)), 9, ["datetime"]),
                  createTextVNode(toDisplayString(a.rub_label), 1)
                ]),
                createVNode("strong", null, toDisplayString(unref(fr)(a.title)), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</li>`);
      });
      _push(`<!--]--></ol></div></div></section><section class="aq-section aq-section--white" id="afriques" aria-labelledby="h-afriques" data-v-4a3cc294><div class="container-xl" data-v-4a3cc294>`);
      _push(ssrRenderComponent(_sfc_main$h, {
        id: "afriques",
        title: "Les Afriques",
        tagline: "Toutes les Afriques, sans détour",
        href: "/afriques"
      }, null, _parent));
      _push(`<div class="aq-filters" role="group" aria-label="Filtrer par région" data-v-4a3cc294><button type="button"${ssrRenderAttr("aria-pressed", regionFilter.value === "all")} data-v-4a3cc294>Toutes</button><!--[-->`);
      ssrRenderList(unref(regions), (g) => {
        _push(`<button type="button"${ssrRenderAttr("aria-pressed", regionFilter.value === g.slug)} data-v-4a3cc294>${ssrInterpolate(g.label)}</button>`);
      });
      _push(`<!--]--></div><div class="row g-4 g-xl-5" aria-live="polite" data-v-4a3cc294><!--[-->`);
      ssrRenderList(regionList.value, (a) => {
        _push(ssrRenderComponent(_sfc_main$b, {
          key: a.id,
          a,
          col: "col-md-6 col-xl-4 aq-fade",
          "kicker-mode": "rub"
        }, null, _parent));
      });
      _push(`<!--]-->`);
      if (!regionList.value.length) {
        _push(`<p class="aq-empty" data-v-4a3cc294>Aucun article récent pour cette région.</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></section><section class="aq-section aq-section--white" id="politique" aria-labelledby="h-politique" data-v-4a3cc294>`);
      if (pol.value.length) {
        _push(`<div class="container-xl" data-v-4a3cc294>`);
        _push(ssrRenderComponent(_sfc_main$h, {
          id: "politique",
          title: "Politique",
          tagline: "Les arcanes de la politique africaine",
          href: "/rubrique/politique",
          more: "Toute la rubrique"
        }, null, _parent));
        _push(`<div class="row g-5" data-v-4a3cc294><article class="col-lg-7 aq-lead" data-v-4a3cc294>`);
        _push(ssrRenderComponent(unref(Link), {
          href: pol.value[0].url
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="aq-media aq-media--cut aq-media--wide" data-v-4a3cc294${_scopeId}>`);
              _push2(ssrRenderComponent(_sfc_main$c, {
                a: pol.value[0]
              }, null, _parent2, _scopeId));
              _push2(`</div><span class="aq-card__place" data-v-4a3cc294${_scopeId}>${ssrInterpolate(unref(fr)(unref(kicker)(pol.value[0])))}</span><h3 class="aq-lead__title" data-v-4a3cc294${_scopeId}>${ssrInterpolate(unref(fr)(pol.value[0].title))}</h3><p class="aq-lead__text" data-v-4a3cc294${_scopeId}>${ssrInterpolate(unref(fr)(pol.value[0].chapo))}</p>`);
            } else {
              return [
                createVNode("div", { class: "aq-media aq-media--cut aq-media--wide" }, [
                  createVNode(_sfc_main$c, {
                    a: pol.value[0]
                  }, null, 8, ["a"])
                ]),
                createVNode("span", { class: "aq-card__place" }, toDisplayString(unref(fr)(unref(kicker)(pol.value[0]))), 1),
                createVNode("h3", { class: "aq-lead__title" }, toDisplayString(unref(fr)(pol.value[0].title)), 1),
                createVNode("p", { class: "aq-lead__text" }, toDisplayString(unref(fr)(pol.value[0].chapo)), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</article><div class="col-lg-5 aq-stack" data-v-4a3cc294><!--[-->`);
        ssrRenderList(pol.value.slice(1, 5), (a) => {
          _push(ssrRenderComponent(unref(Link), {
            key: a.id,
            class: "aq-stack__item",
            href: a.url
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<span class="aq-card__place" data-v-4a3cc294${_scopeId}>${ssrInterpolate(unref(fr)(unref(kicker)(a)))}</span><h3 data-v-4a3cc294${_scopeId}>${ssrInterpolate(unref(fr)(a.title))}</h3><time class="aq-card__meta" data-v-4a3cc294${_scopeId}>${ssrInterpolate(unref(rel)(a.date))}</time>`);
              } else {
                return [
                  createVNode("span", { class: "aq-card__place" }, toDisplayString(unref(fr)(unref(kicker)(a))), 1),
                  createVNode("h3", null, toDisplayString(unref(fr)(a.title)), 1),
                  createVNode("time", { class: "aq-card__meta" }, toDisplayString(unref(rel)(a.date)), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</section><div class="container-xl" data-v-4a3cc294>`);
      _push(ssrRenderComponent(_sfc_main$d, {
        slot: "billboard",
        variant: "billboard"
      }, null, _parent));
      _push(`</div><section class="aq-section aq-section--ink" id="economie" aria-labelledby="h-economie" data-v-4a3cc294>`);
      if (eco.value.length) {
        _push(`<div class="container-xl" data-v-4a3cc294>`);
        _push(ssrRenderComponent(_sfc_main$h, {
          id: "economie",
          title: "Économie",
          tagline: "L’information économique panafricaine de référence",
          href: "/rubrique/economie",
          more: "Toute la rubrique"
        }, null, _parent));
        _push(`<div class="row g-5" data-v-4a3cc294><article class="col-lg-6 aq-lead" data-v-4a3cc294>`);
        _push(ssrRenderComponent(unref(Link), {
          href: eco.value[0].url
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="aq-media aq-media--cut aq-media--wide" data-v-4a3cc294${_scopeId}>`);
              _push2(ssrRenderComponent(_sfc_main$c, {
                a: eco.value[0]
              }, null, _parent2, _scopeId));
              _push2(`</div><span class="aq-card__place" data-v-4a3cc294${_scopeId}>${ssrInterpolate(unref(fr)(eco.value[0].country))}</span><h3 class="aq-lead__title" data-v-4a3cc294${_scopeId}>${ssrInterpolate(unref(fr)(eco.value[0].title))}</h3><p class="aq-lead__text" data-v-4a3cc294${_scopeId}>${ssrInterpolate(unref(fr)(eco.value[0].chapo))}</p>`);
            } else {
              return [
                createVNode("div", { class: "aq-media aq-media--cut aq-media--wide" }, [
                  createVNode(_sfc_main$c, {
                    a: eco.value[0]
                  }, null, 8, ["a"])
                ]),
                createVNode("span", { class: "aq-card__place" }, toDisplayString(unref(fr)(eco.value[0].country)), 1),
                createVNode("h3", { class: "aq-lead__title" }, toDisplayString(unref(fr)(eco.value[0].title)), 1),
                createVNode("p", { class: "aq-lead__text" }, toDisplayString(unref(fr)(eco.value[0].chapo)), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</article><div class="col-lg-6 aq-hlist" data-v-4a3cc294><!--[-->`);
        ssrRenderList(eco.value.slice(1, 5), (a) => {
          _push(ssrRenderComponent(_sfc_main$b, {
            key: a.id,
            a,
            h: ""
          }, null, _parent));
        });
        _push(`<!--]--></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</section><section class="aq-section aq-section--white aq-below" id="societe" aria-labelledby="h-societe" data-v-4a3cc294><div class="container-xl" data-v-4a3cc294>`);
      _push(ssrRenderComponent(_sfc_main$h, {
        id: "societe",
        title: "Société",
        tagline: "La société africaine en mouvement",
        href: "/rubrique/societe",
        more: "Toute la rubrique"
      }, null, _parent));
      _push(`<div class="row g-4 g-xl-5" data-v-4a3cc294><!--[-->`);
      ssrRenderList(soc.value.slice(0, 3), (a) => {
        _push(ssrRenderComponent(_sfc_main$b, {
          key: a.id,
          a,
          col: "col-md-4"
        }, null, _parent));
      });
      _push(`<!--]--></div></div></section><section class="aq-section aq-section--white aq-below" id="culture" aria-labelledby="h-culture" data-v-4a3cc294><div class="container-xl" data-v-4a3cc294>`);
      _push(ssrRenderComponent(_sfc_main$h, {
        id: "culture",
        title: "Culture",
        tagline: "Vivez au rythme de la culture africaine",
        href: "/rubrique/culture",
        more: "Toute la rubrique"
      }, null, _parent));
      _push(`<div class="aq-rail-x" id="cultureRail" tabindex="0" aria-label="Articles culture" data-v-4a3cc294><!--[-->`);
      ssrRenderList(cul.value, (a) => {
        _push(ssrRenderComponent(unref(Link), {
          key: a.id,
          class: "aq-poster",
          href: a.url
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_sfc_main$c, { a }, null, _parent2, _scopeId));
              _push2(`<span class="aq-poster__kind" data-v-4a3cc294${_scopeId}>${ssrInterpolate(unref(fr)(a.country))}</span><h3 data-v-4a3cc294${_scopeId}>${ssrInterpolate(unref(fr)(a.title))}</h3>`);
            } else {
              return [
                createVNode(_sfc_main$c, { a }, null, 8, ["a"]),
                createVNode("span", { class: "aq-poster__kind" }, toDisplayString(unref(fr)(a.country)), 1),
                createVNode("h3", null, toDisplayString(unref(fr)(a.title)), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></div>`);
      if (railNav.value) {
        _push(`<div class="aq-rail-x__nav" data-v-4a3cc294><button type="button" class="aq-icon aq-icon--outline" aria-label="Précédent" data-v-4a3cc294><i class="bi bi-arrow-left" aria-hidden="true" data-v-4a3cc294></i></button><button type="button" class="aq-icon aq-icon--outline" aria-label="Suivant" data-v-4a3cc294><i class="bi bi-arrow-right" aria-hidden="true" data-v-4a3cc294></i></button></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></section><section class="aq-section aq-section--white aq-below" id="sports" aria-labelledby="h-sports" data-v-4a3cc294>`);
      if (spo.value.length) {
        _push(`<div class="container-xl" data-v-4a3cc294>`);
        _push(ssrRenderComponent(_sfc_main$h, {
          id: "sports",
          title: "Sports",
          tagline: "La passion du sport africain est contagieuse",
          href: "/rubrique/sports",
          more: "Toute la rubrique"
        }, null, _parent));
        _push(`<div class="row g-5" data-v-4a3cc294><article class="col-lg-7 aq-lead" data-v-4a3cc294>`);
        _push(ssrRenderComponent(unref(Link), {
          href: spo.value[0].url
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="aq-media aq-media--cut aq-media--wide" data-v-4a3cc294${_scopeId}>`);
              _push2(ssrRenderComponent(_sfc_main$c, {
                a: spo.value[0]
              }, null, _parent2, _scopeId));
              _push2(`</div><span class="aq-card__place" data-v-4a3cc294${_scopeId}>${ssrInterpolate(unref(fr)(spo.value[0].country))}</span><h3 class="aq-lead__title" data-v-4a3cc294${_scopeId}>${ssrInterpolate(unref(fr)(spo.value[0].title))}</h3><p class="aq-lead__text" data-v-4a3cc294${_scopeId}>${ssrInterpolate(unref(fr)(spo.value[0].chapo))}</p>`);
            } else {
              return [
                createVNode("div", { class: "aq-media aq-media--cut aq-media--wide" }, [
                  createVNode(_sfc_main$c, {
                    a: spo.value[0]
                  }, null, 8, ["a"])
                ]),
                createVNode("span", { class: "aq-card__place" }, toDisplayString(unref(fr)(spo.value[0].country)), 1),
                createVNode("h3", { class: "aq-lead__title" }, toDisplayString(unref(fr)(spo.value[0].title)), 1),
                createVNode("p", { class: "aq-lead__text" }, toDisplayString(unref(fr)(spo.value[0].chapo)), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</article><div class="col-lg-5 aq-stack" data-v-4a3cc294><!--[-->`);
        ssrRenderList(spo.value.slice(1, 5), (a) => {
          _push(ssrRenderComponent(unref(Link), {
            key: a.id,
            class: "aq-stack__item",
            href: a.url
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<span class="aq-card__place" data-v-4a3cc294${_scopeId}>${ssrInterpolate(unref(fr)(a.country))}</span><h3 data-v-4a3cc294${_scopeId}>${ssrInterpolate(unref(fr)(a.title))}</h3><time class="aq-card__meta" data-v-4a3cc294${_scopeId}>${ssrInterpolate(unref(rel)(a.date))}</time>`);
              } else {
                return [
                  createVNode("span", { class: "aq-card__place" }, toDisplayString(unref(fr)(a.country)), 1),
                  createVNode("h3", null, toDisplayString(unref(fr)(a.title)), 1),
                  createVNode("time", { class: "aq-card__meta" }, toDisplayString(unref(rel)(a.date)), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</section><section class="aq-section aq-section--stone aq-below" id="portraits" aria-labelledby="h-portraits" data-v-4a3cc294><div class="container-xl" data-v-4a3cc294>`);
      _push(ssrRenderComponent(_sfc_main$h, {
        id: "portraits",
        title: "Portraits",
        tagline: "Celles et ceux qui font l’Afrique d’aujourd’hui",
        href: "/portraits"
      }, null, _parent));
      _push(`<div class="row g-4" data-v-4a3cc294><!--[-->`);
      ssrRenderList(por.value.slice(0, 4), (a) => {
        _push(`<article class="aq-portrait col-sm-6 col-lg-3" data-v-4a3cc294>`);
        _push(ssrRenderComponent(unref(Link), {
          href: a.url
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a2, _b2, _c2, _d, _e, _f;
            if (_push2) {
              _push2(`<div class="aq-portrait__visual" data-v-4a3cc294${_scopeId}>`);
              _push2(ssrRenderComponent(_sfc_main$c, { a }, null, _parent2, _scopeId));
              _push2(`</div><h3 class="aq-portrait__name" data-v-4a3cc294${_scopeId}>${ssrInterpolate((_a2 = a.person) == null ? void 0 : _a2.name)}</h3><p class="aq-portrait__role" data-v-4a3cc294${_scopeId}>${ssrInterpolate(unref(fr)((((_b2 = a.person) == null ? void 0 : _b2.role) || "") + ", " + (((_c2 = a.person) == null ? void 0 : _c2.city) || "") + " (" + a.country + ")"))}</p><p class="aq-portrait__chapo" data-v-4a3cc294${_scopeId}>${ssrInterpolate(unref(fr)(a.chapo))}</p>`);
            } else {
              return [
                createVNode("div", { class: "aq-portrait__visual" }, [
                  createVNode(_sfc_main$c, { a }, null, 8, ["a"])
                ]),
                createVNode("h3", { class: "aq-portrait__name" }, toDisplayString((_d = a.person) == null ? void 0 : _d.name), 1),
                createVNode("p", { class: "aq-portrait__role" }, toDisplayString(unref(fr)((((_e = a.person) == null ? void 0 : _e.role) || "") + ", " + (((_f = a.person) == null ? void 0 : _f.city) || "") + " (" + a.country + ")")), 1),
                createVNode("p", { class: "aq-portrait__chapo" }, toDisplayString(unref(fr)(a.chapo)), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</article>`);
      });
      _push(`<!--]--></div></div></section><section class="aq-section aq-section--orange aq-below" id="opinion" aria-labelledby="h-opinion" data-v-4a3cc294><div class="container-xl" data-v-4a3cc294>`);
      _push(ssrRenderComponent(_sfc_main$h, {
        id: "opinion",
        title: "Opinion/Tribune",
        tagline: "Afriquinfos vous invite au débat",
        href: "/rubrique/opinion",
        more: "Toutes les tribunes"
      }, null, _parent));
      if (__props.debate) {
        _push(`<div class="aq-debate" data-v-4a3cc294><p class="aq-debate__q" data-v-4a3cc294>Le débat de la semaine</p><h3 class="aq-debate__title" data-v-4a3cc294>${ssrInterpolate(unref(fr)(__props.debate.question))}</h3><div class="aq-debate__sides" data-v-4a3cc294><article class="aq-side" data-v-4a3cc294><span class="aq-side__label" data-v-4a3cc294>Pour</span><blockquote data-v-4a3cc294>« ${ssrInterpolate(unref(fr)(__props.debate.pour.text))} »</blockquote><p class="aq-side__who" data-v-4a3cc294>${ssrInterpolate(unref(fr)(__props.debate.pour.who))}</p></article><article class="aq-side" data-v-4a3cc294><span class="aq-side__label" data-v-4a3cc294>Contre</span><blockquote data-v-4a3cc294>« ${ssrInterpolate(unref(fr)(__props.debate.contre.text))} »</blockquote><p class="aq-side__who" data-v-4a3cc294>${ssrInterpolate(unref(fr)(__props.debate.contre.who))}</p></article></div><div class="aq-poll" data-v-4a3cc294><p class="aq-poll__ask" data-v-4a3cc294>Et vous, qu’en pensez-vous ?</p><div class="aq-poll__buttons" data-v-4a3cc294><button type="button" class="aq-btn aq-btn--ink"${ssrRenderAttr("aria-pressed", voted.value === "pour")}${ssrIncludeBooleanAttr(voting.value || !!voted.value || !__props.debate.open) ? " disabled" : ""} data-v-4a3cc294>Je suis pour</button><button type="button" class="aq-btn aq-btn--outline"${ssrRenderAttr("aria-pressed", voted.value === "contre")}${ssrIncludeBooleanAttr(voting.value || !!voted.value || !__props.debate.open) ? " disabled" : ""} data-v-4a3cc294>Je suis contre</button></div>`);
        if (voteError.value) {
          _push(`<p role="alert" data-v-4a3cc294>${ssrInterpolate(voteError.value)}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (!__props.debate.open) {
          _push(`<p class="aq-poll__thanks" data-v-4a3cc294>Ce débat est fermé aux votes.</p>`);
        } else {
          _push(`<!---->`);
        }
        if ((voted.value || !__props.debate.open) && poll.value) {
          _push(`<div data-v-4a3cc294><div class="aq-poll__bar" role="img"${ssrRenderAttr("aria-label", pollLabel.value)} data-v-4a3cc294><span class="aq-poll__pour" style="${ssrRenderStyle({ width: poll.value.pctP + "%" })}" data-v-4a3cc294></span><span class="aq-poll__contre" style="${ssrRenderStyle({ width: poll.value.pctC + "%" })}" data-v-4a3cc294></span></div><p class="aq-poll__legend" data-v-4a3cc294><b data-v-4a3cc294>${ssrInterpolate(poll.value.pctP)} %</b> pour, <b data-v-4a3cc294>${ssrInterpolate(poll.value.pctC)} %</b> contre, <b data-v-4a3cc294>${ssrInterpolate(poll.value.total)}</b> votes</p>`);
          if (voted.value) {
            _push(`<p class="aq-poll__thanks" role="status" data-v-4a3cc294>Vote confirmé : vous êtes ${ssrInterpolate(voted.value)}. Un vote par navigateur et par débat.</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="row g-4" data-v-4a3cc294><!--[-->`);
      ssrRenderList(opi.value.slice(0, 3), (a) => {
        _push(`<article class="col-md-4 aq-tribune" data-v-4a3cc294>`);
        _push(ssrRenderComponent(unref(Link), {
          href: a.url
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="aq-avatar" aria-hidden="true" data-v-4a3cc294${_scopeId}>${ssrInterpolate(unref(initials)(a.author))}</span><h3 data-v-4a3cc294${_scopeId}>${ssrInterpolate(unref(fr)(a.title))}</h3><p data-v-4a3cc294${_scopeId}>${ssrInterpolate(unref(fr)(a.author))}</p>`);
            } else {
              return [
                createVNode("span", {
                  class: "aq-avatar",
                  "aria-hidden": "true"
                }, toDisplayString(unref(initials)(a.author)), 1),
                createVNode("h3", null, toDisplayString(unref(fr)(a.title)), 1),
                createVNode("p", null, toDisplayString(unref(fr)(a.author)), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</article>`);
      });
      _push(`<!--]--></div></div></section><section class="aq-section aq-section--white aq-below" id="tips" aria-labelledby="h-tips" data-v-4a3cc294><div class="container-xl" data-v-4a3cc294>`);
      _push(ssrRenderComponent(_sfc_main$h, {
        id: "tips",
        title: "Tips",
        tagline: "Conseils pratiques pour voyager, entreprendre et mieux vivre",
        href: "/rubrique/tips",
        more: "Tout voir"
      }, null, _parent));
      _push(`<div class="row g-4 g-xl-5" data-v-4a3cc294><!--[-->`);
      ssrRenderList(tips.value.slice(0, 3), (a) => {
        _push(`<article class="col-md-4 aq-tip" data-v-4a3cc294>`);
        _push(ssrRenderComponent(unref(Link), {
          href: a.url
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<i class="${ssrRenderClass([a.icon || "bi-lightbulb", "bi"])}" aria-hidden="true" data-v-4a3cc294${_scopeId}></i><h3 data-v-4a3cc294${_scopeId}>${ssrInterpolate(unref(fr)(a.title))}</h3><p data-v-4a3cc294${_scopeId}>${ssrInterpolate(unref(fr)(a.chapo))}</p>`);
            } else {
              return [
                createVNode("i", {
                  class: ["bi", a.icon || "bi-lightbulb"],
                  "aria-hidden": "true"
                }, null, 2),
                createVNode("h3", null, toDisplayString(unref(fr)(a.title)), 1),
                createVNode("p", null, toDisplayString(unref(fr)(a.chapo)), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</article>`);
      });
      _push(`<!--]--></div></div></section><section class="aq-section aq-section--white aq-below" id="agenda" aria-labelledby="h-agenda" data-v-4a3cc294><div class="container-xl" data-v-4a3cc294>`);
      _push(ssrRenderComponent(_sfc_main$h, {
        id: "agenda",
        title: "Agenda",
        tagline: "Les rendez-vous à ne pas manquer",
        href: "/agendas",
        more: "Tout l’agenda"
      }, null, _parent));
      if (__props.events.length) {
        _push(`<div class="aq-agenda-row" data-v-4a3cc294><!--[-->`);
        ssrRenderList(__props.events.slice(0, 3), (e) => {
          _push(ssrRenderComponent(_sfc_main$f, {
            key: e.slug,
            e
          }, null, _parent));
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<p class="aq-empty" data-v-4a3cc294>Aucun événement à venir pour le moment.</p>`);
      }
      _push(`</div></section>`);
      _push(ssrRenderComponent(_sfc_main$a, null, null, _parent));
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Home.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const Home = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-4a3cc294"]]);
const __vite_glob_0_5 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Home
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$4 = {
  __name: "Legal",
  __ssrInlineRender: true,
  props: {
    page: { type: String, required: true },
    title: { type: String, required: true }
  },
  setup(__props) {
    const links = [
      { slug: "mentions-legales", label: "Mentions légales", href: "/mentions-legales" },
      { slug: "confidentialite", label: "Confidentialité", href: "/confidentialite" },
      { slug: "cookies", label: "Cookies", href: "/cookies" }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-xl aq-page-head" }, _attrs))}>`);
      _push(ssrRenderComponent(_sfc_main$g, {
        items: [{ label: __props.title }]
      }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$h, {
        title: __props.title,
        tagline: "Informations juridiques et protection de vos données",
        level: 1
      }, null, _parent));
      _push(`<div class="mb-4 d-flex gap-2 flex-wrap" role="group" aria-label="Pages légales"><!--[-->`);
      ssrRenderList(links, (l) => {
        _push(ssrRenderComponent(unref(Link), {
          key: l.slug,
          class: ["aq-btn", __props.page === l.slug ? "aq-btn--primary" : "aq-btn--outline"],
          href: l.href,
          "aria-current": __props.page === l.slug ? "page" : null
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(l.label)}`);
            } else {
              return [
                createTextVNode(toDisplayString(l.label), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></div><div class="row g-5 mb-5"><div class="col-lg-8 aq-prose" style="${ssrRenderStyle({ "max-width": "none" })}">`);
      if (__props.page === "mentions-legales") {
        _push(`<!--[--><h2>Éditeur du site</h2><p>Le site <strong>Afriquinfos</strong> (ci-après « le Site ») est édité par <strong>Afriquinfos</strong>, média panafricain en ligne.</p><p><strong>Directeur de la publication</strong> : Gadegbeku Edem<br><strong>Contact rédaction</strong> : <a href="mailto:redaction@afriquinfos.com">redaction@afriquinfos.com</a></p><h2>Hébergement</h2><p>Le Site est hébergé par <strong>Hestia</strong>.</p><h2>Propriété intellectuelle</h2><p>L’ensemble des contenus du Site (articles, reportages, photographies, infographies, logo, charte graphique) est la propriété exclusive d’Afriquinfos ou de ses partenaires. Toute reproduction, représentation, diffusion ou rediffusion, totale ou partielle, sans autorisation écrite préalable est interdite, conformément au droit d’auteur.</p><h2>Liens hypertextes</h2><p>Le Site peut contenir des liens vers des sites tiers. Afriquinfos n’exerce aucun contrôle sur leur contenu et décline toute responsabilité à leur égard. L’établissement d’un lien vers le Site est autorisé pour les pages publiques, sous réserve d’une mention claire de la source.</p><h2>Responsabilité</h2><p>Les informations publiées le sont à titre journalistique et informatif. Afriquinfos s’efforce d’en garantir l’exactitude mais ne saurait être tenu responsable des erreurs, omissions ou de l’usage qui en est fait. Les tribunes publiées n’engagent que leurs auteurs.</p><h2>Droit applicable</h2><p>Les présentes mentions légales sont régies par le droit applicable au siège social de l’éditeur. Tout litige relatif à l’utilisation du Site relève des tribunaux compétents du ressort de ce siège.</p><!--]-->`);
      } else if (__props.page === "confidentialite") {
        _push(`<!--[--><h2>Données collectées</h2><p>Afriquinfos collecte uniquement les données nécessaires à ses services :</p><ul><li><strong>Formulaire de contact</strong> : nom, adresse e-mail, objet et contenu du message — utilisés exclusivement pour répondre à votre demande ;</li><li><strong>Newsletter</strong> : adresse e-mail — utilisée pour l’envoi du brief quotidien, désinscription possible à tout moment ;</li><li><strong>Commentaires</strong> : nom affiché et adresse e-mail (non publiée) — pour la modération ;</li><li><strong>Mesure d’audience</strong> : données de navigation anonymisées (pages vues).</li></ul><h2>Base légale et durée de conservation</h2><p>Les traitements reposent sur votre consentement (newsletter, commentaires), sur l’exécution de mesures précontractuelles (réponse à vos demandes) et sur l’intérêt légitime du média (sécurité, statistiques). Les données sont conservées 24 mois maximum pour les messages de contact, et jusqu’à la désinscription pour la newsletter.</p><h2>Vos droits</h2><p>Conformément à la réglementation applicable en matière de protection des données personnelles, vous disposez d’un droit d’accès, de rectification, d’effacement, d’opposition et de portabilité de vos données. Pour les exercer, écrivez à <strong>redaction@afriquinfos.com</strong> ou via le `);
        _push(ssrRenderComponent(unref(Link), { href: "/contact" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`formulaire de contact`);
            } else {
              return [
                createTextVNode("formulaire de contact")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`.</p><h2>Partage et sous-traitants</h2><p>Vos données ne sont ni vendues ni partagées à des tiers à des fins commerciales. Elles peuvent être traitées par nos prestataires techniques (hébergement, envoi d’e-mails) dans le strict cadre de leurs missions.</p><h2>Sécurité</h2><p>Nous mettons en œuvre des mesures techniques et organisationnelles appropriées (chiffrement des échanges en HTTPS, accès restreint à l’administration, mots de passe chiffrés) pour protéger vos données contre tout accès non autorisé.</p><!--]-->`);
      } else if (__props.page === "cookies") {
        _push(`<!--[--><h2>Qu’est-ce qu’un cookie ?</h2><p>Un cookie est un petit fichier enregistré sur votre appareil lors de la consultation d’un site. Afriquinfos utilise un nombre limité de cookies et de stockages locaux, répartis en deux catégories.</p><h2>Cookies strictement nécessaires</h2><p>Ils sont indispensables au fonctionnement du Site et ne requièrent pas de consentement :</p><ul><li><strong>Session et sécurité</strong> : identifiant de session et jeton de protection contre les falsifications de requêtes (formulaires, administration) ;</li><li><strong>Préférences d’affichage</strong> : choix du thème clair/sombre et taille du texte des articles, conservés localement sur votre appareil ;</li><li><strong>Vote au débat</strong> : mémorisation de votre participation au débat de la semaine.</li></ul><h2>Cookies de mesure d’audience</h2><p>Des statistiques de fréquentation peuvent être collectées de manière agrégée et anonymisée pour améliorer les contenus. Aucun cookie publicitaire de tiers n’est déposé par défaut.</p><h2>Gérer vos préférences</h2><p>Vous pouvez à tout moment supprimer les cookies et stockages locaux depuis les réglages de votre navigateur. La plupart des navigateurs permettent également de refuser les cookies par site ou globalement ; le blocage des cookies techniques peut toutefois altérer certaines fonctions (connexion à l’espace de rédaction, formulaires).</p><h2>En savoir plus</h2><p>Pour toute question relative aux cookies ou à vos données, consultez notre `);
        _push(ssrRenderComponent(unref(Link), { href: "/confidentialite" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`politique de confidentialité`);
            } else {
              return [
                createTextVNode("politique de confidentialité")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(` ou écrivez-nous via la page `);
        _push(ssrRenderComponent(unref(Link), { href: "/contact" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Contact`);
            } else {
              return [
                createTextVNode("Contact")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`.</p><!--]-->`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><aside class="col-lg-4"><div class="aq-sticky"><div class="aq-side-box"><h2>Documents</h2><p class="aq-serif">`);
      _push(ssrRenderComponent(unref(Link), { href: "/mentions-legales" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Mentions légales`);
          } else {
            return [
              createTextVNode("Mentions légales")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<br>`);
      _push(ssrRenderComponent(unref(Link), { href: "/confidentialite" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Politique de confidentialité`);
          } else {
            return [
              createTextVNode("Politique de confidentialité")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<br>`);
      _push(ssrRenderComponent(unref(Link), { href: "/cookies" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Gestion des cookies`);
          } else {
            return [
              createTextVNode("Gestion des cookies")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</p><p class="ad-muted aq-serif mb-0"><small>Dernière mise à jour : octobre 2026</small></p></div></div></aside></div></div>`);
    };
  }
};
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Legal.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __vite_glob_0_6 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _sfc_main$4
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$3 = {
  __name: "Portraits",
  __ssrInlineRender: true,
  props: {
    articles: { type: Array, default: () => [] },
    tagline: { type: String, default: "" }
  },
  setup(__props) {
    var _a;
    const props = __props;
    const regions = ((_a = usePage().props.nav) == null ? void 0 : _a.regions) || [];
    const regionLabels = Object.fromEntries(regions.map((r) => [r.slug, r.label]));
    const used = computed(() => {
      const seen = [];
      props.articles.forEach((a) => {
        if (a.region && !seen.includes(a.region)) seen.push(a.region);
      });
      return seen;
    });
    const filter = ref("all");
    const list = computed(() => filter.value === "all" ? props.articles : props.articles.filter((a) => a.region === filter.value));
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[--><div class="aq-pagehero"><div class="container-xl">`);
      _push(ssrRenderComponent(_sfc_main$g, { items: [{ label: "Portraits" }] }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$h, {
        title: "Portraits",
        tagline: __props.tagline,
        level: 1
      }, null, _parent));
      _push(`</div></div><div class="container-xl aq-page-head"><div class="aq-filters" role="group" aria-label="Filtrer par région"><button type="button"${ssrRenderAttr("aria-pressed", filter.value === "all")}>Tous<small>${ssrInterpolate(__props.articles.length)}</small></button><!--[-->`);
      ssrRenderList(used.value, (g) => {
        _push(`<button type="button"${ssrRenderAttr("aria-pressed", filter.value === g)}>${ssrInterpolate(unref(regionLabels)[g])}<small>${ssrInterpolate(__props.articles.filter((a) => a.region === g).length)}</small></button>`);
      });
      _push(`<!--]--></div><div class="row g-4 mb-5" aria-live="polite"><!--[-->`);
      ssrRenderList(list.value, (a) => {
        _push(`<article class="aq-portrait col-sm-6 col-lg-3 aq-fade">`);
        _push(ssrRenderComponent(unref(Link), {
          href: a.url
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a2, _b, _c, _d, _e, _f;
            if (_push2) {
              _push2(`<div class="aq-portrait__visual"${_scopeId}>`);
              _push2(ssrRenderComponent(_sfc_main$c, { a }, null, _parent2, _scopeId));
              _push2(`</div><h3 class="aq-portrait__name"${_scopeId}>${ssrInterpolate((_a2 = a.person) == null ? void 0 : _a2.name)}</h3><p class="aq-portrait__role"${_scopeId}>${ssrInterpolate(unref(fr)((((_b = a.person) == null ? void 0 : _b.role) || "") + ", " + (((_c = a.person) == null ? void 0 : _c.city) || "") + " (" + a.country + ")"))}</p><p class="aq-portrait__chapo"${_scopeId}>${ssrInterpolate(unref(fr)(a.chapo))}</p>`);
            } else {
              return [
                createVNode("div", { class: "aq-portrait__visual" }, [
                  createVNode(_sfc_main$c, { a }, null, 8, ["a"])
                ]),
                createVNode("h3", { class: "aq-portrait__name" }, toDisplayString((_d = a.person) == null ? void 0 : _d.name), 1),
                createVNode("p", { class: "aq-portrait__role" }, toDisplayString(unref(fr)((((_e = a.person) == null ? void 0 : _e.role) || "") + ", " + (((_f = a.person) == null ? void 0 : _f.city) || "") + " (" + a.country + ")")), 1),
                createVNode("p", { class: "aq-portrait__chapo" }, toDisplayString(unref(fr)(a.chapo)), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</article>`);
      });
      _push(`<!--]--></div></div>`);
      _push(ssrRenderComponent(_sfc_main$a, null, null, _parent));
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Portraits.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __vite_glob_0_7 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _sfc_main$3
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$2 = {
  __name: "Recherche",
  __ssrInlineRender: true,
  props: {
    q: { type: String, default: "" },
    articles: { type: Array, default: () => [] }
  },
  setup(__props) {
    var _a;
    const props = __props;
    const regions = ((_a = usePage().props.nav) == null ? void 0 : _a.regions) || [];
    Object.fromEntries(regions.map((r) => [r.slug, r.label]));
    const query = ref(props.q);
    const rubFilter = ref("all");
    const input = ref(null);
    const sorted = computed(() => [...props.articles].sort((a, b) => b.date.localeCompare(a.date)));
    const terms = computed(() => norm(query.value).split(/\s+/).filter(Boolean));
    const results = computed(() => {
      if (!terms.value.length) return sorted.value;
      return sorted.value.filter((a) => {
        const hay = norm([a.title, a.chapo, a.country, a.author, a.rub_label, a.region_label, (a.tags || []).join(" "), (a.body || []).join(" ")].join(" "));
        return terms.value.every((t) => hay.includes(t));
      });
    });
    const rubs = computed(() => {
      const seen = [];
      results.value.forEach((a) => {
        if (!seen.includes(a.rub)) seen.push(a.rub);
      });
      return seen;
    });
    watch(rubs, () => {
      if (rubFilter.value !== "all" && !rubs.value.includes(rubFilter.value)) rubFilter.value = "all";
    });
    const shown = computed(() => rubFilter.value === "all" ? results.value : results.value.filter((a) => a.rub === rubFilter.value));
    function parts(text) {
      const raw = fr(text);
      const t = terms.value.filter((x) => x.length >= 2);
      if (!t.length) return [{ mark: false, text: raw }];
      const re = new RegExp("(" + t.map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")", "gi");
      const out = [];
      let last = 0, m;
      while (m = re.exec(raw)) {
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
        router.get("/recherche", query.value.trim() ? { q: query.value.trim() } : {}, { preserveState: true, preserveScroll: true, replace: true });
      }, 300);
    });
    const suggestions = ["Cameroun", "Sahel", "Climat", "Football", "Paiement mobile"];
    onMounted(() => {
      if (!props.q && input.value) input.value.focus();
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container-xl aq-page-head mb-5" }, _attrs))}>`);
      _push(ssrRenderComponent(_sfc_main$g, { items: [{ label: "Recherche" }] }, null, _parent));
      _push(`<h1 class="visually-hidden">Rechercher sur Afriquinfos</h1><form role="search"><label class="visually-hidden" for="bigq">Rechercher sur Afriquinfos</label><div class="aq-bigsearch"><i class="bi bi-search" aria-hidden="true"></i><input id="bigq" name="q" type="search" autocomplete="off" placeholder="Un pays, un sujet, une personnalité…"${ssrRenderAttr("value", query.value)}></div></form><p class="fw-semibold" role="status">${ssrInterpolate(query.value.trim() ? results.value.length + " résultat" + (results.value.length > 1 ? "s" : "") + " pour « " + query.value.trim() + " »" : "Toute l’actualité, de la plus récente à la plus ancienne")}</p>`);
      if (results.value.length) {
        _push(`<div class="aq-filters" role="group" aria-label="Filtrer par rubrique"><button type="button"${ssrRenderAttr("aria-pressed", rubFilter.value === "all")}>Tout<small>${ssrInterpolate(results.value.length)}</small></button><!--[-->`);
        ssrRenderList(rubs.value, (r) => {
          var _a2;
          _push(`<button type="button"${ssrRenderAttr("aria-pressed", rubFilter.value === r)}>${ssrInterpolate((_a2 = results.value.find((a) => a.rub === r)) == null ? void 0 : _a2.rub_label)}<small>${ssrInterpolate(results.value.filter((a) => a.rub === r).length)}</small></button>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div><!--[-->`);
      ssrRenderList(shown.value, (a) => {
        _push(`<article class="aq-result aq-fade">`);
        _push(ssrRenderComponent(unref(Link), {
          href: a.url
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="aq-media aq-media--cut"${_scopeId}>`);
              _push2(ssrRenderComponent(_sfc_main$c, { a }, null, _parent2, _scopeId));
              _push2(`</div><div${_scopeId}><span class="aq-card__place"${_scopeId}>${ssrInterpolate(unref(fr)(unref(kicker)(a, "rub")))}</span><h3${_scopeId}><!--[-->`);
              ssrRenderList(parts(a.title), (p, i) => {
                _push2(`<!--[-->`);
                if (p.mark) {
                  _push2(`<mark${_scopeId}>${ssrInterpolate(p.text)}</mark>`);
                } else {
                  _push2(`<!--[-->${ssrInterpolate(p.text)}<!--]-->`);
                }
                _push2(`<!--]-->`);
              });
              _push2(`<!--]--></h3><p${_scopeId}><!--[-->`);
              ssrRenderList(parts(a.chapo), (p, i) => {
                _push2(`<!--[-->`);
                if (p.mark) {
                  _push2(`<mark${_scopeId}>${ssrInterpolate(p.text)}</mark>`);
                } else {
                  _push2(`<!--[-->${ssrInterpolate(p.text)}<!--]-->`);
                }
                _push2(`<!--]-->`);
              });
              _push2(`<!--]--></p><time class="aq-card__meta"${_scopeId}>${ssrInterpolate(unref(rel)(a.date))}</time></div>`);
            } else {
              return [
                createVNode("div", { class: "aq-media aq-media--cut" }, [
                  createVNode(_sfc_main$c, { a }, null, 8, ["a"])
                ]),
                createVNode("div", null, [
                  createVNode("span", { class: "aq-card__place" }, toDisplayString(unref(fr)(unref(kicker)(a, "rub"))), 1),
                  createVNode("h3", null, [
                    (openBlock(true), createBlock(Fragment, null, renderList(parts(a.title), (p, i) => {
                      return openBlock(), createBlock(Fragment, { key: i }, [
                        p.mark ? (openBlock(), createBlock("mark", { key: 0 }, toDisplayString(p.text), 1)) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                          createTextVNode(toDisplayString(p.text), 1)
                        ], 64))
                      ], 64);
                    }), 128))
                  ]),
                  createVNode("p", null, [
                    (openBlock(true), createBlock(Fragment, null, renderList(parts(a.chapo), (p, i) => {
                      return openBlock(), createBlock(Fragment, { key: i }, [
                        p.mark ? (openBlock(), createBlock("mark", { key: 0 }, toDisplayString(p.text), 1)) : (openBlock(), createBlock(Fragment, { key: 1 }, [
                          createTextVNode(toDisplayString(p.text), 1)
                        ], 64))
                      ], 64);
                    }), 128))
                  ]),
                  createVNode("time", { class: "aq-card__meta" }, toDisplayString(unref(rel)(a.date)), 1)
                ])
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</article>`);
      });
      _push(`<!--]-->`);
      if (!shown.value.length) {
        _push(`<div class="aq-empty"><h2>Aucun résultat</h2><p>Vérifiez l’orthographe ou essayez un mot plus général, par exemple un pays ou une rubrique : <!--[-->`);
        ssrRenderList(suggestions, (s) => {
          _push(`<a class="aq-more" href="#">${ssrInterpolate(s)}</a>`);
        });
        _push(`<!--]--></p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Recherche.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __vite_glob_0_8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _sfc_main$2
}, Symbol.toStringTag, { value: "Module" }));
const PAGE_SIZE = 6;
const _sfc_main$1 = {
  __name: "Rubrique",
  __ssrInlineRender: true,
  props: {
    mode: { type: String, required: true },
    // rubrique | region | afriques
    slug: { type: String, required: true },
    title: { type: String, required: true },
    tagline: { type: String, default: "" },
    articles: { type: Array, default: () => [] },
    top: { type: Array, default: () => [] }
  },
  setup(__props) {
    const props = __props;
    const nav = usePage().props.nav;
    const rubLabels = Object.fromEntries(((nav == null ? void 0 : nav.rubriques) || []).map((r) => [r.slug, r.label]));
    rubLabels.portraits = "Portraits";
    const regionLabels = Object.fromEntries(((nav == null ? void 0 : nav.regions) || []).map((r) => [r.slug, r.label]));
    const crumb = computed(() => {
      if (props.mode === "region") return [{ label: "Les Afriques", href: "/afriques" }, { label: props.title }];
      return [{ label: props.title }];
    });
    const flash = computed(() => props.articles.slice(0, 5).map((a) => ({ text: a.title, url: a.url })));
    const filterKey = computed(() => props.mode === "rubrique" ? "region" : "rub");
    const filterLabel = (v) => (filterKey.value === "region" ? regionLabels[v] : rubLabels[v]) || v;
    const chips = computed(() => {
      const seen = [];
      props.articles.forEach((a) => {
        const v = a[filterKey.value];
        if (v && !seen.includes(v)) seen.push(v);
      });
      return seen.map((v) => ({ value: v, label: filterLabel(v), count: props.articles.filter((a) => a[filterKey.value] === v).length }));
    });
    const filter = ref("all");
    const shown = ref(0);
    const current = computed(() => filter.value === "all" ? props.articles : props.articles.filter((a) => a[filterKey.value] === filter.value));
    const lead = computed(() => current.value[0]);
    const grid = computed(() => current.value.slice(1, 1 + shown.value + PAGE_SIZE));
    const moreLeft = computed(() => current.value.length - 1 > grid.value.length);
    const top5 = computed(() => (props.articles.length >= 3 ? props.articles : props.top).slice().sort((a, b) => b.views - a.views).slice(0, 5));
    const kickerMode = computed(() => props.mode === "rubrique" ? null : "rub");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[-->`);
      if (__props.slug !== "tips") {
        _push(ssrRenderComponent(FlashBar, { items: flash.value }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="aq-pagehero"><div class="container-xl">`);
      _push(ssrRenderComponent(_sfc_main$g, { items: crumb.value }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$h, {
        title: __props.title,
        tagline: __props.tagline,
        level: 1
      }, null, _parent));
      _push(`</div></div><div class="container-xl"><div class="row g-5"><div class="col-lg-8">`);
      if (chips.value.length > 1) {
        _push(`<div class="aq-filters" role="group" aria-label="Filtrer"><button type="button"${ssrRenderAttr("aria-pressed", filter.value === "all")}>Tout<small>${ssrInterpolate(__props.articles.length)}</small></button><!--[-->`);
        ssrRenderList(chips.value, (c) => {
          _push(`<button type="button"${ssrRenderAttr("aria-pressed", filter.value === c.value)}>${ssrInterpolate(c.label)}<small>${ssrInterpolate(c.count)}</small></button>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      if (lead.value) {
        _push(`<article class="aq-lead aq-fade">`);
        _push(ssrRenderComponent(unref(Link), {
          href: lead.value.url
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="aq-media aq-media--cut aq-media--wide"${_scopeId}>`);
              _push2(ssrRenderComponent(_sfc_main$c, { a: lead.value }, null, _parent2, _scopeId));
              _push2(`</div><span class="aq-card__place mt-3"${_scopeId}>${ssrInterpolate(unref(fr)(unref(kicker)(lead.value, kickerMode.value)))}</span><h2 class="aq-lead__title mt-1"${_scopeId}>${ssrInterpolate(unref(fr)(lead.value.title))}</h2><p class="aq-lead__text"${_scopeId}>${ssrInterpolate(unref(fr)(lead.value.chapo))}</p>`);
            } else {
              return [
                createVNode("div", { class: "aq-media aq-media--cut aq-media--wide" }, [
                  createVNode(_sfc_main$c, { a: lead.value }, null, 8, ["a"])
                ]),
                createVNode("span", { class: "aq-card__place mt-3" }, toDisplayString(unref(fr)(unref(kicker)(lead.value, kickerMode.value))), 1),
                createVNode("h2", { class: "aq-lead__title mt-1" }, toDisplayString(unref(fr)(lead.value.title)), 1),
                createVNode("p", { class: "aq-lead__text" }, toDisplayString(unref(fr)(lead.value.chapo)), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</article>`);
      } else {
        _push(`<p class="aq-empty">Aucun article pour ce filtre. Choisissez « Tout » pour tout afficher.</p>`);
      }
      _push(`<div class="row g-4 mt-1" aria-live="polite"><!--[-->`);
      ssrRenderList(grid.value, (a) => {
        _push(ssrRenderComponent(_sfc_main$b, {
          key: a.id,
          a,
          col: "col-md-6 aq-fade",
          "kicker-mode": kickerMode.value
        }, null, _parent));
      });
      _push(`<!--]--></div><div class="aq-loadmore">`);
      if (moreLeft.value) {
        _push(`<button type="button" class="aq-btn aq-btn--outline">Afficher plus d’articles</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><aside class="col-lg-4"><div class="aq-sticky"><div class="aq-side-box"><h2>Les plus lus</h2><ol class="aq-top5"><!--[-->`);
      ssrRenderList(top5.value, (a) => {
        _push(`<li>`);
        _push(ssrRenderComponent(unref(Link), {
          href: a.url
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span${_scopeId}>${ssrInterpolate(unref(fr)(a.title))}</span>`);
            } else {
              return [
                createVNode("span", null, toDisplayString(unref(fr)(a.title)), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</li>`);
      });
      _push(`<!--]--></ol></div>`);
      _push(ssrRenderComponent(_sfc_main$d, {
        slot: "pave",
        variant: "pave"
      }, null, _parent));
      _push(ssrRenderComponent(_sfc_main$d, {
        slot: "sky",
        variant: "sky"
      }, null, _parent));
      _push(`</div></aside></div></div>`);
      _push(ssrRenderComponent(_sfc_main$a, null, null, _parent));
      _push(`<!--]-->`);
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Pages/Rubrique.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __vite_glob_0_9 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: _sfc_main$1
}, Symbol.toStringTag, { value: "Module" }));
const social = `
    <a href="https://www.facebook.com/afriquinfoscom/" aria-label="Afriquinfos sur Facebook" rel="noopener"><i class="bi bi-facebook" aria-hidden="true"></i></a>
    <a href="https://x.com/AfriquinfosActu" aria-label="Afriquinfos sur X" rel="noopener"><i class="bi bi-twitter-x" aria-hidden="true"></i></a>`;
const REVEAL_SEL = ".aq-section .row > *, .aq-lead, .aq-stack__item, .aq-poster, .aq-portrait, .aq-tip, .aq-tribune, .aq-filrow__list li, .aq-agenda-row > *, .aq-debate, .aq-newsletter, .aq-legal__doc > section";
const _sfc_main = {
  __name: "SiteLayout",
  __ssrInlineRender: true,
  setup(__props) {
    const page = usePage();
    const logoAsset = (p) => {
      var _a;
      return ((_a = page.props.siteAssets) == null ? void 0 : _a[p]) || asset(p);
    };
    const nav = computed(() => page.props.nav);
    const url = computed(() => page.url);
    const today = todayLong();
    const theme = ref(typeof document !== "undefined" ? document.documentElement.getAttribute("data-theme") || "light" : "light");
    const isDark = computed(() => theme.value === "dark");
    const urlRub = (r) => r === "portraits" ? "/portraits" : "/rubrique/" + r;
    const urlRegion = (g) => "/afriques/" + g;
    const cur = (key) => url.value.startsWith("/rubrique/" + key) || key === "portraits" && url.value.startsWith("/portraits") || key === "afriques" && url.value.startsWith("/afriques") ? "page" : null;
    const menuRubs = computed(() => {
      var _a;
      return (((_a = nav.value) == null ? void 0 : _a.rubriques) || []).filter((r) => !["tips", "portraits", "les-afriques"].includes(r.slug));
    });
    const year = (/* @__PURE__ */ new Date()).getFullYear();
    const showTop = ref(false);
    const reduceMotion2 = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lastScrollY = 0;
    function onScroll() {
      var _a;
      showTop.value = window.scrollY > 600;
      const navEl = document.getElementById("mainNav");
      if (navEl) {
        const y = window.scrollY;
        navEl.classList.toggle("is-tucked", y > 200 && y > lastScrollY && !((_a = document.getElementById("menu")) == null ? void 0 : _a.classList.contains("show")));
        lastScrollY = y;
      }
    }
    let revealObs = null;
    function initReveals() {
      if (reduceMotion2 || !("IntersectionObserver" in window)) return;
      revealObs == null ? void 0 : revealObs.disconnect();
      revealObs = new IntersectionObserver((entries) => {
        let batch = 0;
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.style.setProperty("--rd", Math.min(batch++ * 60, 300) + "ms");
          e.target.classList.add("is-in");
          revealObs.unobserve(e.target);
        });
      }, { rootMargin: "0px 0px -4% 0px", threshold: 0.02 });
      document.querySelectorAll(REVEAL_SEL).forEach((el) => {
        if (el.classList.contains("is-in")) return;
        el.classList.add("aq-reveal");
        revealObs.observe(el);
      });
    }
    onMounted(() => {
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      const navEl = document.getElementById("mainNav");
      const head = document.querySelector(".aq-head");
      if (navEl && head && "IntersectionObserver" in window) {
        new IntersectionObserver((e) => navEl.classList.toggle("is-stuck", !e[0].isIntersecting)).observe(head);
      }
      const dd = document.querySelector(".aq-menu .dropdown");
      function hoverDropdown() {
        if (!dd || !window.bootstrap || !window.matchMedia("(hover: hover) and (min-width: 992px)").matches) return;
        const t = dd.querySelector(".dropdown-toggle");
        const inst = window.bootstrap.Dropdown.getOrCreateInstance(t);
        let timer;
        dd.addEventListener("mouseenter", () => {
          clearTimeout(timer);
          inst.show();
        });
        dd.addEventListener("mouseleave", () => {
          timer = setTimeout(() => inst.hide(), 150);
        });
      }
      if (window.bootstrap) hoverDropdown();
      else window.addEventListener("load", hoverDropdown);
      setTimeout(initReveals, 60);
    });
    watch(() => page.url, () => setTimeout(initReveals, 80));
    const consent = ref(store("aq-consent"));
    onUnmounted(() => {
      window.removeEventListener("scroll", onScroll);
      revealObs == null ? void 0 : revealObs.disconnect();
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      _push(`<!--[--><a class="visually-hidden-focusable aq-skip" href="#contenu" data-v-bce39505>Aller au contenu</a><div class="aq-top" data-v-bce39505><div class="container-xl" data-v-bce39505><span class="aq-top__date" data-v-bce39505>${ssrInterpolate(unref(today))}</span><nav aria-label="Liens utiles" data-v-bce39505>`);
      _push(ssrRenderComponent(unref(Link), {
        class: "d-none d-sm-inline",
        href: "/portraits",
        "aria-current": url.value === "/portraits" ? "page" : null
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Portraits`);
          } else {
            return [
              createTextVNode("Portraits")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(unref(Link), {
        class: "d-none d-sm-inline",
        href: "/agendas",
        "aria-current": url.value === "/agendas" ? "page" : null
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Agendas`);
          } else {
            return [
              createTextVNode("Agendas")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(unref(Link), {
        class: "d-none d-md-inline",
        href: "/contact",
        "aria-current": url.value === "/contact" ? "page" : null
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Contact`);
          } else {
            return [
              createTextVNode("Contact")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<a class="d-none d-md-inline" href="/rss.xml" data-v-bce39505><i class="bi bi-rss" aria-hidden="true" data-v-bce39505></i> RSS</a><span class="aq-social aq-social--top d-none d-lg-flex" data-v-bce39505>${social}</span><button class="aq-theme" type="button"${ssrRenderAttr("aria-pressed", isDark.value)} data-v-bce39505><i class="${ssrRenderClass([isDark.value ? "bi-sun" : "bi-moon-stars", "bi"])}" aria-hidden="true" data-v-bce39505></i><span data-v-bce39505>${ssrInterpolate(isDark.value ? "Clair" : "Sombre")}</span></button></nav></div></div><header class="aq-head" data-v-bce39505><div class="container-xl aq-head__row" data-v-bce39505><button class="aq-icon d-lg-none" type="button" data-bs-toggle="offcanvas" data-bs-target="#menu" aria-controls="menu" aria-label="Ouvrir le menu" data-v-bce39505><i class="bi bi-list" aria-hidden="true" data-v-bce39505></i></button>`);
      _push(ssrRenderComponent(unref(Link), {
        class: "aq-head__brand",
        href: "/",
        "aria-label": "Afriquinfos, accueil"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<picture class="aq-logo--light" data-v-bce39505${_scopeId}><source media="(max-width: 575.98px)"${ssrRenderAttr("srcset", logoAsset("assets/img/logo-compact.png"))} width="600" height="158" data-v-bce39505${_scopeId}><img${ssrRenderAttr("src", logoAsset("assets/img/logo-afriquinfos.png"))} alt="Afriquinfos — Ni totems, ni tabous" width="600" height="214" data-v-bce39505${_scopeId}></picture><picture class="aq-logo--dark" data-v-bce39505${_scopeId}><source media="(max-width: 575.98px)"${ssrRenderAttr("srcset", logoAsset("assets/img/logo-compact-negatif.png"))} width="600" height="158" data-v-bce39505${_scopeId}><img${ssrRenderAttr("src", logoAsset("assets/img/logo-afriquinfos-negatif.png"))} alt="Afriquinfos — Ni totems, ni tabous" width="600" height="214" loading="lazy" data-v-bce39505${_scopeId}></picture>`);
          } else {
            return [
              createVNode("picture", { class: "aq-logo--light" }, [
                createVNode("source", {
                  media: "(max-width: 575.98px)",
                  srcset: logoAsset("assets/img/logo-compact.png"),
                  width: "600",
                  height: "158"
                }, null, 8, ["srcset"]),
                createVNode("img", {
                  src: logoAsset("assets/img/logo-afriquinfos.png"),
                  alt: "Afriquinfos — Ni totems, ni tabous",
                  width: "600",
                  height: "214"
                }, null, 8, ["src"])
              ]),
              createVNode("picture", { class: "aq-logo--dark" }, [
                createVNode("source", {
                  media: "(max-width: 575.98px)",
                  srcset: logoAsset("assets/img/logo-compact-negatif.png"),
                  width: "600",
                  height: "158"
                }, null, 8, ["srcset"]),
                createVNode("img", {
                  src: logoAsset("assets/img/logo-afriquinfos-negatif.png"),
                  alt: "Afriquinfos — Ni totems, ni tabous",
                  width: "600",
                  height: "214",
                  loading: "lazy"
                }, null, 8, ["src"])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<form class="aq-searchbar d-none d-lg-block" action="/recherche" role="search" data-v-bce39505><i class="bi bi-search" aria-hidden="true" data-v-bce39505></i><label class="visually-hidden" for="hq" data-v-bce39505>Rechercher</label><input id="hq" name="q" type="search" placeholder="Rechercher une actualité, un pays, un sujet…" data-v-bce39505></form><a class="aq-btn aq-btn--primary aq-head__cta d-none d-lg-inline-flex" href="/#newsletter" data-v-bce39505><i class="bi bi-envelope" aria-hidden="true" data-v-bce39505></i>Recevoir le brief</a>`);
      _push(ssrRenderComponent(unref(Link), {
        class: "aq-icon d-lg-none",
        href: "/recherche",
        "aria-label": "Rechercher"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<i class="bi bi-search" aria-hidden="true" data-v-bce39505${_scopeId}></i>`);
          } else {
            return [
              createVNode("i", {
                class: "bi bi-search",
                "aria-hidden": "true"
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></header>`);
      _push(ssrRenderComponent(_sfc_main$d, {
        slot: "mobile",
        variant: "mobile"
      }, null, _parent));
      _push(`<nav class="aq-mainnav" id="mainNav" aria-label="Rubriques" data-v-bce39505><div class="container-xl" data-v-bce39505>`);
      _push(ssrRenderComponent(unref(Link), {
        class: "aq-mainnav__mini",
        href: "/",
        "aria-label": "Afriquinfos, accueil"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<img${ssrRenderAttr("src", logoAsset("assets/img/logo-compact-negatif.png"))} alt="" width="600" height="158" loading="lazy" data-v-bce39505${_scopeId}>`);
          } else {
            return [
              createVNode("img", {
                src: logoAsset("assets/img/logo-compact-negatif.png"),
                alt: "",
                width: "600",
                height: "158",
                loading: "lazy"
              }, null, 8, ["src"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<ul class="aq-menu d-none d-lg-flex" data-v-bce39505><!--[-->`);
      ssrRenderList(menuRubs.value, (r) => {
        _push(`<li data-v-bce39505>`);
        _push(ssrRenderComponent(unref(Link), {
          href: urlRub(r.slug),
          "aria-current": cur(r.slug)
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(r.label)}`);
            } else {
              return [
                createTextVNode(toDisplayString(r.label), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</li>`);
      });
      _push(`<!--]--><li class="dropdown" data-v-bce39505><a href="/afriques" class="dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" role="button"${ssrRenderAttr("aria-current", cur("afriques"))} data-v-bce39505>Les Afriques <i class="bi bi-chevron-down" aria-hidden="true" data-v-bce39505></i></a><ul class="dropdown-menu aq-dropdown" data-v-bce39505><li data-v-bce39505><a class="dropdown-item dropdown-item--all" href="/afriques" data-v-bce39505>Toutes les Afriques</a></li><!--[-->`);
      ssrRenderList(((_a = nav.value) == null ? void 0 : _a.regions) || [], (g) => {
        _push(`<li data-v-bce39505><a class="dropdown-item"${ssrRenderAttr("href", urlRegion(g.slug))}${ssrRenderAttr("aria-current", url.value === urlRegion(g.slug) ? "page" : null)} data-v-bce39505>${ssrInterpolate(g.label)}</a></li>`);
      });
      _push(`<!--]--></ul></li><li data-v-bce39505>`);
      _push(ssrRenderComponent(unref(Link), {
        href: "/rubrique/tips",
        "aria-current": cur("tips")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Tips`);
          } else {
            return [
              createTextVNode("Tips")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li></ul><div class="aq-menu-scroll d-lg-none" data-v-bce39505><!--[-->`);
      ssrRenderList(menuRubs.value, (r) => {
        _push(ssrRenderComponent(unref(Link), {
          key: r.slug,
          href: urlRub(r.slug),
          "aria-current": cur(r.slug)
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(r.label)}`);
            } else {
              return [
                createTextVNode(toDisplayString(r.label), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]-->`);
      _push(ssrRenderComponent(unref(Link), {
        href: "/afriques",
        "aria-current": cur("afriques")
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Les Afriques`);
          } else {
            return [
              createTextVNode("Les Afriques")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(unref(Link), { href: "/rubrique/tips" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Tips`);
          } else {
            return [
              createTextVNode("Tips")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(unref(Link), { href: "/portraits" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Portraits`);
          } else {
            return [
              createTextVNode("Portraits")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="aq-mainnav__tools ms-auto" data-v-bce39505>`);
      _push(ssrRenderComponent(unref(Link), {
        class: "aq-icon aq-icon--light aq-mainnav__search",
        href: "/recherche",
        "aria-label": "Rechercher"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<i class="bi bi-search" aria-hidden="true" data-v-bce39505${_scopeId}></i>`);
          } else {
            return [
              createVNode("i", {
                class: "bi bi-search",
                "aria-hidden": "true"
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></nav><div class="offcanvas offcanvas-start aq-offcanvas" tabindex="-1" id="menu" aria-labelledby="menuTitre" data-v-bce39505><div class="offcanvas-header" data-v-bce39505><h2 class="visually-hidden" id="menuTitre" data-v-bce39505>Menu</h2><img${ssrRenderAttr("src", logoAsset("assets/img/logo-compact-negatif.png"))} alt="Afriquinfos" width="129" height="34" loading="lazy" data-v-bce39505><button type="button" class="aq-icon aq-icon--light" data-bs-dismiss="offcanvas" aria-label="Fermer le menu" data-v-bce39505><i class="bi bi-x-lg" aria-hidden="true" data-v-bce39505></i></button></div><div class="offcanvas-body" data-v-bce39505><form class="aq-searchbar mb-3" action="/recherche" role="search" data-v-bce39505><i class="bi bi-search" aria-hidden="true" data-v-bce39505></i><label class="visually-hidden" for="mq" data-v-bce39505>Rechercher</label><input id="mq" name="q" type="search" placeholder="Rechercher…" data-v-bce39505></form><nav class="aq-offcanvas__nav" aria-label="Rubriques" data-v-bce39505><!--[-->`);
      ssrRenderList(menuRubs.value, (r) => {
        _push(ssrRenderComponent(unref(Link), {
          key: r.slug,
          href: urlRub(r.slug)
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(r.label)}`);
            } else {
              return [
                createTextVNode(toDisplayString(r.label), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]-->`);
      _push(ssrRenderComponent(unref(Link), { href: "/afriques" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Les Afriques`);
          } else {
            return [
              createTextVNode("Les Afriques")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<!--[-->`);
      ssrRenderList(((_b = nav.value) == null ? void 0 : _b.regions) || [], (g) => {
        _push(ssrRenderComponent(unref(Link), {
          key: g.slug,
          class: "is-sub",
          href: urlRegion(g.slug)
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(g.label)}`);
            } else {
              return [
                createTextVNode(toDisplayString(g.label), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]-->`);
      _push(ssrRenderComponent(unref(Link), { href: "/rubrique/tips" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Tips`);
          } else {
            return [
              createTextVNode("Tips")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</nav><p class="aq-offcanvas__label" data-v-bce39505>Afriquinfos</p><nav class="aq-offcanvas__nav" aria-label="Liens utiles" data-v-bce39505>`);
      _push(ssrRenderComponent(unref(Link), {
        class: "is-sub",
        href: "/portraits"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Portraits`);
          } else {
            return [
              createTextVNode("Portraits")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(unref(Link), {
        class: "is-sub",
        href: "/agendas"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Agendas`);
          } else {
            return [
              createTextVNode("Agendas")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(unref(Link), {
        class: "is-sub",
        href: "/contact"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Contact`);
          } else {
            return [
              createTextVNode("Contact")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<a class="is-sub" href="/rss.xml" data-v-bce39505>Flux RSS</a></nav><div class="aq-social mt-4" data-v-bce39505>${social}</div></div></div><main id="contenu" tabindex="-1" data-v-bce39505>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main><footer class="aq-footer" data-v-bce39505><div class="container-xl" data-v-bce39505><div class="aq-footer__top" data-v-bce39505><img${ssrRenderAttr("src", logoAsset("assets/img/logo-afriquinfos-negatif.png"))} alt="Afriquinfos — Ni totems, ni tabous. L’actualité panafricaine" width="600" height="214" loading="lazy" data-v-bce39505><div class="aq-social" data-v-bce39505><a href="https://www.facebook.com/afriquinfoscom/" aria-label="Afriquinfos sur Facebook" rel="noopener" data-v-bce39505><i class="bi bi-facebook" aria-hidden="true" data-v-bce39505></i></a><a href="https://x.com/AfriquinfosActu" aria-label="Afriquinfos sur X" rel="noopener" data-v-bce39505><i class="bi bi-twitter-x" aria-hidden="true" data-v-bce39505></i></a><a href="/rss.xml" aria-label="Flux RSS" data-v-bce39505><i class="bi bi-rss" aria-hidden="true" data-v-bce39505></i></a></div></div><div class="row g-4" data-v-bce39505><nav class="col-6 col-md-3" aria-label="Rubriques" data-v-bce39505><h2 data-v-bce39505>Rubriques</h2><!--[-->`);
      ssrRenderList(((_c = nav.value) == null ? void 0 : _c.rubriques) || [], (r) => {
        _push(ssrRenderComponent(unref(Link), {
          key: r.slug,
          href: urlRub(r.slug)
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(r.label)}`);
            } else {
              return [
                createTextVNode(toDisplayString(r.label), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></nav><nav class="col-6 col-md-3" aria-label="Les Afriques" data-v-bce39505><h2 data-v-bce39505>Les Afriques</h2><!--[-->`);
      ssrRenderList(((_d = nav.value) == null ? void 0 : _d.regions) || [], (g) => {
        _push(ssrRenderComponent(unref(Link), {
          key: g.slug,
          href: urlRegion(g.slug)
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(g.label)}`);
            } else {
              return [
                createTextVNode(toDisplayString(g.label), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></nav><nav class="col-6 col-md-3" aria-label="Afriquinfos" data-v-bce39505><h2 data-v-bce39505>Afriquinfos</h2>`);
      _push(ssrRenderComponent(unref(Link), { href: "/portraits" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Portraits`);
          } else {
            return [
              createTextVNode("Portraits")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(unref(Link), { href: "/agendas" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Agendas`);
          } else {
            return [
              createTextVNode("Agendas")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(unref(Link), { href: "/contact" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Contact`);
          } else {
            return [
              createTextVNode("Contact")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<a href="/rss.xml" data-v-bce39505>Flux RSS</a></nav><nav class="col-6 col-md-3" aria-label="Annonceurs" data-v-bce39505><h2 data-v-bce39505>Annonceurs</h2>`);
      _push(ssrRenderComponent(unref(Link), { href: "/contact?sujet=publicite" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Kit média`);
          } else {
            return [
              createTextVNode("Kit média")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(unref(Link), { href: "/contact?sujet=publicite" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Publicité`);
          } else {
            return [
              createTextVNode("Publicité")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(unref(Link), { href: "/contact?sujet=publicite" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Contenus de marque`);
          } else {
            return [
              createTextVNode("Contenus de marque")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</nav></div><div class="aq-footer__bottom" data-v-bce39505><span data-v-bce39505>© ${ssrInterpolate(unref(year))} Afriquinfos. Tous droits réservés.</span><span data-v-bce39505>`);
      _push(ssrRenderComponent(unref(Link), { href: "/mentions-legales" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Mentions légales`);
          } else {
            return [
              createTextVNode("Mentions légales")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(unref(Link), { href: "/confidentialite" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Confidentialité`);
          } else {
            return [
              createTextVNode("Confidentialité")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(unref(Link), { href: "/cookies" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Cookies`);
          } else {
            return [
              createTextVNode("Cookies")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</span></div></div></footer>`);
      if (!consent.value) {
        _push(`<div class="aq-consent" role="dialog" aria-label="Consentement aux cookies" aria-describedby="aqConsentTxt" data-v-bce39505><div class="aq-consent__txt" data-v-bce39505><i class="bi bi-cookie" aria-hidden="true" data-v-bce39505></i><p id="aqConsentTxt" data-v-bce39505>Afriquinfos utilise des cookies pour assurer le fonctionnement du site, mémoriser vos préférences et mesurer l’audience. `);
        _push(ssrRenderComponent(unref(Link), { href: "/cookies" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`En savoir plus`);
            } else {
              return [
                createTextVNode("En savoir plus")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</p></div><div class="aq-consent__btns" data-v-bce39505><button type="button" class="aq-consent__btn aq-consent__btn--ghost" data-v-bce39505>Tout refuser</button><button type="button" class="aq-consent__btn aq-consent__btn--accept" data-v-bce39505>Tout accepter</button></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button type="button" class="${ssrRenderClass([{ "is-on": showTop.value }, "aq-totop"])}" aria-label="Retour en haut de page" title="Retour en haut" data-v-bce39505><i class="bi bi-arrow-up" aria-hidden="true" data-v-bce39505></i></button><!--]-->`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("resources/js/Layouts/SiteLayout.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const SiteLayout = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-bce39505"]]);
createServer(
  (page) => createInertiaApp({
    page,
    render: renderToString,
    resolve: (name) => {
      const pages = /* @__PURE__ */ Object.assign({ "./Pages/Admin/AcceptInvite.vue": __vite_glob_0_0, "./Pages/Admin/Login.vue": __vite_glob_0_1, "./Pages/Agendas.vue": __vite_glob_0_2, "./Pages/Article.vue": __vite_glob_0_3, "./Pages/Contact.vue": __vite_glob_0_4, "./Pages/Home.vue": __vite_glob_0_5, "./Pages/Legal.vue": __vite_glob_0_6, "./Pages/Portraits.vue": __vite_glob_0_7, "./Pages/Recherche.vue": __vite_glob_0_8, "./Pages/Rubrique.vue": __vite_glob_0_9 });
      const p = pages[`./Pages/${name}.vue`];
      if (p.default.layout === void 0) {
        p.default.layout = name === "Admin/Login" ? void 0 : SiteLayout;
      }
      return p;
    },
    setup({ App, props, plugin }) {
      return createSSRApp({ render: () => h(App, props) }).use(plugin);
    }
  })
);
