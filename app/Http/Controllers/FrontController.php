<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Debate;
use App\Models\Event;
use App\Models\Region;
use App\Models\Rubrique;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class FrontController extends Controller
{
    private function pub()
    {
        return Article::published()->with(['rubrique', 'region'])->orderByDesc('published_at');
    }

    private function list($query)
    {
        return $query->get()->map->toPublicArray()->values();
    }

    private function meta(array $meta = []): array
    {
        return ['meta' => $meta + [
            'title' => 'Afriquinfos — L’actualité panafricaine, ni totems ni tabous',
            'description' => 'Afriquinfos, le média panafricain : politique, économie, sports, société, culture, opinion et l’actualité des six régions d’Afrique.',
        ]];
    }

    public function home()
    {
        $articles = $this->list($this->pub());
        $debate = Debate::current()->latest('id')->first();

        $flashRaw = json_decode(DB::table('admin_data')->where('key', 'flash')->value('value') ?? '[]', true) ?: [];
        $refs = collect($flashRaw)->pluck('articleId')->filter()->all();
        $ids = collect($refs)->map(fn ($s) => preg_replace('/^[a-z]+/', '', (string) $s))->filter(fn ($x) => ctype_digit((string) $x))->all();
        $linkedArts = Article::whereIn('slug', $refs)->orWhereIn('id', $ids)->get();
        $bySlug = $linkedArts->keyBy('slug');
        $byId = $linkedArts->keyBy('id');
        $today = now()->toDateString();
        $flashes = collect($flashRaw)
            ->filter(fn ($f) => ($f['active'] ?? true) && ($f['id'] ?? null)
                && (empty($f['start']) || $f['start'] <= $today)
                && (empty($f['end']) || $f['end'] >= $today))
            ->map(function ($f) use ($bySlug, $byId) {
                $ref = $f['articleId'] ?? '';
                $a = $bySlug[$ref] ?? $byId[(int) preg_replace('/^[a-z]+/', '', (string) $ref)] ?? null;
                return [
                    'id' => (string) $f['id'],
                    'text' => $f['text'] ?? $a?->title ?? '',
                    'url' => $a && $a->status === 'publie' ? route('article.show', $a->slug) : null,
                ];
            })
            ->filter(fn ($f) => $f['text'] !== '')
            ->values()->all();

        return Inertia::render('Home', [
            'articles' => $articles,
            'flashes' => $flashes,
            'events' => Event::upcoming()->limit(6)->get()->map(fn ($e) => [
                'slug' => $e->slug, 'start_date' => $e->start_date->format('Y-m-d'),
                'end_date' => $e->end_date?->format('Y-m-d'), 'title' => $e->title,
                'city' => $e->city, 'country' => $e->country, 'cat' => $e->cat, 'desc' => $e->desc,
            ]),
            'debate' => $debate ? [
                'id' => $debate->id,
                'question' => $debate->question,
                'pour' => ['text' => $debate->pour_text, 'who' => $debate->pour_who],
                'contre' => ['text' => $debate->contre_text, 'who' => $debate->contre_who],
                'base' => ['pour' => $debate->votes_pour, 'contre' => $debate->votes_contre],
            ] : null,
        ])->withViewData($this->meta([
            'canonical' => url('/'),
            'jsonld' => [
                ['@context' => 'https://schema.org', '@type' => 'NewsMediaOrganization', 'name' => 'Afriquinfos', 'url' => url('/'),
                    'logo' => asset('assets/img/logo-afriquinfos.png'), 'slogan' => 'Ni totems, ni tabous',
                    'sameAs' => ['https://www.facebook.com/afriquinfoscom/', 'https://x.com/AfriquinfosActu']],
                ['@context' => 'https://schema.org', '@type' => 'WebSite', 'name' => 'Afriquinfos', 'url' => url('/'), 'inLanguage' => 'fr',
                    'potentialAction' => ['@type' => 'SearchAction', 'target' => url('/recherche').'?q={search_term_string}', 'query-input' => 'required name=search_term_string']],
            ],
        ]));
    }

    public function rubrique(string $slug)
    {
        $rub = Rubrique::findOrFail($slug);
        if ($slug === 'portraits') {
            return redirect()->route('portraits', status: 301);
        }
        $articles = $this->list($this->pub()->where('rubrique_slug', $slug));
        $top = $this->list($this->pub()->orderByDesc('views'));

        return Inertia::render('Rubrique', [
            'mode' => 'rubrique',
            'slug' => $slug,
            'title' => $rub->label,
            'tagline' => $rub->tagline,
            'articles' => $articles,
            'top' => $top,
        ])->withViewData($this->meta([
            'title' => $rub->label.' — Afriquinfos',
            'description' => $rub->tagline,
            'canonical' => url('/rubrique/'.$slug),
        ]));
    }

    public function afriques(?string $region = null)
    {
        if ($region) {
            $reg = Region::findOrFail($region);
            $articles = $this->list($this->pub()->where('region_slug', $region));

            return Inertia::render('Rubrique', [
                'mode' => 'region',
                'slug' => $region,
                'title' => $reg->label,
                'tagline' => 'Toute l’actualité de la région, toutes rubriques confondues',
                'articles' => $articles,
                'top' => $this->list($this->pub()->orderByDesc('views')),
            ])->withViewData($this->meta([
                'title' => $reg->label.' — Afriquinfos',
                'description' => 'Toute l’actualité '.$reg->label.' : politique, économie, société, culture et sports de la région.',
                'canonical' => url('/afriques/'.$region),
            ]));
        }

        return Inertia::render('Rubrique', [
            'mode' => 'afriques',
            'slug' => 'afriques',
            'title' => 'Les Afriques',
            'tagline' => 'Six régions, une même exigence',
            'articles' => $this->list($this->pub()->whereNotNull('region_slug')),
            'top' => $this->list($this->pub()->orderByDesc('views')),
        ])->withViewData($this->meta([
            'title' => 'Les Afriques — Afriquinfos',
            'description' => 'L’actualité des six régions du continent : Afrique australe, centrale, de l’Est, du Nord, de l’Ouest et océan Indien.',
            'canonical' => url('/afriques'),
        ]));
    }

    public function article(string $slug)
    {
        $a = Article::published()->with(['rubrique', 'region'])->where('slug', $slug)->firstOrFail();
        $a->increment('views');
        $article = $a->toPublicArray();
        $sameRub = $this->pub()->where('rubrique_slug', $a->rubrique_slug)->get();
        $idx = $sameRub->search(fn ($x) => $x->id === $a->id);
        $related = $sameRub->reject(fn ($x) => $x->id === $a->id)->take(3)->map->toPublicArray()->values();
        $sameRegion = $a->region_slug
            ? $this->list($this->pub()->where('region_slug', $a->region_slug)->where('id', '!=', $a->id))->take(3)->values()
            : [];

        $canonical = route('article.show', $a->slug);
        $image = $a->image_path ? asset('storage/'.$a->image_path) : asset('assets/img/og-default.jpg');

        return Inertia::render('Article', [
            'article' => $article,
            'newer' => $idx > 0 ? $sameRub[$idx - 1]->toPublicArray() : null,
            'older' => $idx !== false && $idx < $sameRub->count() - 1 ? $sameRub[$idx + 1]->toPublicArray() : null,
            'related' => $related,
            'sameRegion' => $sameRegion,
            'comments' => $a->comments()->where('status', 'approuve')->latest()->get()->map(fn ($c) => [
                'author' => $c->author, 'text' => $c->text, 'reply' => $c->reply,
                'date' => $c->created_at?->toIso8601String(),
            ])->values(),
            'top' => $this->list($this->pub()->orderByDesc('views'))->take(5),
        ])->withViewData($this->meta([
            'title' => $a->title.' — Afriquinfos',
            'description' => $a->meta_desc ?: $a->chapo,
            'canonical' => $canonical,
            'og_type' => 'article',
            'image' => $image,
            'extra' => [
                'article:published_time' => optional($a->published_at)->toIso8601String(),
                'article:section' => $a->rubrique?->label,
            ],
            'jsonld' => [
                ['@context' => 'https://schema.org', '@type' => 'NewsArticle',
                    'mainEntityOfPage' => ['@type' => 'WebPage', '@id' => $canonical],
                    'headline' => $a->title, 'description' => $a->chapo, 'image' => [$image],
                    'datePublished' => optional($a->published_at)->toIso8601String(),
                    'dateModified' => $a->updated_at->toIso8601String(), 'inLanguage' => 'fr',
                    'author' => ['@type' => 'Person', 'name' => $a->author_name],
                    'articleSection' => $a->rubrique?->label, 'keywords' => implode(', ', $a->tags ?? []),
                    'publisher' => ['@type' => 'NewsMediaOrganization', 'name' => 'Afriquinfos',
                        'logo' => ['@type' => 'ImageObject', 'url' => asset('assets/img/logo-afriquinfos.png'), 'width' => 600, 'height' => 214]]],
            ],
        ]));
    }

    public function portraits()
    {
        $rub = Rubrique::find('portraits');

        return Inertia::render('Portraits', [
            'articles' => $this->list($this->pub()->where('rubrique_slug', 'portraits')),
            'tagline' => $rub?->tagline,
        ])->withViewData($this->meta([
            'title' => 'Portraits — Afriquinfos',
            'description' => $rub?->tagline,
            'canonical' => url('/portraits'),
        ]));
    }

    public function agendas()
    {
        return Inertia::render('Agendas', [
            'events' => Event::upcoming()->get()->map(fn ($e) => [
                'slug' => $e->slug, 'start_date' => $e->start_date->format('Y-m-d'),
                'end_date' => $e->end_date?->format('Y-m-d'), 'title' => $e->title,
                'city' => $e->city, 'country' => $e->country, 'cat' => $e->cat, 'desc' => $e->desc,
            ]),
        ])->withViewData($this->meta([
            'title' => 'Agendas — Afriquinfos',
            'description' => 'Les rendez-vous politiques, économiques, culturels et sportifs du continent.',
            'canonical' => url('/agendas'),
        ]));
    }

    public function recherche(Request $request)
    {
        return Inertia::render('Recherche', [
            'q' => $request->query('q', ''),
            'articles' => $this->list($this->pub()),
        ])->withViewData($this->meta([
            'title' => 'Recherche — Afriquinfos',
            'description' => 'Rechercher une actualité, un pays, un sujet sur Afriquinfos.',
            'canonical' => url('/recherche'),
            'robots' => 'noindex',
        ]));
    }

    public function legal(Request $request, string $page)
    {
        $titles = [
            'mentions-legales' => 'Mentions légales',
            'confidentialite' => 'Politique de confidentialité',
            'cookies' => 'Gestion des cookies',
        ];
        abort_unless(isset($titles[$page]), 404);

        return Inertia::render('Legal', [
            'page' => $page,
            'title' => $titles[$page],
        ])->withViewData($this->meta([
            'title' => $titles[$page].' — Afriquinfos',
            'description' => $titles[$page].' du média panafricain Afriquinfos.',
            'canonical' => url('/'.$page),
        ]));
    }

    public function contact(Request $request)
    {
        return Inertia::render('Contact', [
            'sujet' => $request->query('sujet', ''),
        ])->withViewData($this->meta([
            'title' => 'Contact — Afriquinfos',
            'description' => 'Contactez la rédaction ou la régie publicitaire d’Afriquinfos.',
            'canonical' => url('/contact'),
        ]));
    }
}
