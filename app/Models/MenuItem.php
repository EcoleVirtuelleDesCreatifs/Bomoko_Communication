<?php

namespace App\Models;

use Database\Factories\MenuItemFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MenuItem extends Model
{
    /** @use HasFactory<MenuItemFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'price',
        'price_glass',
        'price_note',
        'category',
        'section',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'price_glass' => 'integer',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public const CATEGORY_STARTERS = 'starters';

    public const CATEGORY_MAINS = 'mains';

    public const CATEGORY_DESSERTS = 'desserts';

    public const CATEGORY_TAPAS = 'tapas';

    public const CATEGORY_BOARDS = 'boards';

    public const CATEGORY_CHAMPAGNES = 'champagnes';

    public const CATEGORY_WHITE_WINES = 'white_wines';

    public const CATEGORY_RED_WINES = 'red_wines';

    public const CATEGORY_ROSE_WINES = 'rose_wines';

    public const CATEGORY_WHISKIES = 'whiskies';

    public const CATEGORY_RUMS = 'rums';

    public const CATEGORY_BRANDIES = 'brandies';

    public const CATEGORY_SPIRITS = 'spirits';

    public const CATEGORY_APERITIFS = 'aperitifs';

    public const CATEGORY_COCKTAILS = 'cocktails';

    public const CATEGORY_MOCKTAILS = 'mocktails';

    public const CATEGORY_SHOOTERS = 'shooters';

    public const CATEGORY_DRINKS = 'drinks';

    public const MENU_CARTE = 'carte';

    public const MENU_TAPAS = 'tapas';

    public const MENU_BOISSONS = 'boissons';

    /**
     * @return array<string, string>
     */
    public static function menus(): array
    {
        return [
            self::MENU_CARTE => 'La Carte',
            self::MENU_TAPAS => 'L’Esprit Terrasse',
            self::MENU_BOISSONS => 'Vins & Boissons',
        ];
    }

    /**
     * @return array<string, string>
     */
    public static function categoriesForMenu(string $menu): array
    {
        return match ($menu) {
            self::MENU_TAPAS => [
                self::CATEGORY_TAPAS => 'Les Tapas',
                self::CATEGORY_BOARDS => 'Les Planches à partager',
            ],
            self::MENU_BOISSONS => [
                self::CATEGORY_CHAMPAGNES => 'Champagnes',
                self::CATEGORY_WHITE_WINES => 'Vins blancs',
                self::CATEGORY_RED_WINES => 'Vins rouges',
                self::CATEGORY_ROSE_WINES => 'Vins rosés',
                self::CATEGORY_WHISKIES => 'Whiskies',
                self::CATEGORY_RUMS => 'Rhums',
                self::CATEGORY_BRANDIES => 'Cognacs, Armagnacs & Calvados',
                self::CATEGORY_SPIRITS => 'Vodkas, Gins, Téquilas & Mezcals',
                self::CATEGORY_APERITIFS => 'Apéritifs, Liqueurs & Digestifs',
                self::CATEGORY_COCKTAILS => 'Cocktails',
                self::CATEGORY_MOCKTAILS => 'Mocktails',
                self::CATEGORY_SHOOTERS => 'Shooters',
                self::CATEGORY_DRINKS => 'Eaux, Softs & Bières',
            ],
            default => [
                self::CATEGORY_STARTERS => 'Entrées',
                self::CATEGORY_MAINS => 'Plats',
                self::CATEGORY_DESSERTS => 'Desserts',
            ],
        };
    }

    public static function menuForCategory(string $category): string
    {
        foreach (array_keys(self::menus()) as $menu) {
            if (array_key_exists($category, self::categoriesForMenu($menu))) {
                return $menu;
            }
        }

        return self::MENU_CARTE;
    }

    /**
     * @return array<string, string>
     */
    public static function categories(): array
    {
        return array_merge(
            self::categoriesForMenu(self::MENU_CARTE),
            self::categoriesForMenu(self::MENU_TAPAS),
            self::categoriesForMenu(self::MENU_BOISSONS),
        );
    }

    public function categoryLabel(): string
    {
        return self::categories()[$this->category] ?? $this->category;
    }

    public function formattedPrice(): string
    {
        if ($this->price === null) {
            if ($this->price_note !== null) {
                return $this->price_note;
            }

            if ($this->price_glass !== null) {
                return 'Verre '.$this->formattedGlassPrice();
            }

            return '';
        }

        $formatted = number_format($this->price, 0, ',', ' ').' FCFA';

        if ($this->price_glass !== null) {
            return 'Bouteille '.$formatted.' · Verre '.$this->formattedGlassPrice();
        }

        return $formatted;
    }

    public function formattedGlassPrice(): string
    {
        if ($this->price_glass === null) {
            return '';
        }

        return number_format($this->price_glass, 0, ',', ' ').' FCFA';
    }
}
