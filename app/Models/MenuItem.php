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
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public const CATEGORY_STARTERS = 'starters';

    public const CATEGORY_MAINS = 'mains';

    public const CATEGORY_DESSERTS = 'desserts';

    public const CATEGORY_DRINKS = 'drinks';

    public static function categories(): array
    {
        return [
            self::CATEGORY_STARTERS => 'Entrées',
            self::CATEGORY_MAINS => 'Plats',
            self::CATEGORY_DESSERTS => 'Desserts',
            self::CATEGORY_DRINKS => 'Boissons',
        ];
    }

    public function categoryLabel(): string
    {
        return self::categories()[$this->category] ?? $this->category;
    }

    public function formattedPrice(): string
    {
        if ($this->price === null) {
            return $this->price_note ?? '';
        }

        return number_format($this->price, 0, ',', ' ').' FCFA';
    }
}
