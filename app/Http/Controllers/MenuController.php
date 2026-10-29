<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use Illuminate\View\View;

class MenuController extends Controller
{
    /**
     * @return array<string, array{title: string, surtitle: string, h1: string, subtitle: string, meta: string, image: string, route: string, note: string}>
     */
    private static function pages(): array
    {
        return [
            MenuItem::MENU_CARTE => [
                'title' => 'La carte bistronomique — Le Cercle',
                'surtitle' => 'Notre Carte',
                'h1' => 'La carte bistronomique.',
                'subtitle' => 'Une cuisine précise, généreuse et sincère.',
                'meta' => 'Découvrez la carte du restaurant Le Cercle : entrées, plats, desserts et boissons soigneusement sélectionnés.',
                'image' => 'cercle/assiette-jardin.jpg',
                'route' => 'menu',
                'note' => 'Prix en FCFA, service compris. Les pièces du boucher sont servies avec un accompagnement libre ; accompagnements supplémentaires 4 000 FCFA.',
            ],
            MenuItem::MENU_TAPAS => [
                'title' => 'La carte à tapas (en terrasse uniquement) — Le Cercle',
                'surtitle' => 'L’Esprit Terrasse',
                'h1' => 'La carte à tapas.',
                'subtitle' => 'En terrasse uniquement — petites assiettes, grandes saveurs.',
                'meta' => 'La carte à tapas du restaurant Le Cercle, servie en terrasse uniquement : côté végétal, côté mer, côté terre, et grandes planches conçues pour deux.',
                'image' => 'cercle/tapas-palme.jpg',
                'route' => 'menu.tapas',
                'note' => 'Carte servie en terrasse uniquement. Prix en FCFA, service compris. Les planches sont conçues pour deux personnes.',
            ],
            MenuItem::MENU_BOISSONS => [
                'title' => 'La carte des boissons — Le Cercle',
                'surtitle' => 'Carte des Boissons',
                'h1' => 'La carte des boissons.',
                'subtitle' => 'Vins, champagnes, spiritueux, cocktails : une cave qui voyage, de la Bourgogne à l’Écosse.',
                'meta' => 'La carte des vins du restaurant Le Cercle : champagnes, vins de France, whiskies, rhums, cognacs, cocktails et boissons.',
                'image' => 'cercle/cave.jpg',
                'route' => 'menu.drinks',
                'note' => 'Prix en FCFA, service compris. Prix bouteille et prix au verre indiqués lorsque disponibles. L’abus d’alcool est dangereux pour la santé, à consommer avec modération.',
            ],
        ];
    }

    public function __invoke(string $menu = MenuItem::MENU_CARTE): View
    {
        abort_unless(array_key_exists($menu, self::pages()), 404);

        $items = MenuItem::where('is_active', true)
            ->whereIn('category', array_keys(MenuItem::categoriesForMenu($menu)))
            ->orderBy('sort_order')
            ->get()
            ->groupBy('category');

        return view('menu', [
            'menuItems' => $items,
            'categories' => MenuItem::categoriesForMenu($menu),
            'page' => self::pages()[$menu],
            'menuKey' => $menu,
            'menuLinks' => [
                MenuItem::MENU_CARTE => ['label' => 'La carte bistronomique', 'note' => null, 'route' => route('menu')],
                MenuItem::MENU_TAPAS => ['label' => 'La carte à tapas', 'note' => 'En terrasse uniquement', 'route' => route('menu.tapas')],
                MenuItem::MENU_BOISSONS => ['label' => 'La carte des boissons', 'note' => null, 'route' => route('menu.drinks')],
            ],
        ]);
    }
}
