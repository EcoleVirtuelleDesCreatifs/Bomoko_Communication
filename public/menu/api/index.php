<?php

/* =========================================================
   LE CERCLE — API (PHP 8 + SQLite, aucun réglage serveur requis)
   Appels : api/index.php?a=<action>
   Public : menu, order, status
   Admin  : login, logout, me, orders, order_status, menu_save,
            settings, settings_save, password
   ========================================================= */
declare(strict_types=1);
require __DIR__.'/config.php';
date_default_timezone_set(TIMEZONE);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

const STATUSES = ['nouvelle', 'preparation', 'servie', 'payee', 'annulee'];

function out($data, int $code = 200): never
{
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
function fail(string $msg, int $code = 400): never
{
    out(['error' => $msg], $code);
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo) {
        return $pdo;
    }
    $dir = dirname(DB_FILE);
    if (! is_dir($dir)) {
        mkdir($dir, 0775, true);
    }
    $pdo = new PDO('sqlite:'.DB_FILE, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    $pdo->exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=4000;');
    $pdo->exec('CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT NOT NULL)');
    $pdo->exec('CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT, ref TEXT UNIQUE NOT NULL, no TEXT NOT NULL, day TEXT NOT NULL,
        tbl TEXT NOT NULL, note TEXT NOT NULL DEFAULT "", lines TEXT NOT NULL, total INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT "nouvelle", created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)');
    $pdo->exec('CREATE INDEX IF NOT EXISTS orders_day ON orders(day)');
    if (kv_get('menu') === null) {
        $seed = is_file(MENU_SEED_FILE) ? file_get_contents(MENU_SEED_FILE) : '[]';
        kv_set('menu', $seed);
        kv_set('menu_version', (string) time());
    }
    if (kv_get('settings') === null) {
        kv_set('settings', json_encode(['nom' => 'Le Cercle Abidjan', 'whatsapp' => '', 'devise' => 'F CFA', 'commandes_ouvertes' => true], JSON_UNESCAPED_UNICODE));
    }

    return $pdo;
}
function kv_get(string $k): ?string
{
    $s = db()->prepare('SELECT v FROM kv WHERE k = ?');
    $s->execute([$k]);
    $v = $s->fetchColumn();

    return $v === false ? null : $v;
}
function kv_set(string $k, string $v): void
{
    db()->prepare('INSERT INTO kv (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v')->execute([$k, $v]);
}
function settings(): array
{
    return json_decode(kv_get('settings') ?? '{}', true) ?: [];
}
function body(): array
{
    $raw = file_get_contents('php://input') ?: '';
    if (strlen($raw) > 2_000_000) {
        fail('Requête trop volumineuse.', 413);
    }
    $j = json_decode($raw, true);

    return is_array($j) ? $j : [];
}
function str(mixed $v, int $max): string
{
    return mb_substr(trim((string) $v), 0, $max);
}

/* ---------- Session admin ---------- */
session_set_cookie_params(['httponly' => true, 'samesite' => 'Strict', 'secure' => ! empty($_SERVER['HTTPS']), 'path' => '/']);
session_name('cercle_admin');
session_start();
function require_admin(): void
{
    if (empty($_SESSION['admin'])) {
        fail('Session expirée. Reconnectez-vous.', 401);
    }
}

$a = $_GET['a'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST' && ($_SERVER['HTTP_X_CERCLE'] ?? '') !== '1') {
    fail('Requête refusée.', 403);
}

/* ---------- Commandes : format public ---------- */
function order_row(array $r): array
{
    return ['id' => (int) $r['id'], 'ref' => $r['ref'], 'no' => $r['no'], 'table' => $r['tbl'], 'note' => $r['note'],
        'lines' => json_decode($r['lines'], true), 'total' => (int) $r['total'], 'status' => $r['status'],
        'at' => (int) $r['created_at'] * 1000, 'updated' => (int) $r['updated_at'] * 1000];
}
function menu_index(): array
{
    $idx = [];
    foreach (json_decode(kv_get('menu') ?? '[]', true) as $u) {
        foreach ($u['groups'] as $g) {
            foreach ($g['cats'] as $c) {
                foreach ($c['items'] as $it) {
                    $idx[$it['id']] = $it;
                }
            }
        }
    }

    return $idx;
}

try {
    switch ($a) {

        /* ======== PUBLIC ======== */
        case 'menu':
            db();
            $s = settings();
            out(['menu' => json_decode(kv_get('menu'), true), 'version' => kv_get('menu_version'),
                'settings' => ['nom' => $s['nom'] ?? '', 'whatsapp' => $s['whatsapp'] ?? '', 'devise' => $s['devise'] ?? 'F CFA', 'commandes_ouvertes' => (bool) ($s['commandes_ouvertes'] ?? true)]]);

        case 'order':
            if ($method !== 'POST') {
                fail('Méthode invalide.', 405);
            }
            if (empty(settings()['commandes_ouvertes'])) {
                fail('Les commandes par téléphone sont fermées pour le moment. Appelez un serveur.', 409);
            }
            $b = body();
            $table = str($b['table'] ?? '', 6);
            if ($table === '') {
                fail('Numéro de table manquant.');
            }
            $lines = $b['lines'] ?? [];
            if (! is_array($lines) || ! $lines || count($lines) > 60) {
                fail('Commande vide ou trop longue.');
            }
            $idx = menu_index();
            $clean = [];
            $total = 0;
            foreach ($lines as $l) {
                $it = $idx[$l['id'] ?? ''] ?? null;
                $oi = (int) ($l['o'] ?? 0);
                $q = (int) ($l['q'] ?? 0);
                if (! $it || ! isset($it['o'][$oi]) || $q < 1 || $q > 99) {
                    fail('Un article n’existe plus sur la carte. Actualisez la page.');
                }
                if (! empty($it['x'])) {
                    fail('« '.$it['n'].' » est épuisé. Retirez-le de votre commande.', 409);
                }
                [$lbl, $v] = $it['o'][$oi];
                $clean[] = ['id' => $it['id'], 'n' => $it['n'], 'l' => $lbl, 'v' => (int) $v, 'q' => $q];
                $total += (int) $v * $q;
            }
            // Anti-doublon : même référence client renvoyée (réseau instable)
            $cref = preg_replace('/[^a-z0-9]/i', '', (string) ($b['client_ref'] ?? ''));
            if ($cref) {
                $s = db()->prepare('SELECT * FROM orders WHERE ref = ?');
                $s->execute([$cref]);
                if ($row = $s->fetch()) {
                    out(['order' => order_row($row)]);
                }
            }
            $ref = $cref ?: bin2hex(random_bytes(8));
            $day = date('Y-m-d');
            $now = time();
            $pdo = db();
            $pdo->exec('BEGIN IMMEDIATE');
            $c = $pdo->prepare('SELECT COUNT(*) FROM orders WHERE day = ?');
            $c->execute([$day]);
            $no = str_pad((string) ((int) $c->fetchColumn() + 1), 3, '0', STR_PAD_LEFT);
            $pdo->prepare('INSERT INTO orders (ref, no, day, tbl, note, lines, total, status, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)')
                ->execute([$ref, $no, $day, $table, str($b['note'] ?? '', 300), json_encode($clean, JSON_UNESCAPED_UNICODE), $total, 'nouvelle', $now, $now]);
            $id = (int) $pdo->lastInsertId();
            $pdo->exec('COMMIT');
            $s = db()->prepare('SELECT * FROM orders WHERE id = ?');
            $s->execute([$id]);
            out(['order' => order_row($s->fetch())], 201);

        case 'status':
            $refs = array_slice(array_filter(array_map(fn ($r) => preg_replace('/[^a-z0-9]/i', '', $r), explode(',', $_GET['refs'] ?? ''))), 0, 20);
            if (! $refs) {
                out(['statuses' => new stdClass]);
            }
            $s = db()->prepare('SELECT ref, status, no FROM orders WHERE ref IN ('.implode(',', array_fill(0, count($refs), '?')).')');
            $s->execute($refs);
            $res = [];
            foreach ($s->fetchAll() as $r) {
                $res[$r['ref']] = ['status' => $r['status'], 'no' => $r['no']];
            }
            out(['statuses' => (object) $res]);

            /* ======== ADMIN ======== */
        case 'login':
            $b = body();
            usleep(300000); // ralentit les essais
            $hash = kv_get('admin_hash');
            $ok = $hash ? password_verify((string) ($b['password'] ?? ''), $hash) : hash_equals(ADMIN_PASSWORD_INITIAL, (string) ($b['password'] ?? ''));
            if (! $ok) {
                fail('Mot de passe incorrect.', 401);
            }
            session_regenerate_id(true);
            $_SESSION['admin'] = true;
            out(['ok' => true, 'default_password' => ! $hash]);

        case 'logout':
            $_SESSION = [];
            session_destroy();
            out(['ok' => true]);

        case 'me':
            db();
            out(['admin' => ! empty($_SESSION['admin']), 'default_password' => kv_get('admin_hash') === null]);

        case 'orders':
            require_admin();
            $scope = $_GET['scope'] ?? 'active';
            $day = date('Y-m-d');
            if ($scope === 'today') {
                $s = db()->prepare('SELECT * FROM orders WHERE day = ? ORDER BY id DESC');
                $s->execute([$day]);
            } elseif ($scope === 'all') {
                $s = db()->query('SELECT * FROM orders ORDER BY id DESC LIMIT 300');
            } else {
                $s = db()->prepare("SELECT * FROM orders WHERE status IN ('nouvelle','preparation','servie') ORDER BY id ASC");
                $s->execute();
            }
            $rows = array_map('order_row', $s->fetchAll());
            $st = db()->prepare("SELECT COUNT(*) n, COALESCE(SUM(CASE WHEN status != 'annulee' THEN total END),0) ca,
            SUM(CASE WHEN status IN ('nouvelle','preparation','servie') THEN 1 ELSE 0 END) active,
            SUM(CASE WHEN status = 'nouvelle' THEN 1 ELSE 0 END) fresh FROM orders WHERE day = ?");
            $st->execute([$day]);
            $k = $st->fetch();
            out(['orders' => $rows, 'stats' => ['today' => (int) $k['n'], 'revenue' => (int) $k['ca'], 'active' => (int) $k['active'], 'new' => (int) $k['fresh']]]);

        case 'order_status':
            require_admin();
            $b = body();
            $st = (string) ($b['status'] ?? '');
            if (! in_array($st, STATUSES, true)) {
                fail('Statut inconnu.');
            }
            $u = db()->prepare('UPDATE orders SET status = ?, updated_at = ? WHERE id = ?');
            $u->execute([$st, time(), (int) ($b['id'] ?? 0)]);
            if (! $u->rowCount()) {
                fail('Commande introuvable.', 404);
            }
            out(['ok' => true]);

        case 'menu_save':
            require_admin();
            $b = body();
            $menu = $b['menu'] ?? null;
            if (! is_array($menu) || ! $menu) {
                fail('Carte invalide.');
            }
            foreach ($menu as $u) {
                if (empty($u['id']) || ! isset($u['groups']) || ! is_array($u['groups'])) {
                    fail('Structure de carte invalide.');
                }
                foreach ($u['groups'] as $g) {
                    foreach (($g['cats'] ?? []) as $c) {
                        foreach (($c['items'] ?? []) as $it) {
                            if (trim((string) ($it['n'] ?? '')) === '') {
                                fail('Un article n’a pas de nom.');
                            }
                            if (empty($it['o']) || ! is_array($it['o'])) {
                                fail('« '.$it['n'].' » n’a pas de prix.');
                            }
                            foreach ($it['o'] as $o) {
                                if (! is_array($o) || ! is_numeric($o[1] ?? null) || $o[1] < 0) {
                                    fail('Prix invalide pour « '.$it['n'].' ».');
                                }
                            }
                        }
                    }
                }
            }
            if (isset($b['version']) && (string) $b['version'] !== kv_get('menu_version')) {
                fail('La carte a été modifiée depuis un autre appareil. Rechargez avant de publier.', 409);
            }
            kv_set('menu', json_encode($menu, JSON_UNESCAPED_UNICODE));
            $v = (string) (time().random_int(10, 99));
            kv_set('menu_version', $v);
            out(['ok' => true, 'version' => $v]);

        case 'settings':
            require_admin();
            out(['settings' => settings()]);

        case 'settings_save':
            require_admin();
            $b = body();
            $s = settings();
            if (array_key_exists('nom', $b)) {
                $s['nom'] = str($b['nom'], 80);
            }
            if (array_key_exists('whatsapp', $b)) {
                $s['whatsapp'] = preg_replace('/\D/', '', (string) $b['whatsapp']);
            }
            if (array_key_exists('devise', $b)) {
                $s['devise'] = str($b['devise'], 12) ?: 'F CFA';
            }
            if (array_key_exists('commandes_ouvertes', $b)) {
                $s['commandes_ouvertes'] = (bool) $b['commandes_ouvertes'];
            }
            kv_set('settings', json_encode($s, JSON_UNESCAPED_UNICODE));
            out(['settings' => $s]);

        case 'password':
            require_admin();
            $b = body();
            $new = (string) ($b['new'] ?? '');
            $hash = kv_get('admin_hash');
            $ok = $hash ? password_verify((string) ($b['current'] ?? ''), $hash) : hash_equals(ADMIN_PASSWORD_INITIAL, (string) ($b['current'] ?? ''));
            if (! $ok) {
                fail('Mot de passe actuel incorrect.', 401);
            }
            if (mb_strlen($new) < 8) {
                fail('Le nouveau mot de passe doit contenir au moins 8 caractères.');
            }
            kv_set('admin_hash', password_hash($new, PASSWORD_DEFAULT));
            out(['ok' => true]);

        default:
            fail('Action inconnue.', 404);
    }
} catch (Throwable $e) {
    try {
        db()->exec('ROLLBACK');
    } catch (Throwable $x) {
    }
    error_log('[cercle] '.$e->getMessage());
    fail('Erreur serveur. Réessayez dans un instant.', 500);
}
