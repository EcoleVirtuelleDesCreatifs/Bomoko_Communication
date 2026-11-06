# Afriquinfos — Laravel + Inertia + Vue 3 (SSR)

Média panafricain reconstruit depuis la maquette statique (`assets/js/data.js`, `app.js`, `admin/`).

## Stack

- **Laravel 13** + **Inertia.js** (`inertia-laravel` v3) + **Vue 3** + **Vite 6.4.5** (compatible Node 18 ; privilégier un Node LTS maintenu pour les déploiements futurs)
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
- `SeoController` : `/rss.xml`, `/robots.txt`, `/sitemap.xml` (index), `/sitemaps/pages.xml` et `/sitemaps/articles-{page}.xml` (5 000 articles par page). Ces ressources sont dynamiques ; vérifier qu’aucun ancien fichier statique ni règle Nginx/CDN ne les masque.
- `FormController` : contact, newsletter, vote débat.
- `Admin/*` : `AuthController` (session, page de login Inertia `Admin/Login`), `AdminStateController` — l'admin est la **maquette `admin/` servie telle quelle** (`resources/views/admin.blade.php` + `public/assets/js/admin.js`), hydratée par `window.AQ_STATE` depuis la BDD ; `save()` poste uniquement les articles et sections modifiés vers `POST /admin/api/state`, avec contrôle de version et confirmation serveur.
- Les listes admin omettent volontairement `body`. `loadArticleContent()` charge le détail via `/admin/api/article/{slug}` pour l’aperçu et l’éditeur, sans ajouter le corps à toutes les lignes. Un aperçu ne doit pas modifier l’article ni compter une lecture publique ; une erreur de chargement ne doit jamais être remplacée par `body=[]`. `bigViewVersion` empêche une réponse d’aperçu tardive d’écraser une autre fenêtre.
- `resources/js/Pages` : pages Inertia du **front** (layout `SiteLayout`). L'admin n'est PAS en Inertia — ne pas recréer de pages `Pages/Admin/*` sauf `Admin/Login`.
- `resources/js/utils.js` : helpers FR (typographie, dates relatives).
- Les animations des photos d’accueil sont limitées à `.aq-home`. `createHomeMediaMotion()` utilise un seul observateur d’intersection, attend le chargement des images différées, ne prépare pas les photos du carrousel ni celles déjà dans le premier écran, et nettoie ses observateurs/écouteurs à la sortie. Rafraîchir après les filtres régionaux et respecter `prefers-reduced-motion`, y compris ses changements en cours de visite. Garder les formats et la priorité de chargement de la première photo inchangés.
- Articles : `body` = JSON de blocs (HTML riche ou anciens blocs `## ` intertitre, `> ` citation, `[img:…]`). L’éditeur doit conserver la structure HTML, sans conversion en texte simplifié ; `ArticleHtml` assure le nettoyage serveur et la résolution des images `data-mid`. `person` = fiche portrait, `ph` = aplat de démonstration (`image_path` pour une vraie photo).
- La lecture utilise une base fluide `--aq-article-size` (17–19 px avec une racine à 16 px), interligne 1,8 et colonne publique de 680 px maximum, centrée horizontalement sous l’image principale avec `margin-inline: auto` (sans centrer les lignes de texte). Justification et césure s’appliquent par défaut, avec préservation des attributs `align` explicites ; garder les styles du corps de texte identiques dans `.aq-prose`, `.ad-prose` et `.ad-editor__body`. Les boutons A−/A+ modifient seulement `--aq-article-size-adjustment`, pas la base responsive ; la préférence est bornée et l’ajustement est retiré à la sortie de la page.
- Le collage dans l’éditeur est normalisé avant affichage : paragraphes/sauts de ligne du texte brut et formatage HTML autorisé. Les styles de retours à la ligne `white-space: pre-wrap/pre-line/pre/break-spaces` sont convertis en `<br>` avant retrait des styles ; ne pas convertir les simples indentations du HTML ni les retours de `pre`/`code`. Le serveur préserve aussi gras, italique, soulignement et alignement sous forme sémantique, sans autoriser de CSS arbitraire ni réécrire les articles à la lecture.

## Modèle de données

- « International / Reste du monde » est une rubrique (`international`), pas une région africaine. La migration `2026_11_06_000001_add_international_rubrique` l’ajoute uniquement si ce slug manque, sans réaffecter les articles ni écraser une personnalisation existante. Elle est disponible dans l’admin même avec `in_menu=false` ; le menu public reste inchangé par défaut. Le rollback conserve cette donnée pour ne pas casser les classements.

`rubriques` (slug PK), `regions` (slug PK), `articles` (slug unique, status : publie/programme/relecture/brouillon/corbeille), `events`, `comments`, `subscribers`, `debates`, `contact_messages`, `users` (+role, +status), `admin_data` (key→JSON : flash, medias, ads, campaigns, slots, settings, log, history).

## SEO

Metas par page rendues côté serveur + SSR complet, JSON-LD (NewsArticle, BreadcrumbList, NewsMediaOrganization), canonical, OG/Twitter, sitemap.xml, rss.xml, robots.txt.

## Vérifications et sécurité des données

- `php artisan test` utilise SQLite `:memory:` via `phpunit.xml`, indépendamment de la base MySQL locale.
- `node --test tests/Unit/AdminSync.test.cjs` vérifie les sauvegardes incrémentales, les modifications pendant une requête, les allers-retours du HTML éditorial avec LinkeDOM et la cohérence des styles du corps de texte entre éditeur, aperçu et site public.
- `composer audit`, `node --check public/assets/js/admin.js`, `vendor/bin/pint --dirty --test` complètent les vérifications.
- Ne jamais exécuter `migrate:fresh`, les seeders ou `articles:fix-slugs --apply` sur une base contenant des données à préserver sans demande explicite.
- La synchronisation admin utilise désormais `protocol: 2`, des révisions par section et `baseUpdated` par article. Les anciens clients sont refusés avec HTTP 409 ; recharger les onglets après déploiement, après avoir copié tout texte non synchronisé.
- La publication immédiate reste réservée aux rôles `admin`/`chef`. Les journalistes peuvent programmer leurs propres articles ; les contributeurs restent soumis à relecture. Une nouvelle programmation exige une date future, normalisée en UTC côté serveur. Après l’échéance, le journaliste peut modifier son article en conservant sa programmation et sa date déjà confirmées, sans le convertir en publication immédiate. L’avertissement de sortie détecte aussi les changements non confirmés par le serveur, pas seulement le formulaire `dirty`.
- Les statuts interdits sont absents du sélecteur, même désactivés. Si le statut courant n’est pas autorisé pour le rôle, un choix vide impose une action explicite sans rétrograder automatiquement l’article ; le badge reste informatif.
- Les notifications admin utilisent `toast(message, type)` (`success`, `error`, `info`) : bandeau large en haut, fermeture manuelle et disparition après 10 secondes. Réserver le vert aux succès confirmés, utiliser le rouge pour les erreurs et garder les demandes en attente en information. Le texte est inséré avec `textContent`, jamais comme HTML.
- Les envois explicites sont immédiats et protégés par `editorSubmission` (article + version), avec boutons bloqués jusqu’à confirmation de cette version. Ne pas confondre une confirmation HTTP avec l’acquittement complet des articles et ressources ; une erreur libère les boutons mais garde les changements en attente, sans réessai automatique.
- `articlePayload()` évite de dupliquer les images encodées dans le corps et la médiathèque : seuls les `src` encodés des images `data-mid` connues sont retirés de la copie envoyée. Garder intact le snapshot local utilisé pour l’aperçu et la comparaison de l’acquittement ; le serveur résout ces références en URLs persistantes.
- Un article `programme` arrivé à échéance reste stocké sous ce statut mais devient public via `Article::published()`. Les filtres et badges de la liste admin utilisent `articleStatus()` pour l’afficher dans « Publiés » à l’actualisation, sans modifier ses données ni déclencher de sauvegarde.
- La médiathèque utilise `mediaSync: delta`, les seuls médias modifiés dans `medias`, leur état initial dans `mediaBase` et les suppressions explicites dans `mediaDeleted`. Les ajouts distincts fusionnent sans conflit global ; les éditions concurrentes du même visuel restent refusées. Les réponses serveur sont fusionnées avec les modifications locales effectuées pendant la requête, sans transformer les ajouts des collègues en suppressions.
- La migration `2026_11_05_000001_create_admin_audit_events_table` ajoute uniquement la table du journal serveur. Déployer les dépendances Composer et appliquer cette migration avant de rouvrir l’administration.
- La migration `2026_11_05_000002_create_editorial_delivery_tables` ajoute les votes uniques par navigateur, les lectures quotidiennes et les campagnes/envois newsletter ; aucun article existant n’est réécrit.
- `php artisan site:diagnose` est un diagnostic en lecture seule (chemins, anciens fichiers SEO, tables, transport mail et santé SSR), sans secrets.
- `php artisan articles:audit-layout` examine les articles de tous statuts par lots de 100, sans écriture. `--json` exporte un rapport JSONL privé avec corps d’origine, empreinte SHA256, signaux heuristiques et propositions à valider ; `--status=publie` limite le périmètre. Les propositions utilisent uniquement des lignes vides existantes, jamais une reconstruction inventée ; les blocs déjà fusionnés nécessitent une révision. Ne pas placer ce rapport sous `public/` ni dans Git : il peut contenir des brouillons.
- Les campagnes newsletter nécessitent un transport réel et un cron `schedule:run` chaque minute. `newsletter:send-due --limit=100` traite un lot, conserve les réussites/échecs et ne réessaie pas automatiquement les envois ambigus ou échoués. Ne pas exécuter la commande sur une base réelle pour tester sans autorisation d’envoyer des e-mails.
- Les anciennes campagnes JSON sont conservées et affichées « Historique non vérifié » ; elles ne sont pas automatiquement expédiées.
- Les CSS, scripts admin et logos utilisent `SiteAssets` et `/site-assets/{version}/{file}/content` avec empreinte de contenu dans le chemin, sans dépendre du cache des paramètres d’URL.
