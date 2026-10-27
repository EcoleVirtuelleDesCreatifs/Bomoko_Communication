#!/usr/bin/env bash
# Déploiement générique (Infomaniak, VPS…) : le domaine pointe directement sur <app>/public.
# À exécuter sur le serveur depuis la racine du checkout git (branche Cercle-Restaurant).
set -euo pipefail

PHP=${PHP:-php}
cd "$(dirname "$0")/.."

if [ -d .git ] && [ "${SKIP_GIT:-0}" != "1" ]; then
    BRANCH=${BRANCH:-Cercle-Restaurant}
    echo "==> Code : alignement sur origin/${BRANCH}"
    git fetch origin "$BRANCH"
    git checkout -q -B "$BRANCH" "origin/$BRANCH"
    git reset -q --hard "origin/$BRANCH"
    echo "    $(git log -1 --format='%h %s')"
    echo "    public/css/style.css : $(git log -1 --format=%h -- public/css/style.css)"
fi

echo "==> Composer install (prod)"
composer install --no-dev --optimize-autoloader --no-interaction

echo "==> APP_KEY"
if ! grep -q '^APP_KEY=base64:' .env 2>/dev/null; then
    $PHP artisan key:generate --force --no-interaction
fi

echo "==> Migrations"
$PHP artisan migrate --force --no-interaction

echo "==> Seeders (seulement si vides)"
if [ "$($PHP artisan tinker --execute 'echo App\Models\MenuItem::count();' 2>/dev/null | tail -1)" = "0" ]; then
    $PHP artisan db:seed --class=MenuItemSeeder --force --no-interaction
fi

if grep -Eq '^ADMIN_EMAIL=.+' .env 2>/dev/null; then
    if [ "$($PHP artisan tinker --execute "echo App\Models\User::where('email', config('site.admin_email'))->exists() ? '1' : '0';" 2>/dev/null | tail -1)" = "0" ]; then
        $PHP artisan db:seed --class=AdminUserSeeder --force --no-interaction
    fi
fi

echo "==> Images optimisées"
$PHP artisan images:optimize --no-interaction

echo "==> Storage public link"
$PHP artisan storage:link --force --no-interaction

echo "==> Caches de production"
$PHP artisan optimize:clear --no-interaction
$PHP artisan optimize --no-interaction

chmod -R ug+rwX storage bootstrap/cache

APP_URL=$(grep -E '^APP_URL=' .env | cut -d= -f2- | tr -d '"')
echo ""
echo "Déploiement terminé. À vérifier :"
for p in "" carte evenements reservation robots.txt sitemap.xml admin/login; do
    echo "  ${APP_URL}/${p}"
done
