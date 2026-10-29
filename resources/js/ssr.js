import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { createInertiaApp } from '@inertiajs/vue3';
import createServer from '@inertiajs/vue3/server';
import SiteLayout from './Layouts/SiteLayout.vue';

createServer((page) =>
    createInertiaApp({
        page,
        render: renderToString,
        resolve: (name) => {
            const pages = import.meta.glob('./Pages/**/*.vue', { eager: true });
            const p = pages[`./Pages/${name}.vue`];
            if (p.default.layout === undefined) {
                p.default.layout = name === 'Admin/Login' ? undefined : SiteLayout;
            }
            return p;
        },
        setup({ App, props, plugin }) {
            return createSSRApp({ render: () => h(App, props) }).use(plugin);
        },
    }),
);
