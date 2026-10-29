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
                'title' => 'La Carte — Le Cercle',
                'surtitle' => 'Notre Carte',
                'h1' => 'La carte.',
                'subtitle' => 'Une cuisine précise, généreuse et sincère.',
                'meta' => 'Découvrez la carte du restaurant Le Cercle : entrées, plats, desserts et boissons soigneusement sélectionnés.',
                'image' => 'section/menu4.jpg',
                'route' => 'menu',
                'note' => 'Prix en FCFA, service compris. Les pièces du boucher sont servies avec un accompagnement libre ; accompagnements supplémentaires 4 000 FCFA.',
            ],
            MenuItem::MENU_TAPAS => [
                'title' => 'L’Esprit Terrasse — Tapas & planches — Le Cercle',
                'surtitle' => 'L’Esprit Terrasse',
                'h1' => 'Tapas & planches.',
                'subtitle' => 'Petites assiettes, grandes saveurs.',
                'meta' => 'Tapas et planches à partager au restaurant Le Cercle : côté végétal, côté mer, côté terre, et grandes planches conçues pour deux.',
                'image' => 'section/gallery-13.jpg',
                'route' => 'menu.tapas',
                'note' => 'Prix en FCFA, service compris. Les planches sont conçues pour deux personnes.',
            ],
            MenuItem::MENU_BOISSONS => [
                'title' => 'Carte des Vins & Boissons — Le Cercle',
                'surtitle' => 'Carte des Vins',
                'h1' => 'Vins, champagnes, spiritueux & boissons.',
                'subtitle' => 'Une cave qui voyage, de la Bourgogne à l’Écosse.',
                'meta' => 'La carte des vins du restaurant Le Cercle : champagnes, vins de France, whiskies, rhums, cognacs, cocktails et boissons.',
                'image' => 'section/gallery-1.jpg',
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
                MenuItem::MENU_CARTE => ['label' => 'La Carte', 'route' => route('menu')],
                MenuItem::MENU_TAPAS => ['label' => 'Tapas & planches', 'route' => route('menu.tapas')],
                MenuItem::MENU_BOISSONS => ['label' => 'Vins & boissons', 'route' => route('menu.drinks')],
            ],
        ]);
    }
}
