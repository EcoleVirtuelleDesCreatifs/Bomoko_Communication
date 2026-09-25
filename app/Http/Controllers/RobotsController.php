<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use Illuminate\Http\Response;

class RobotsController extends Controller
{
    public function __invoke(): Response
    {
        $lines = [
            'User-agent: *',
            'Allow: /',
            'Disallow: /admin/',
            '',
        ];

        foreach ([
            'GPTBot',
            'ChatGPT-User',
            'OAI-SearchBot',
            'ClaudeBot',
            'anthropic-ai',
            'Claude-Web',
            'PerplexityBot',
            'Google-Extended',
            'Applebot-Extended',
            'Bingbot',
            'DuckDuckBot',
            'YandexBot',
            'Baiduspider',
            'CCBot',
            'Amazonbot',
            'meta-externalagent',
        ] as $bot) {
            $lines[] = "User-agent: {$bot}";
            $lines[] = 'Allow: /';
            $lines[] = '';
        }

        $lines[] = 'Sitemap: '.route('sitemap');

        return response(implode("\n", $lines)."\n")
            ->header('Content-Type', 'text/plain');
    }

    public function llms(): Response
    {
        $items = MenuItem::where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->groupBy('category');

        $lines = [
            '# Le Cercle',
            '',
            '> Restaurant bistronomique confidentiel aux Deux Plateaux Vallons, Abidjan, Côte d\'Ivoire. Cuisine française réinterprétée, villa élégante, jardin et piscine.',
            '',
            '## Informations',
            '',
            '- Adresse : '.config('site.address_line').', '.config('site.city'),
            '- Téléphone : '.config('site.phone'),
            '- Horaires : '.config('site.opening_hours'),
            '',
            '## Pages',
            '',
            '- [Accueil]('.route('home').')',
            '- [La Carte]('.route('menu').')',
            '- [Événements & Actualités]('.route('events.index').')',
            '- [Réservation]('.route('reservation').')',
            '- [Mentions légales]('.route('legal.notice').')',
            '- [Politique de confidentialité]('.route('legal.privacy').')',
            '',
            '## La Carte',
            '',
        ];

        foreach (MenuItem::categories() as $key => $label) {
            $categoryItems = $items->get($key, collect());

            if ($categoryItems->isEmpty()) {
                continue;
            }

            $lines[] = "### {$label}";
            $lines[] = '';

            foreach ($categoryItems as $item) {
                $line = "- {$item->name} — {$item->formattedPrice()}";

                if ($item->description) {
                    $line .= " : {$item->description}";
                }

                $lines[] = $line;
            }

            $lines[] = '';
        }

        return response(implode("\n", $lines))
            ->header('Content-Type', 'text/plain; charset=UTF-8');
    }
}
