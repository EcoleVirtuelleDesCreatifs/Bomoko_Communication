<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function __invoke(): Response
    {
        $urls = [
            ['loc' => route('home'), 'priority' => '1.0', 'changefreq' => 'weekly'],
            ['loc' => route('menu'), 'priority' => '0.9', 'changefreq' => 'weekly'],
            ['loc' => route('reservation'), 'priority' => '0.9', 'changefreq' => 'monthly'],
            ['loc' => route('gallery'), 'priority' => '0.6', 'changefreq' => 'monthly'],
            ['loc' => route('legal.notice'), 'priority' => '0.3', 'changefreq' => 'yearly'],
            ['loc' => route('legal.privacy'), 'priority' => '0.3', 'changefreq' => 'yearly'],
        ];

        foreach (Event::published()->latest('published_at')->get() as $event) {
            $urls[] = [
                'loc' => route('events.show', $event),
                'priority' => '0.8',
                'changefreq' => 'monthly',
                'lastmod' => $event->updated_at->toDateString(),
            ];
        }

        return response()->view('sitemap', ['urls' => $urls])
            ->header('Content-Type', 'text/xml');
    }
}
