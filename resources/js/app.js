import { createApp, h } from 'vue';
import { createInertiaApp, router } from '@inertiajs/vue3';
import SiteLayout from './Layouts/SiteLayout.vue';

router.on('navigate', () => {
    if (window.AQ_GA_ID && typeof window.gtag === 'function') {
        window.gtag('event', 'page_view', {
            send_to: window.AQ_GA_ID,
            page_title: document.title,
            page_location: window.location.href,
            page_path: window.location.pathname + window.location.search,
        });
    }
});

createInertiaApp({
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.vue', { eager: true });
        const page = pages[`./Pages/${name}.vue`];
        if (page.default.layout === undefined) {
            page.default.layout = name === 'Admin/Login' ? undefined : SiteLayout;
        }
        return page;
    },
    setup({ el, App, props, plugin }) {
        createApp({ render: () => h(App, props) })
            .use(plugin)
            .mount(el);
    },
    progress: { color: '#de5011' },
});
