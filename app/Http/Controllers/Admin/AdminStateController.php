<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\TeamInvitation;
use App\Models\Article;
use App\Models\Comment;
use App\Models\ContactMessage;
use App\Models\Debate;
use App\Models\Event;
use App\Models\Region;
use App\Models\Rubrique;
use App\Models\Subscriber;
use App\Models\User;
use App\Models\UserEvent;
use App\Support\ArticleHtml;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

class AdminStateController extends Controller
{
    private const BLOB_KEYS = ['flash', 'medias', 'ads', 'campaigns', 'slots', 'settings', 'log', 'history'];

    public function app(Request $request)
    {
        return view('admin', [
            'state' => $this->state(),
            'me' => $request->user()?->only('name', 'email'),
        ]);
    }

    public function show()
    {
        return response()->json($this->state());
    }

    public function article(string $slug)
    {
        $a = $this->visibleArticles()->where('slug', $slug)->firstOrFail();

        return response()->json([
            'body' => array_map(fn ($block) => is_string($block) && str_starts_with(ltrim($block), '<')
                ? app(ArticleHtml::class)->sanitize($block) : $block, $a->body ?? []),
            'person' => $a->person,
            'image_path' => $a->image_path,
        ]);
    }

    public function articles(Request $request)
    {
        $q = trim((string) $request->query('q', ''));
        $rows = $this->visibleArticles()->orderByDesc('published_at');
        if (mb_strlen($q) >= 2) {
            $like = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $q).'%';
            $rows->where(fn ($w) => $w->where('title', 'like', $like)
                ->orWhere('slug', 'like', $like)
                ->orWhere('author_name', 'like', $like))
                ->limit(40);
        } else {
            $rows->limit(1500);
        }
        $rows = $rows
            ->get(['id', 'slug', 'rubrique_slug', 'region_slug', 'country', 'ph', 'img',
                'image_path', 'views', 'title', 'chapo', 'author_name', 'published_at',
                'updated_at', 'read_time', 'tags', 'status', 'meta_desc', 'is_une',
                'person', 'icon', 'media_id', 'user_id']);

        return response()->json($rows->map(fn ($a) => $this->articleItem($a))->all());
    }

    private function articleItem(Article $a): array
    {
        return array_filter([
            'id' => $a->slug,
            'userId' => $a->user_id ? 'u'.$a->user_id : null,
            'slug' => $a->slug,
            'rub' => $a->rubrique_slug,
            'region' => $a->region_slug,
            'country' => $a->country,
            'ph' => $a->ph,
            'img' => $a->img,
            'src' => $a->image_path ? asset('storage/'.$a->image_path) : null,
            'views' => $a->views,
            'title' => $a->title,
            'chapo' => $a->chapo,
            'author' => $a->author_name,
            'date' => optional($a->published_at)->toIso8601String(),
            'updated' => optional($a->updated_at)->toIso8601String(),
            'read' => $a->read_time,
            'tags' => $a->tags ?? [],
            'status' => $a->status,
            'meta' => $a->meta_desc,
            'une' => (bool) $a->is_une,
            'person' => $a->person,
            'icon' => $a->icon,
            'mediaId' => $a->media_id,
        ], fn ($v) => $v !== null);
    }

    private function state(): array
    {
        $blob = DB::table('admin_data')->pluck('value', 'key')
            ->map(fn ($v) => json_decode($v, true))->all();

        $state = [
            'v' => 1,
            'generatedAt' => now()->toIso8601String(),
            'users' => User::all()->map(fn ($u) => [
                'id' => 'u'.$u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role ?? 'journaliste',
                'status' => $u->status ?? 'actif',
                'last' => optional($u->last_login_at)->toIso8601String(),
            ])->values()->all(),
            'sessions' => UserEvent::with('user:id,name,email')
                ->latest('created_at')->limit(300)->get()
                ->map(fn ($e) => [
                    'who' => $e->user?->name ?? 'Compte supprimé',
                    'email' => $e->user?->email ?? '',
                    'event' => $e->event,
                    'at' => optional($e->created_at)->toIso8601String(),
                    'ip' => $e->ip,
                ])->values()->all(),
            'rubriques' => Rubrique::all()->map(fn ($r) => [
                'id' => $r->slug, 'label' => $r->label, 'tagline' => $r->tagline,
                'menu' => (bool) $r->in_menu, 'order' => $r->sort,
            ])->values()->all(),
            'regions' => Region::all()->map(fn ($r) => [
                'id' => $r->slug, 'label' => $r->label, 'order' => $r->sort,
            ])->values()->all(),
            'articles' => $this->visibleArticles()->orderByDesc('published_at')->limit(1500)
                ->get(['id', 'slug', 'rubrique_slug', 'region_slug', 'country', 'ph', 'img',
                    'image_path', 'views', 'title', 'chapo', 'author_name', 'published_at',
                    'updated_at', 'read_time', 'tags', 'status', 'meta_desc', 'is_une',
                    'person', 'icon', 'media_id', 'user_id'])
                ->map(fn ($a) => $this->articleItem($a))->values()->all(),
            'agenda' => Event::all()->map(fn ($e) => [
                'id' => $e->slug,
                'date' => $e->start_date->toDateString(),
                'end' => $e->end_date?->toDateString(),
                'title' => $e->title,
                'city' => $e->city,
                'country' => $e->country,
                'cat' => $e->cat,
                'desc' => $e->desc,
            ])->values()->all(),
            'comments' => Comment::with('article:id,slug')->get()->map(fn ($c) => [
                'id' => 'c'.$c->id,
                'articleId' => $c->article?->slug,
                'author' => $c->author,
                'email' => $c->email,
                'text' => $c->text,
                'date' => $c->created_at?->toIso8601String(),
                'status' => $c->status,
                'reply' => $c->reply,
            ])->values()->all(),
            'messages' => ContactMessage::latest()->limit(200)->get()->map(fn ($m) => [
                'id' => 'msg'.$m->id,
                'name' => $m->name,
                'email' => $m->email,
                'subject' => $m->subject,
                'message' => $m->message,
                'date' => $m->created_at?->toIso8601String(),
                'read' => (bool) $m->read,
            ])->values()->all(),
            'subscribers' => Subscriber::all()->map(fn ($s) => [
                'id' => 's'.$s->id,
                'name' => $s->name,
                'email' => $s->email,
                'country' => $s->country,
                'since' => $s->created_at?->toIso8601String(),
                'status' => $s->status,
            ])->values()->all(),
            'debats' => Debate::orderBy('start_date', 'desc')->get()->map(fn ($d) => [
                'id' => 'd'.$d->id,
                'question' => $d->question,
                'pour' => ['text' => $d->pour_text, 'who' => $d->pour_who],
                'contre' => ['text' => $d->contre_text, 'who' => $d->contre_who],
                'votes' => ['pour' => $d->votes_pour, 'contre' => $d->votes_contre],
                'start' => $d->start_date?->toDateString(),
                'end' => $d->end_date?->toDateString(),
            ])->values()->all(),
        ];

        foreach (self::BLOB_KEYS as $key) {
            $state[$key] = $blob[$key] ?? $this->defaultBlob($key);
        }

        if (is_array($state['medias'] ?? null)) {
            $state['medias'] = array_values(array_filter($state['medias'], function ($m) {
                $d = $m['data'] ?? '';

                return str_starts_with($d, 'data:image/') || str_starts_with($d, 'http') || str_starts_with($d, '/');
            }));
        }

        $state['adMetrics'] = DB::table('ad_metrics')->get()
            ->mapWithKeys(fn ($m) => [$m->ad_key => ['imp' => (int) $m->impressions, 'clk' => (int) $m->clicks]])->all();
        $admin = auth()->user()->role === 'admin';
        $editor = in_array(auth()->user()->role, ['admin', 'chef'], true);
        if (! $admin) {
            $state['sessions'] = [];
        }
        if (! $editor) {
            foreach (['subscribers', 'messages', 'comments', 'adMetrics', 'log', 'ads', 'campaigns', 'slots', 'settings', 'flash', 'debats', 'agenda'] as $key) {
                $state[$key] = [];
            }
            $state['users'] = array_map(fn ($u) => array_intersect_key($u, array_flip(['id', 'name', 'role', 'status'])), $state['users']);
            foreach ($state['users'] as &$u) {
                if ($u['id'] === 'u'.auth()->id()) {
                    $u['email'] = auth()->user()->email;
                }
            }
            unset($u);
        }
        if ($editor) {
            $audit = DB::table('admin_audit_events')->orderByDesc('id')->limit(200)->get()
                ->map(fn ($e) => ['who' => $e->who, 'what' => $e->action, 'at' => Carbon::parse($e->created_at)->toIso8601String()])->all();
            $state['log'] = array_slice(array_merge($audit, $state['log'] ?? []), 0, 200);
        }
        $state['revisions'] = [];
        foreach (['rubriques', 'regions', 'agenda', 'comments', 'subscribers', 'messages', 'debats', 'users', 'flash', 'medias', 'ads', 'campaigns', 'slots', 'settings'] as $key) {
            $value = $state[$key] ?? [];
            if ($key === 'users') {
                $value = array_map(function ($u) {
                    unset($u['last']);

                    return $u;
                }, $value);
            }
            if ($key === 'debats') {
                $value = array_map(function ($d) {
                    unset($d['votes']);

                    return $d;
                }, $value);
            }
            $state['revisions'][$key] = hash('sha256', json_encode($value, JSON_THROW_ON_ERROR));
        }
        $state['teamStats'] = $editor ? $this->teamStats() : [];
        $state['publishedToday'] = $editor ? Article::published()->whereBetween('published_at', [now()->startOfDay(), now()->endOfDay()])
            ->orderByDesc('published_at')->get(['id', 'slug', 'rubrique_slug', 'region_slug', 'country', 'ph', 'img',
                'image_path', 'views', 'title', 'chapo', 'author_name', 'published_at', 'updated_at', 'read_time',
                'tags', 'status', 'meta_desc', 'is_une', 'person', 'icon', 'media_id', 'user_id'])
            ->map(fn ($a) => $this->articleItem($a))->all() : [];
        $loaded = array_flip(array_column($state['articles'], 'id'));
        foreach ($state['publishedToday'] as $item) {
            if (! isset($loaded[$item['id']])) {
                $state['articles'][] = $item;
            }
        }

        return $state;
    }

    private function teamStats(): array
    {
        $start = now()->startOfDay();
        $end = now()->endOfDay();
        $totals = Article::published()->select('user_id', 'author_name')
            ->selectRaw('COUNT(*) AS total')
            ->selectRaw('SUM(CASE WHEN published_at BETWEEN ? AND ? THEN 1 ELSE 0 END) AS today', [$start, $end])
            ->groupBy('user_id', 'author_name')->get();
        $logins = DB::table('user_events')->where('event', 'connexion')->whereBetween('created_at', [$start, $end])
            ->select('user_id')->selectRaw('COUNT(*) AS total')->groupBy('user_id')->pluck('total', 'user_id');
        $users = User::all(['id', 'name']);

        return $users->mapWithKeys(function ($user) use ($users, $totals, $logins) {
            $unique = $users->where('name', $user->name)->count() === 1;
            $rows = $totals->filter(fn ($a) => (int) $a->user_id === $user->id ||
                (! $a->user_id && $unique && $a->author_name === $user->name));

            return ['u'.$user->id => ['total' => (int) $rows->sum('total'), 'today' => (int) $rows->sum('today'),
                'logins' => (int) ($logins[$user->id] ?? 0)]];
        })->all();
    }

    private function visibleArticles()
    {
        $query = Article::query();
        $user = auth()->user();
        if (! in_array($user->role, ['admin', 'chef'], true)) {
            $unique = User::where('name', $user->name)->count() === 1;
            $query->where(fn ($q) => $q->where('user_id', $user->id)->when($unique,
                fn ($q) => $q->orWhere(fn ($q) => $q->whereNull('user_id')->where('author_name', $user->name))));
        }

        return $query;
    }

    private function defaultBlob(string $key)
    {
        return match ($key) {
            'settings' => [
                'name' => 'Afriquinfos',
                'timezone' => 'Africa/Abidjan',
                'slogan' => 'L’actualité africaine, par des journalistes africains.',
                'emailRedaction' => 'redaction@afriquinfos.com',
                'emailPub' => 'pub@afriquinfos.com',
                'facebook' => 'https://facebook.com/afriquinfos',
                'x' => 'https://x.com/afriquinfos',
                'linkedin' => 'https://linkedin.com/company/afriquinfos',
                'youtube' => 'https://youtube.com/@afriquinfos',
                'perPage' => 12,
                'moderation' => true,
                'maintenance' => false,
            ],
            'slots' => [
                ['id' => 'billboard', 'name' => 'Billboard accueil', 'where' => 'Accueil, sous la rubrique Politique', 'w' => 970, 'h' => 250, 'format' => '970 × 250'],
                ['id' => 'pave', 'name' => 'Pavé article', 'where' => 'Colonne de droite des articles', 'w' => 300, 'h' => 250, 'format' => '300 × 250'],
                ['id' => 'sky', 'name' => 'Skyscraper rubrique', 'where' => 'Pages rubriques, colonne de droite', 'w' => 160, 'h' => 600, 'format' => '160 × 600'],
                ['id' => 'habillage', 'name' => 'Habillage accueil', 'where' => 'Fond de page de l’accueil', 'w' => 1920, 'h' => 1080, 'format' => '1920 × 1080'],
                ['id' => 'mobile', 'name' => 'Bannière mobile', 'where' => 'Haut des pages sur téléphone', 'w' => 320, 'h' => 100, 'format' => '320 × 100'],
                ['id' => 'newsletter', 'name' => 'Bannière newsletter', 'where' => 'Le brief panafricain', 'w' => 600, 'h' => 200, 'format' => '600 × 200'],
            ],
            'flash' => Article::published()->orderByDesc('published_at')->limit(5)->get()
                ->map(fn ($a) => ['id' => 'f'.$a->id, 'articleId' => $a->slug, 'text' => $a->title, 'auto' => true, 'active' => true])
                ->values()->all(),
            'medias' => Article::whereNotNull('image_path')->orderByDesc('published_at')
                ->limit(300)->get(['image_path', 'img'])
                ->unique('image_path')->values()
                ->map(fn ($a, $i) => [
                    'id' => 'm'.$i,
                    'name' => mb_convert_encoding($a->img ?: basename($a->image_path), 'UTF-8', 'UTF-8'),
                    'ph' => 'ink',
                    'data' => asset('storage/'.$a->image_path),
                ])->all(),
            'history' => null,
            default => [],
        };
    }

    public function save(Request $request)
    {
        abort_unless($request->input('protocol') === 2, 409, 'Rechargez l’administration avant de sauvegarder.');
        $s = $request->json()->all();
        $admin = $request->user()->role === 'admin';
        $editor = in_array($request->user()->role, ['admin', 'chef'], true);
        $methods = ['rubriques' => 'syncRubriques', 'regions' => 'syncRegions', 'agenda' => 'syncEvents',
            'comments' => 'syncComments', 'subscribers' => 'syncSubscribers', 'messages' => 'syncMessages', 'debats' => 'syncDebates'];
        $keys = array_merge(array_keys($methods), ['users', 'articles', 'flash', 'medias', 'ads', 'campaigns', 'slots', 'settings']);
        foreach ($keys as $key) {
            if (! array_key_exists($key, $s)) {
                continue;
            }
            abort_unless(is_array($s[$key]), 422, 'Format invalide : '.$key);
            abort_unless($key === 'articles' || $key === 'medias' || ($editor && ! in_array($key, ['users', 'settings', 'slots'], true)) || $admin, 403);
        }
        $request->validate([
            'articles' => 'sometimes|array|max:100', 'articles.*.id' => 'required|string|max:255',
            'articles.*.title' => 'required|string|max:255', 'articles.*.status' => 'required|in:publie,programme,relecture,brouillon,corbeille',
            'articles.*.date' => 'nullable|date', 'articles.*.body' => 'sometimes|array',
            'articles.*.body.*' => 'string', 'articles.*.rub' => 'required|exists:rubriques,slug',
            'articles.*.region' => 'nullable|exists:regions,slug', 'revisions' => 'present|array',
            'users.*.id' => 'required|string', 'users.*.name' => 'required|string|max:255',
            'users.*.email' => 'required|email|max:255', 'users.*.role' => 'required|in:admin,chef,journaliste,contributeur',
            'users.*.status' => 'required|in:actif,invite,suspendu',
            'flash.*.id' => 'required|string|max:255', 'flash.*.active' => 'required|boolean',
            'flash.*.text' => 'required|string|max:1000', 'flash.*.start' => 'nullable|date_format:Y-m-d',
            'flash.*.end' => 'nullable|date_format:Y-m-d',
            'medias.*.id' => 'required|string|max:255', 'medias.*.data' => 'required|string',
        ]);
        $this->warnings = [];
        $saved = [];
        try {
            DB::transaction(function () use ($s, $request, $methods, $keys, &$saved) {
                DB::table('admin_data')->insertOrIgnore(['key' => '_sync_lock', 'value' => '{}', 'updated_at' => now()]);
                DB::table('admin_data')->where('key', '_sync_lock')->lockForUpdate()->first();
                $current = $this->state();
                foreach ($keys as $key) {
                    if (! array_key_exists($key, $s) || $key === 'articles') {
                        continue;
                    }
                    abort_unless(($s['revisions'][$key] ?? null) === ($current['revisions'][$key] ?? null), 409,
                        'Conflit sur '.$key.' : rechargez les données avant de réessayer.');
                    if (isset($methods[$key]) || $key === 'users') {
                        $missing = array_diff(array_column($current[$key], 'id'), array_column($s[$key], 'id'));
                        abort_if($missing !== [], 422, 'La suppression implicite est désactivée pour préserver les données : '.$key);
                    }
                }
                foreach ($methods as $key => $method) {
                    if (array_key_exists($key, $s)) {
                        $this->{$method}($s[$key]);
                    }
                }
                if (isset($s['users'])) {
                    $this->syncUsers($s['users'], $request->user());
                }
                if (isset($s['articles'])) {
                    $saved = $this->syncArticles($s['articles'], $s['medias'] ?? $current['medias'] ?? []);
                }
                foreach (['flash', 'medias', 'ads', 'campaigns', 'slots', 'settings'] as $key) {
                    if (! array_key_exists($key, $s)) {
                        continue;
                    }
                    $value = $s[$key];
                    if ($key === 'medias') {
                        $paths = $this->resolveMedias($value);
                        foreach ($value as &$media) {
                            if (isset($paths[$media['id']]['path'])) {
                                $media['data'] = asset('storage/'.$paths[$media['id']]['path']);
                            }
                        }
                        unset($media);
                    }
                    DB::table('admin_data')->updateOrInsert(['key' => $key], [
                        'value' => json_encode($value, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR), 'updated_at' => now(),
                    ]);
                }
                foreach ($keys as $key) {
                    if ($key !== 'articles' && array_key_exists($key, $s)) {
                        $this->audit('Modification de la section '.$key);
                    }
                }
            });
        } catch (HttpExceptionInterface $e) {
            return response()->json(['ok' => false, 'error' => $e->getMessage()], $e->getStatusCode());
        } catch (\Throwable $e) {
            report($e);

            return response()->json(['ok' => false, 'error' => 'Sauvegarde annulée. Consultez le journal serveur.'], 500);
        }
        $state = $this->state();

        return response()->json(['ok' => true, 'articles' => $saved, 'revisions' => $state['revisions'],
            'resources' => array_intersect_key($state, array_diff_key($s, ['articles' => true, 'revisions' => true, 'protocol' => true])),
            'log' => $state['log'], 'teamStats' => $state['teamStats'], 'publishedToday' => $state['publishedToday'], 'warnings' => $this->warnings]);
    }

    private function audit(string $action): void
    {
        DB::table('admin_audit_events')->insert([
            'user_id' => auth()->id(), 'who' => auth()->user()->name,
            'action' => $action, 'created_at' => now(),
        ]);
    }

    private array $warnings = [];

    private function syncRubriques(array $items): void
    {
        $ids = collect($items)->pluck('id')->filter()->all();
        foreach ($items as $r) {
            Rubrique::updateOrCreate(['slug' => $r['id']], [
                'label' => $r['label'] ?? $r['id'],
                'tagline' => $r['tagline'] ?? null,
                'in_menu' => $r['menu'] ?? true,
                'sort' => $r['order'] ?? 0,
            ]);
        }

    }

    private function syncRegions(array $items): void
    {
        $ids = collect($items)->pluck('id')->filter()->all();
        foreach ($items as $r) {
            Region::updateOrCreate(['slug' => $r['id']], [
                'label' => $r['label'] ?? $r['id'],
                'sort' => $r['order'] ?? 0,
            ]);
        }

    }

    private function syncArticles(array $items, array $medias = []): array
    {
        $mediaMap = $this->resolveMedias($medias);
        $saved = [];
        foreach ($items as $a) {
            $media = $mediaMap[$a['mediaId'] ?? ''] ?? null;
            $slug = $a['id'];
            $existing = Article::where('slug', $slug)->lockForUpdate()->first();
            $editor = in_array(auth()->user()->role, ['admin', 'chef'], true);
            if ($existing) {
                $uniqueName = User::where('name', auth()->user()->name)->count() === 1;
                abort_unless($editor || $existing->user_id === auth()->id() ||
                    (! $existing->user_id && $uniqueName && $existing->author_name === auth()->user()->name), 403,
                    'Cet article appartient à un autre membre.');
                // version plus récente en base (autre administrateur ou onglet) : ne pas écraser
                abort_unless(($a['baseUpdated'] ?? null) === $existing->updated_at?->toIso8601String(), 409,
                    'Conflit sur « '.$existing->title.' ». Votre texte est conservé dans cet onglet ; rechargez la version serveur avant de fusionner.');
            } else {
                abort_if(DB::table('slug_redirects')->where('old_slug', $slug)->exists(), 409, 'Cette ancienne URL a été renommée. Rechargez l’article.');
            }
            abort_unless($editor || in_array($a['status'], ['brouillon', 'relecture'], true), 403,
                'Seul un administrateur ou rédacteur en chef peut publier.');
            $oldStatus = $existing?->status;
            $authors = $editor ? User::where('name', $a['author'] ?? '')->get(['id']) : collect();
            $owner = $editor ? ($authors->count() === 1 ? $authors->first()->id : null) : auth()->id();
            $article = $existing ?? new Article(['slug' => $slug, 'user_id' => $owner]);
            $article->fill([
                'slug' => $a['id'] ?? $slug,
                'rubrique_slug' => $a['rub'] ?? $article->rubrique_slug ?? 'politique',
                'region_slug' => $a['region'] ?? null,
                'country' => $a['country'] ?? null,
                'title' => $a['title'] ?? 'Sans titre',
                'chapo' => $a['chapo'] ?? null,
                'author_name' => $editor ? ($a['author'] ?? $article->author_name) : ($article->author_name ?: auth()->user()->name),
                'published_at' => $a['date'] ?? null,
                'read_time' => $a['read'] ?? 4,
                'tags' => $a['tags'] ?? [],
                'ph' => $a['ph'] ?? 'ink',
                'img' => ($a['img'] ?? '') !== '' ? $a['img'] : ($media ? ($media['img'] ?? $media['name'] ?? null) : $article->img),
                'icon' => $a['icon'] ?? null,
                'person' => $a['person'] ?? null,
                'media_id' => $a['mediaId'] ?? $article->media_id,
                'views' => $article->views ?? 0,
                'is_une' => ! empty($a['une']),
                'status' => $a['status'] ?? 'brouillon',
                'meta_desc' => $a['meta'] ?? null,
            ]);
            if (array_key_exists('body', $a)) {
                $article->body = collect($a['body'])->map(function ($b) use ($mediaMap) {
                    if (is_string($b) && preg_match('/^\[img:([^\]|]+)\|?(.*)\]$/', $b, $mm) && isset($mediaMap[$mm[1]])) {
                        return '[img:'.$mediaMap[$mm[1]]['path'].($mm[2] !== '' ? '|'.$mm[2] : '').']';
                    }

                    return $b;
                })->all();
            }
            if ($media) {
                $article->image_path = $media['path'] ?? $article->image_path;
            }
            $article->updated_at = now()->startOfSecond();
            if ($existing && $article->updated_at->lte($existing->getOriginal('updated_at'))) {
                $article->updated_at = Carbon::parse($existing->getOriginal('updated_at'))->addSecond();
            }
            $article->save();
            $this->audit('Article « '.$article->title.' » — '.($oldStatus ?? 'nouveau').' → '.$article->status.' — sauvegarde confirmée');
            $saved[] = ['id' => $slug, 'updated' => $article->updated_at->toIso8601String()];
        }

        return $saved;
    }

    private function mergeFlash(array $items, ?string $loadedAt): array
    {
        $server = json_decode(DB::table('admin_data')->where('key', 'flash')->value('value') ?? '[]', true) ?: [];
        $serverById = collect($server)->keyBy('id');
        $submitted = collect($items)->pluck('id')->filter()->all();
        $base = $loadedAt ? Carbon::parse($loadedAt) : null;
        $out = [];

        foreach ($items as $f) {
            $id = $f['id'] ?? null;
            $old = $id ? ($serverById[$id] ?? null) : null;
            // la version serveur est plus récente (désactivée/modifiée par un autre admin) : la garder
            if ($old && ! empty($old['updated']) && Carbon::parse($old['updated'])->gt(Carbon::parse($f['updated'] ?? '2000-01-01'))) {
                $out[] = $old;

                continue;
            }
            $f['created'] = $f['created'] ?? ($old['created'] ?? ($old ? '2000-01-01' : now()->toIso8601String()));
            $out[] = $f;
        }

        // flash absent de l'état reçu mais ajouté après son chargement : le conserver
        foreach ($server as $f) {
            $id = $f['id'] ?? null;
            if (! $id || in_array($id, $submitted, true)) {
                continue;
            }
            $created = ! empty($f['created']) ? Carbon::parse($f['created']) : null;
            if ($created && $base && $created->gt($base)) {
                $out[] = $f;
            }
        }

        return $out;
    }

    private function resolveMedias(array $medias): array
    {
        $out = [];
        foreach ($medias as $m) {
            $data = $m['data'] ?? '';
            $name = $m['name'] ?? null;
            if (str_starts_with($data, 'data:image/') && preg_match('/^data:image\/([a-z0-9+.-]+);base64,(.+)$/is', $data, $mm)) {
                $bytes = base64_decode(preg_replace('/\s+/', '', $mm[2]), true);
                abort_unless(is_string($bytes) && strlen($bytes) <= 10 * 1024 * 1024, 422, 'Image invalide ou supérieure à 10 Mo.');
                $info = @getimagesizefromstring($bytes);
                $ext = match ($info['mime'] ?? '') {
                    'image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif', default => null,
                };
                abort_unless($ext && preg_match('/^[a-zA-Z0-9_-]+$/', $m['id'] ?? ''), 422, 'Format ou identifiant média invalide.');
                $file = 'medias/'.$m['id'].'.'.$ext;
                $abs = storage_path('app/public/'.$file);
                if (! is_file($abs)) {
                    if (! is_dir(dirname($abs))) {
                        mkdir(dirname($abs), 0775, true);
                    }
                    file_put_contents($abs, base64_decode(preg_replace('/\s+/', '', $mm[2])));
                }
                $out[$m['id']] = ['path' => $file, 'name' => $name];
            } elseif ($data) {
                $path = parse_url($data, PHP_URL_PATH) ?: '';
                $out[$m['id']] = ['img' => $data, 'name' => $name];
                if (str_starts_with($path, '/storage/') && ! str_contains($path, '..')) {
                    $out[$m['id']]['path'] = substr($path, 9);
                }
            }
        }

        return $out;
    }

    private function syncEvents(array $items): void
    {
        $ids = collect($items)->pluck('id')->filter()->all();
        foreach ($items as $e) {
            Event::updateOrCreate(['slug' => $e['id']], [
                'start_date' => $e['date'] ?? now(),
                'end_date' => $e['end'] ?? null,
                'title' => $e['title'] ?? 'Événement',
                'city' => $e['city'] ?? null,
                'country' => $e['country'] ?? null,
                'cat' => $e['cat'] ?? null,
                'desc' => $e['desc'] ?? null,
            ]);
        }

    }

    private function syncComments(array $items): void
    {
        $kept = [];
        foreach ($items as $c) {
            $data = [
                'author' => $c['author'] ?? 'Anonyme',
                'email' => $c['email'] ?? null,
                'text' => $c['text'] ?? '',
                'status' => $c['status'] ?? 'attente',
                'reply' => $c['reply'] ?? null,
            ];
            if (preg_match('/^c(\d+)$/', $c['id'] ?? '', $m) && ($comment = Comment::find($m[1]))) {
                $comment->update($data);
                $kept[] = (int) $m[1];
            } elseif (! empty($c['articleId'])) {
                $article = Article::where('slug', $c['articleId'])->first();
                if ($article) {
                    $comment = $article->comments()->create($data + ['article_id' => $article->id]);
                    $kept[] = $comment->id;
                }
            }
        }

    }

    private function syncSubscribers(array $items): void
    {
        $kept = [];
        foreach ($items as $sub) {
            $data = [
                'name' => $sub['name'] ?? null,
                'country' => $sub['country'] ?? null,
                'status' => $sub['status'] ?? 'actif',
            ];
            if (preg_match('/^s(\d+)$/', $sub['id'] ?? '', $m) && ($row = Subscriber::find($m[1]))) {
                $row->update($data);
                $kept[] = (int) $m[1];
            } elseif (! empty($sub['email'])) {
                $row = Subscriber::updateOrCreate(['email' => $sub['email']], $data);
                $kept[] = $row->id;
            }
        }

    }

    private function syncMessages(array $items): void
    {
        $kept = [];
        foreach ($items as $m) {
            if (preg_match('/^msg(\d+)$/', $m['id'] ?? '', $mm) && ($row = ContactMessage::find($mm[1]))) {
                $row->update(['read' => ! empty($m['read'])]);
                $kept[] = (int) $mm[1];
            }
        }

    }

    private function syncDebates(array $items): void
    {
        $kept = [];
        foreach ($items as $d) {
            $data = [
                'question' => $d['question'] ?? 'Question',
                'pour_text' => $d['pour']['text'] ?? '',
                'pour_who' => $d['pour']['who'] ?? '',
                'contre_text' => $d['contre']['text'] ?? '',
                'contre_who' => $d['contre']['who'] ?? '',
                'start_date' => $d['start'] ?? null,
                'end_date' => $d['end'] ?? null,
            ];
            if (preg_match('/^d(\d+)$/', $d['id'] ?? '', $m) && ($row = Debate::find($m[1]))) {
                $row->update($data);
                $kept[] = (int) $m[1];
            } else {
                $row = Debate::create($data);
                $kept[] = $row->id;
            }
        }

        $today = now()->toDateString();
        $current = Debate::where('start_date', '<=', $today)->where('end_date', '>=', $today)
            ->orderBy('start_date', 'desc')->first();
        Debate::query()->update(['is_current' => false]);
        $current?->update(['is_current' => true]);
    }

    private function syncUsers(array $items, ?User $me): void
    {
        $kept = [];
        foreach ($items as $u) {
            $data = [
                'name' => $u['name'] ?? 'Membre',
                'email' => $u['email'] ?? '',
                'role' => $u['role'] ?? 'journaliste',
                'status' => $u['status'] ?? 'actif',
            ];
            if (preg_match('/^u(\d+)$/', $u['id'] ?? '', $m) && ($row = User::find($m[1]))) {
                abort_if($row->id === $me?->id && ($data['role'] !== $row->role || $data['status'] !== 'actif'), 422,
                    'Vous ne pouvez pas retirer votre propre accès administrateur.');
                $row->update($data);
                $kept[] = (int) $m[1];
            } elseif (! empty($data['email'])) {
                try {
                    $row = User::updateOrCreate(
                        ['email' => $data['email']],
                        $data + ['password' => Hash::make(Str::random(24))]
                    );
                } catch (\Throwable $e) {
                    report($e);
                    $this->warnings[] = 'Création du compte '.$data['email'].' impossible : '.$e->getMessage();

                    continue;
                }
                if ($row->wasRecentlyCreated) {
                    try {
                        Mail::to($row->email)
                            ->send(new TeamInvitation($row));
                    } catch (\Throwable $e) {
                        report($e);
                        $this->warnings[] = 'Invitation non envoyée à '.$row->email.' : '.$e->getMessage();
                    }
                    if (in_array(config('mail.default'), ['log', 'array'], true)) {
                        $this->warnings[] = 'Le mailer est « '.config('mail.default').' » : configurez MAIL_MAILER=smtp dans le .env pour envoyer de vrais e-mails.';
                    }
                }
                $kept[] = $row->id;
            }
        }

    }
}
