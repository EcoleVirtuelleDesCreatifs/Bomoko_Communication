#!/usr/bin/env bash
# Déploiement Le Cercle sur HestiaCP (sous-dossier https://afriquinfos.com/maquette-cercle)
# À exécuter sur le serveur depuis APP_DIR (checkout git de la branche Resto-Cercle).
set -euo pipefail

PHP=${PHP:-php}
APP_DIR=${APP_DIR:-"$HOME/web/afriquinfos.com/private/maquette-cercle"}
WEB_DIR=${WEB_DIR:-"$HOME/web/afriquinfos.com/public_html/maquette-cercle"}

cd "$APP_DIR"

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

if [ -n "${ADMIN_EMAIL:-}" ] && grep -q "^ADMIN_EMAIL=${ADMIN_EMAIL}" .env 2>/dev/null; then
    if [ "$($PHP artisan tinker --execute "echo App\Models\User::where('email', config('site.admin_email'))->exists() ? '1' : '0';" 2>/dev/null | tail -1)" = "0" ]; then
        $PHP artisan db:seed --class=AdminUserSeeder --force --no-interaction
    fi
fi

echo "==> Images optimisées"
$PHP artisan images:optimize --no-interaction

echo "==> Publication webroot : $WEB_DIR"
mkdir -p "$WEB_DIR"
rsync -a --delete --exclude storage "$APP_DIR/public/" "$WEB_DIR/"

# index.php réécrit pour pointer vers APP_DIR (hors webroot)
cat > "$WEB_DIR/index.php" <<PHP
<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists(\$maintenance = '${APP_DIR}/storage/framework/maintenance.php')) {
    require \$maintenance;
}

// Register the Composer autoloader...
require '${APP_DIR}/vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application \$app */
\$app = require_once '${APP_DIR}/bootstrap/app.php';

\$app->handleRequest(Request::capture());
PHP

echo "==> Storage public link"
ln -sfn "$APP_DIR/storage/app/public" "$WEB_DIR/storage"
$PHP artisan storage:link --no-interaction || true

echo "==> Caches de production"
$PHP artisan optimize --no-interaction

chmod -R ug+rwX "$APP_DIR/storage" "$APP_DIR/bootstrap/cache"

echo ""
echo "Déploiement terminé. À vérifier :"
echo "  https://afriquinfos.com/maquette-cercle/"
echo "  https://afriquinfos.com/maquette-cercle/carte"
echo "  https://afriquinfos.com/maquette-cercle/evenements"
echo "  https://afriquinfos.com/maquette-cercle/robots.txt"
echo "  https://afriquinfos.com/maquette-cercle/sitemap.xml"
echo "  https://afriquinfos.com/maquette-cercle/admin/login"
