# Afriquinfos — Laravel + Inertia + Vue 3 (SSR)

Média panafricain reconstruit depuis la maquette statique (`assets/js/data.js`, `app.js`, `admin/`).

## Stack

- **Laravel 13** + **Inertia.js** (`inertia-laravel` v3) + **Vue 3** + **Vite 5** (Node 18)
- **SSR** : `bootstrap/ssr/ssr.js` servi par `node` sur `127.0.0.1:13714` (config `inertia.ssr`)
- **BDD** : MySQL/MariaDB XAMPP (`afriquinfos`), socket `/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock`
- Design repris de la maquette : `public/assets/css/afriquinfos.css`, `admin.css`, images `public/assets/img`

## Commandes

```bash
php artisan migrate:fresh --seed    # BDD + données de démo
npm run build && npm run build:ssr  # assets client + bundle SSR
php artisan serve                   # site → http://localhost:8000
npm run ssr                         # serveur SSR (obligatoire en prod pour le SEO)
npm run dev:all                     # dev : serve + vite + ssr ensemble
```

Compte admin de démo : `awa.kone@afriquinfos.com` / `afriquinfos` → `/admin`

## Architecture

- `app/Http/Controllers/FrontController.php` : pages publiques (home, rubrique, afriques, article, portraits, agendas, recherche, contact). Chaque `Inertia::render` passe `withViewData(['meta' => ...])` → title/description/OG/canonical/JSON-LD côté serveur dans `resources/views/app.blade.php`.
- `SeoController` : `/rss.xml`, `/sitemap.xml` (robots.txt dans `public/`).
- `FormController` : contact, newsletter, vote débat.
- `Admin/*` : `AuthController` (session, page de login Inertia `Admin/Login`), `AdminStateController` — l'admin est la **maquette `admin/` servie telle quelle** (`resources/views/admin.blade.php` + `public/assets/js/admin.js`), hydratée par `window.AQ_STATE` depuis la BDD ; `save()` poste uniquement les articles et sections modifiés vers `POST /admin/api/state`, avec contrôle de version et confirmation serveur.
- `resources/js/Pages` : pages Inertia du **front** (layout `SiteLayout`). L'admin n'est PAS en Inertia — ne pas recréer de pages `Pages/Admin/*` sauf `Admin/Login`.
- `resources/js/utils.js` : helpers FR (typographie, dates relatives).
- Articles : `body` = JSON de blocs (`## ` intertitre, `> ` citation), `person` = fiche portrait, `ph` = aplat de démonstration (`image_path` pour une vraie photo).

## Modèle de données

`rubriques` (slug PK), `regions` (slug PK), `articles` (slug unique, status : publie/programme/relecture/brouillon/corbeille), `events`, `comments`, `subscribers`, `debates`, `contact_messages`, `users` (+role, +status), `admin_data` (key→JSON : flash, medias, ads, campaigns, slots, settings, log, history).

## SEO

Metas par page rendues côté serveur + SSR complet, JSON-LD (NewsArticle, BreadcrumbList, NewsMediaOrganization), canonical, OG/Twitter, sitemap.xml, rss.xml, robots.txt.

## Vérifications et sécurité des données

- `php artisan test` utilise SQLite `:memory:` via `phpunit.xml`, indépendamment de la base MySQL locale.
- `node --test tests/Unit/AdminSync.test.cjs` vérifie les sauvegardes incrémentales et les modifications pendant une requête.
- `composer audit`, `node --check public/assets/js/admin.js`, `vendor/bin/pint --dirty --test` complètent les vérifications.
- Ne jamais exécuter `migrate:fresh`, les seeders ou `articles:fix-slugs --apply` sur une base contenant des données à préserver sans demande explicite.
- La synchronisation admin utilise désormais `protocol: 2`, des révisions par section et `baseUpdated` par article. Les anciens clients sont refusés avec HTTP 409 ; recharger les onglets après déploiement.
- La migration `2026_11_05_000001_create_admin_audit_events_table` ajoute uniquement la table du journal serveur. Déployer les dépendances Composer et appliquer cette migration avant de rouvrir l’administration.
