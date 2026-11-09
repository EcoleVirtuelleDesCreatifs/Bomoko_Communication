<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Region;
use App\Models\Rubrique;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Date;

class SeoController extends Controller
{
    public function rss()
    {
        $articles = Article::published()->with('rubrique')->orderByDesc('published_at')->limit(30)
            ->get(['slug', 'title', 'chapo', 'rubrique_slug', 'author_name', 'published_at']);

        $items = $articles->map(function ($a) {
            return '    <item>'."\n"
                .'      <title>'.e($a->title).'</title>'."\n"
                .'      <link>'.route('article.show', $a->slug).'</link>'."\n"
                .'      <guid isPermaLink="true">'.route('article.show', $a->slug).'</guid>'."\n"
                .'      <description>'.e($a->chapo).'</description>'."\n"
                .'      <category>'.e($a->rubrique?->label).'</category>'."\n"
                .'      <dc:creator>'.e($a->author_name).'</dc:creator>'."\n"
                .'      <pubDate>'.optional($a->published_at)->toRfc2822String().'</pubDate>'."\n"
                .'    </item>';
        })->implode("\n");

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n"
            .'<?xml-stylesheet type="text/xsl" href="'.asset('assets/rss.xsl').'"?>'."\n"
            .'<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">'."\n"
            ."  <channel>\n"
            .'    <title>Afriquinfos</title>'."\n"
            .'    <link>'.url('/').'</link>'."\n"
            .'    <atom:link href="'.url('/rss.xml').'" rel="self" type="application/rss+xml"/>'."\n"
            .'    <description>Ni totems, ni tabous. L’actualité panafricaine.</description>'."\n"
            ."    <language>fr</language>\n"
            .'    <lastBuildDate>'.Date::now()->toRfc2822String().'</lastBuildDate>'."\n"
            .$items."\n  </channel>\n</rss>";

        return response($xml, 200, ['Content-Type' => 'application/rss+xml; charset=UTF-8']);
    }

    public function robots()
    {
        $txt = "User-agent: *\n"
            ."Allow: /\n"
            ."Disallow: /admin\n"
            ."Disallow: /recherche\n"
            ."Disallow: /*?sujet=\n"
            ."Disallow: /*?_=\n"
            ."Disallow: /admin/api\n"
            ."\n"
            .'Sitemap: '.url('/sitemap.xml')."\n";

        return response($txt, 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }

    public function llms()
    {
        $md = "# Afriquinfos\n\n"
            ."> Média panafricain francophone : politique, économie, sports, société, culture et opinion sur les six régions du continent africain. Slogan : « Ni totems, ni tabous. »\n\n"
            ."Site : ".url('/').". Contenu en français. Les URLs canoniques sont celles servies par APP_URL.\n\n"
            ."## Rubriques\n\n"
            .Rubrique::orderBy('sort')->get()->map(fn ($r) => '- ['.$r->label.']('.url('/rubrique/'.$r->slug).')'.($r->tagline ? ' : '.$r->tagline : ''))->implode("\n")
            ."\n\n## Régions couvertes\n\n"
            .Region::orderBy('sort')->get()->map(fn ($r) => '- ['.$r->label.']('.url('/afriques/'.$r->slug).')')->implode("\n")
            ."\n\n## Pages utiles\n\n"
            .'- [Accueil]('.url('/').")\n"
            .'- [Portraits]('.url('/portraits').") : personnalités qui font l’actualité africaine\n"
            .'- [Agendas]('.url('/agendas').") : sommets, élections et événements à venir\n"
            .'- [Flux RSS]('.url('/rss.xml').")\n"
            .'- [Plan du site]('.url('/sitemap.xml').")\n"
            .'- [Contact]('.url('/contact').")\n"
            ."\n## Articles récents\n\n"
            .Article::published()->orderByDesc('published_at')->limit(30)->get(['slug', 'title', 'chapo'])
                ->map(fn ($a) => '- ['.str_replace(']', ')', $a->title).']('.route('article.show', $a->slug).')'.($a->chapo ? ' : '.mb_strimwidth($a->chapo, 0, 140, '…') : ''))->implode("\n")
            ."\n";

        return response($md, 200, ['Content-Type' => 'text/markdown; charset=UTF-8']);
    }

    public function sitemap()
    {
        $pages = max(1, (int) ceil(Article::published()->count() / 5000));
        $locations = [route('sitemap.pages')];
        for ($page = 1; $page <= $pages; $page++) {
            $locations[] = route('sitemap.articles', ['page' => $page]);
        }
        $body = collect($locations)->map(fn ($url) => '<sitemap><loc>'.e($url).'</loc></sitemap>')->implode("\n");

        return response('<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'.$body.'</sitemapindex>', 200,
            ['Content-Type' => 'application/xml; charset=UTF-8']);
    }

    public function articles(int $page)
    {
        $pages = max(1, (int) ceil(Article::published()->count() / 5000));
        abort_if($page < 1 || $page > $pages, 404);
        $urls = Article::published()->orderBy('id')->offset(($page - 1) * 5000)->limit(5000)
            ->get(['slug', 'image_path', 'updated_at'])->map(fn ($a) => [
                'loc' => route('article.show', $a->slug), 'lastmod' => $a->updated_at?->toW3cString(),
                'freq' => 'daily', 'priority' => '0.9', 'img' => $a->image_path ? asset('storage/'.$a->image_path) : null,
            ])->all();

        return $this->urlset($urls);
    }

    public function pages()
    {
        $latest = Article::published()->max('updated_at');
        $lastmod = $latest ? Carbon::parse($latest)->toW3cString() : now()->toW3cString();
        $urls = [
            ['loc' => url('/'), 'priority' => '1.0', 'freq' => 'hourly', 'lastmod' => $lastmod],
            ['loc' => url('/afriques'), 'priority' => '0.8', 'freq' => 'hourly'],
            ['loc' => url('/portraits'), 'priority' => '0.7', 'freq' => 'daily'],
            ['loc' => url('/agendas'), 'priority' => '0.6', 'freq' => 'daily'],
            ['loc' => url('/contact'), 'priority' => '0.3', 'freq' => 'monthly'],
            ['loc' => url('/mentions-legales'), 'priority' => '0.2', 'freq' => 'yearly'],
            ['loc' => url('/confidentialite'), 'priority' => '0.2', 'freq' => 'yearly'],
            ['loc' => url('/cookies'), 'priority' => '0.2', 'freq' => 'yearly'],
        ];

        foreach (Rubrique::where('slug', '!=', 'portraits')->get() as $r) {
            $urls[] = ['loc' => url('/rubrique/'.$r->slug), 'priority' => '0.8', 'freq' => 'hourly'];
        }
        foreach (Region::all() as $r) {
            $urls[] = ['loc' => url('/afriques/'.$r->slug), 'priority' => '0.7', 'freq' => 'hourly'];
        }

        return $this->urlset($urls);
    }

    private function urlset(array $urls)
    {
        $body = collect($urls)->map(function ($u) {
            return "  <url>\n    <loc>".e($u['loc'])."</loc>\n"
                .(isset($u['lastmod']) ? '    <lastmod>'.$u['lastmod']."</lastmod>\n" : '')
                .'    <changefreq>'.$u['freq']."</changefreq>\n"
                .'    <priority>'.$u['priority']."</priority>\n"
                .(! empty($u['img']) ? '    <image:image><image:loc>'.e($u['img']).'</image:loc></image:image>'."\n" : '')
                .'  </url>';
        })->implode("\n");

        $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n"
            .'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">'."\n".$body."\n</urlset>";

        return response($xml, 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
    }
}
