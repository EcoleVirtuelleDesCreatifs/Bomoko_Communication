<?php

namespace App\Models;

use Database\Factories\ReservationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    /** @use HasFactory<ReservationFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'date',
        'time',
        'guests',
        'menu_choice',
        'allergies',
        'message',
        'status',
    ];

    public const MENU_ON_SITE = 'on_site';

    public const MENU_DISCOVERY = 'discovery';

    public const MENU_TASTING = 'tasting';

    public const MENU_VEGETARIAN = 'vegetarian';

    public static function menuChoices(): array
    {
        return [
            self::MENU_ON_SITE => 'Je choisirai sur place',
            self::MENU_DISCOVERY => 'Menu Découverte',
            self::MENU_TASTING => 'Menu Dégustation',
            self::MENU_VEGETARIAN => 'Menu Végétarien',
        ];
    }

    public function menuChoiceLabel(): ?string
    {
        return self::menuChoices()[$this->menu_choice] ?? null;
    }

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'guests' => 'integer',
        ];
    }

    public const STATUS_PENDING = 'pending';

    public const STATUS_CONFIRMED = 'confirmed';

    public const STATUS_CANCELLED = 'cancelled';

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    public function isConfirmed(): bool
    {
        return $this->status === self::STATUS_CONFIRMED;
    }

    public function isCancelled(): bool
    {
        return $this->status === self::STATUS_CANCELLED;
    }
}
