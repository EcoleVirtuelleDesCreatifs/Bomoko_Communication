<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Comment;
use App\Models\Debate;
use App\Models\Event;
use App\Models\Region;
use App\Models\Rubrique;
use App\Models\Subscriber;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

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
        $a = Article::where('slug', $slug)->firstOrFail();

        return response()->json([
            'body' => $a->body ?? [],
            'person' => $a->person,
            'image_path' => $a->image_path,
        ]);
    }

    private function state(): array
    {
        $blob = DB::table('admin_data')->pluck('value', 'key')
            ->map(fn ($v) => json_decode($v, true))->all();

        $state = [
            'v' => 1,
            'users' => User::all()->map(fn ($u) => [
                'id' => 'u'.$u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role ?? 'journaliste',
                'status' => $u->status ?? 'actif',
                'last' => optional($u->last_login_at)->toIso8601String() ?? now()->toIso8601String(),
            ])->values()->all(),
            'rubriques' => Rubrique::all()->map(fn ($r) => [
                'id' => $r->slug, 'label' => $r->label, 'tagline' => $r->tagline,
                'menu' => (bool) $r->in_menu, 'order' => $r->sort,
            ])->values()->all(),
            'regions' => Region::all()->map(fn ($r) => [
                'id' => $r->slug, 'label' => $r->label, 'order' => $r->sort,
            ])->values()->all(),
            'articles' => Article::orderByDesc('published_at')->limit(1500)
                ->get(['id', 'slug', 'rubrique_slug', 'region_slug', 'country', 'ph', 'img',
                       'image_path', 'views', 'title', 'chapo', 'author_name', 'published_at',
                       'updated_at', 'read_time', 'tags', 'status', 'meta_desc', 'is_une',
                       'person', 'icon', 'media_id'])
                ->map(fn ($a) => array_filter([
                'id' => $a->slug,
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
            ], fn ($v) => $v !== null))->values()->all(),
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
            'messages' => \App\Models\ContactMessage::latest()->limit(200)->get()->map(fn ($m) => [
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

        return $state;
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
            'medias' => Article::whereNotNull('img')->pluck('img')->unique()->values()
                ->map(fn ($img, $i) => [
                    'id' => 'm'.$i,
                    'name' => mb_convert_encoding(basename(parse_url($img, PHP_URL_PATH) ?: 'media-'.$i), 'UTF-8', 'UTF-8'),
                    'ph' => 'ink',
                    'data' => mb_convert_encoding($img, 'UTF-8', 'UTF-8'),
                ])->all(),
            'history' => null,
            default => [],
        };
    }

    public function save(Request $request)
    {
        $s = $request->json()->all();
        $this->warnings = [];

        try {
            DB::transaction(function () use ($s, $request) {
                $this->syncRubriques($s['rubriques'] ?? []);
                $this->syncRegions($s['regions'] ?? []);
                $this->syncArticles($s['articles'] ?? [], $s['medias'] ?? []);
                $this->syncEvents($s['agenda'] ?? []);
                $this->syncComments($s['comments'] ?? []);
                $this->syncSubscribers($s['subscribers'] ?? []);
                $this->syncMessages($s['messages'] ?? []);
                $this->syncDebates($s['debats'] ?? []);
                $this->syncUsers($s['users'] ?? [], $request->user());

                foreach (self::BLOB_KEYS as $key) {
                    if (! array_key_exists($key, $s)) {
                        continue;
                    }
                    DB::table('admin_data')->updateOrInsert(
                        ['key' => $key],
                        ['value' => json_encode($s[$key], JSON_UNESCAPED_UNICODE), 'updated_at' => now()]
                    );
                }
            });
        } catch (\Throwable $e) {
            report($e);

            return response()->json(['ok' => false, 'error' => $e->getMessage()], 500);
        }

        return response()->json(['ok' => true, 'warnings' => $this->warnings]);
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
        Rubrique::whereNotIn('slug', $ids)
            ->whereNotIn('slug', Article::pluck('rubrique_slug'))->delete();
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
        Region::whereNotIn('slug', $ids)
            ->whereNotIn('slug', Article::whereNotNull('region_slug')->pluck('region_slug'))->delete();
    }

    private function syncArticles(array $items, array $medias = []): void
    {
        $mediaMap = $this->resolveMedias($medias);
        $ids = collect($items)->pluck('id')->filter()->all();
        foreach ($items as $a) {
            $media = $mediaMap[$a['mediaId'] ?? ''] ?? null;
            $slug = $a['slug'] ?? $a['id'] ?? Str::slug($a['title'] ?? 'article');
            $article = Article::where('slug', $a['id'] ?? '')->orWhere('slug', $slug)->first()
                ?? new Article(['slug' => $a['id'] ?? $slug]);
            $article->fill([
                'slug' => $a['id'] ?? $slug,
                'rubrique_slug' => $a['rub'] ?? $article->rubrique_slug ?? 'politique',
                'region_slug' => $a['region'] ?? null,
                'country' => $a['country'] ?? null,
                'title' => $a['title'] ?? 'Sans titre',
                'chapo' => $a['chapo'] ?? null,
                'author_name' => $a['author'] ?? null,
                'published_at' => $a['date'] ?? null,
                'read_time' => $a['read'] ?? 4,
                'tags' => $a['tags'] ?? [],
                'ph' => $a['ph'] ?? 'ink',
                'img' => $media ? ($media['img'] ?? $media['name'] ?? null) : ($a['img'] ?? $article->img),
                'icon' => $a['icon'] ?? null,
                'person' => $a['person'] ?? null,
                'media_id' => $a['mediaId'] ?? $article->media_id,
                'views' => $a['views'] ?? 0,
                'is_une' => ! empty($a['une']),
                'status' => $a['status'] ?? 'brouillon',
                'meta_desc' => $a['meta'] ?? null,
            ]);
            if (array_key_exists('body', $a)) {
                $article->body = $a['body'];
            }
            if ($media) {
                $article->image_path = $media['path'] ?? null;
            }
            if (! empty($a['updated'])) {
                $article->updated_at = $a['updated'];
            }
            $article->save();
        }
    }

    private function resolveMedias(array $medias): array
    {
        $out = [];
        foreach ($medias as $m) {
            $data = $m['data'] ?? '';
            $name = $m['name'] ?? null;
            if (str_starts_with($data, 'data:image/') && preg_match('/^data:image\/([a-z0-9+.-]+);base64,(.+)$/is', $data, $mm)) {
                $ext = strtolower($mm[1]) === 'jpeg' ? 'jpg' : strtolower($mm[1]);
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
                $out[$m['id']] = ['img' => $data, 'name' => $name];
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
        Event::whereNotIn('slug', $ids)->delete();
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
        Comment::whereNotIn('id', $kept ?: [0])->delete();
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
        Subscriber::whereNotIn('id', $kept ?: [0])->delete();
    }

    private function syncMessages(array $items): void
    {
        $kept = [];
        foreach ($items as $m) {
            if (preg_match('/^msg(\d+)$/', $m['id'] ?? '', $mm) && ($row = \App\Models\ContactMessage::find($mm[1]))) {
                $row->update(['read' => ! empty($m['read'])]);
                $kept[] = (int) $mm[1];
            }
        }
        $window = \App\Models\ContactMessage::latest()->limit(200)->pluck('id');
        \App\Models\ContactMessage::whereIn('id', $window)->whereNotIn('id', $kept ?: [0])->delete();
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
                'votes_pour' => $d['votes']['pour'] ?? 0,
                'votes_contre' => $d['votes']['contre'] ?? 0,
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
        Debate::whereNotIn('id', $kept ?: [0])->delete();

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
                if ($row->wasRecentlyCreated || ($u['status'] ?? '') === 'invite') {
                    try {
                        \Illuminate\Support\Facades\Mail::to($row->email)
                            ->send(new \App\Mail\TeamInvitation($row));
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
        User::whereNotIn('id', $kept ?: [0])
            ->when($me, fn ($q) => $q->where('id', '!=', $me->id))
            ->delete();
    }
}
